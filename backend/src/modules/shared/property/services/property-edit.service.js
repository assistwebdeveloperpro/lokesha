const fs = require("fs/promises");
const { db } = require("../../../../config/db");
const editRepository = require("../repositories/property-edit.repository");
const readRepository = require("../repositories/property-read.repository");
const filesService = require("./property-files.service");
const writeRepository = require("../repositories/property-write.repository");
const writer = require("./property-listing.writer");
const mapper = require("../mappers/property.mapper");
const { changeStatus, markEdited } = require("./property-status.service");
const { validateCompletePayload } = require("../validation/property-payload.validation");
const { AppError, validationError } = require("../utils/property.errors");
const { LIMITS, PROPERTY_TYPE_TO_DB, getRule } = require("../constants/property.constants");
const { isAdminCaller, toStatusActor } = require("../utils/property-actor.util");

const MAX_FLOOR_PLANS = 20;
const SUBMITTABLE_STATUSES = ["draft", "rejected", "closed"];
const ADMIN_SUBMITTABLE_STATUSES = ["draft", "closed"];
const DEFAULT_PLAN_TYPE = "2d";

const toActor = toStatusActor;

// Admins are not limited to their own listings, so no owner id is applied
const toOwnerId = (user) => (isAdminCaller(user) ? undefined : user.id);

async function lockOwnedProperty(trx, propertyId, user) {
  const property = await editRepository.findPropertyForUpdate(trx, propertyId, toOwnerId(user));
  if (!property) {
    throw new AppError("Property not found", 404);
  }
  return property;
}

// Admins can edit any listing, but only publish and close the ones they created
function assertCanChangeStatus(user, property) {
  if (isAdminCaller(user) && property.admin_id !== user.adminId) {
    throw new AppError("You can only change the status of listings created by admins", 403);
  }
}

// A single listing may change its sub type; a post with several keeps the sub types it was posted with
function findListingCountError(value, members) {
  if (members.length === 1) {
    return value.listings.length === 1 ? {} : { listings: "Exactly one listing can be edited at a time" };
  }

  const wanted = value.listings.map((listing) => listing.propertySubType).sort();
  const posted = members.map((member) => member.sub_type_slug).sort();
  return wanted.length === posted.length && wanted.every((slug, index) => slug === posted[index])
    ? {}
    : { listings: "Every sub type of this property must be edited together" };
}

// Files are managed by their own endpoints, so an edit never touches them
async function updateProperty(user, propertyId, { payload }) {
  const existing = await readRepository.findOwnedProperty(propertyId, toOwnerId(user));
  if (!existing) {
    throw new AppError("Property not found", 404);
  }
  const members = [existing, ...((await readRepository.findGroupSiblings(existing)) ?? [])];

  const { value, fields } = validateCompletePayload(payload, { isBuilderPost: Boolean(existing.builder_project_id) });
  if (!value) {
    throw validationError(fields);
  }
  Object.assign(fields, findListingCountError(value, members));
  if (Object.keys(fields).length) {
    throw validationError(fields);
  }

  const lookups = await writer.resolveLookups(value, fields);
  if (Object.keys(fields).length) {
    throw validationError(fields);
  }

  // The listing of a sub type belongs to the property that was posted with it
  const targetIdOf = (listing) =>
    members.length === 1 ? propertyId : members.find((member) => member.sub_type_slug === listing.propertySubType).id;

  return db.transaction(async (trx) => {
    const group = await lockOwnedGroup(trx, propertyId, user);
    const [{ builder_project_id: projectId }] = group;

    if (value.project) {
      await writer.replaceProject(trx, projectId, value.project);
    }

    let status;
    for (const [index, listing] of value.listings.entries()) {
      const targetId = targetIdOf(listing);
      const rule = getRule(value.propertyType, listing.propertySubType);
      const subTypeRow = lookups.subTypes.get(listing.propertySubType);

      await editRepository.updateProperty(trx, targetId, {
        listing_type: value.listingType,
        property_type: PROPERTY_TYPE_TO_DB[value.propertyType],
        property_sub_type_id: subTypeRow.id,
        ...writer.buildPropertyColumns({ value, listing, rule, subTypeRow }),
      });
      await editRepository.deleteListingChildren(trx, targetId);
      await writer.insertListingDetails(trx, { value, lookups }, listing, targetId);

      const locked = group.find((member) => member.id === targetId);
      const memberStatus = await markEdited(trx, locked, toActor(user), { notify: index === 0 });
      if (targetId === propertyId) status = memberStatus;
    }
    return { id: propertyId, status };
  });
}

// The close and its updated_at bump share one transaction time, so only a later edit is greater
async function wasEditedSinceClosed(trx, property) {
  const closedAt = await writeRepository.findLastStatusChangeAt(trx, property.id, "closed");
  return !closedAt || property.updated_at > closedAt;
}

// A post with several sub types is one property to its owner, so status changes apply to all of them
async function lockOwnedGroup(trx, propertyId, user) {
  const group = await editRepository.findGroupForUpdate(trx, propertyId, toOwnerId(user));
  if (!group.length) {
    throw new AppError("Property not found", 404);
  }
  return group;
}

async function submitProperty(user, propertyId) {
  return db.transaction(async (trx) => {
    const group = await lockOwnedGroup(trx, propertyId, user);
    const submittable = isAdminCaller(user) ? ADMIN_SUBMITTABLE_STATUSES : SUBMITTABLE_STATUSES;

    for (const locked of group) {
      assertCanChangeStatus(user, locked);
      if (!submittable.includes(locked.status)) {
        throw new AppError(`A ${locked.status} property cannot be submitted`, 409);
      }
    }

    let targetStatus;
    for (const [index, locked] of group.entries()) {
      const goesLive =
        isAdminCaller(user) || (locked.status === "closed" && !(await wasEditedSinceClosed(trx, locked)));
      const memberStatus = goesLive ? "published" : "pending";
      await changeStatus(trx, {
        propertyId: locked.id,
        from: locked.status,
        to: memberStatus,
        actor: toActor(user),
        notify: index === 0,
      });
      if (locked.id === propertyId) targetStatus = memberStatus;
    }
    return { id: propertyId, status: targetStatus };
  });
}

async function closeProperty(user, propertyId) {
  return db.transaction(async (trx) => {
    const group = await lockOwnedGroup(trx, propertyId, user);

    for (const locked of group) {
      assertCanChangeStatus(user, locked);
      await changeStatus(trx, { propertyId: locked.id, from: locked.status, to: "closed", actor: toActor(user) });
    }
    return { id: propertyId, status: "closed" };
  });
}

async function deleteProperty(user, propertyId) {
  const group = await db.transaction(async (trx) => {
    const locked = await lockOwnedGroup(trx, propertyId, user);

    for (const property of locked) {
      assertCanChangeStatus(user, property);
      await editRepository.deleteProperty(trx, property.id);
    }
    // The project goes with its last listing
    const projectId = locked[0].builder_project_id;
    if (projectId && (await editRepository.countProjectProperties(trx, projectId)) === 0) {
      await editRepository.deleteProject(trx, projectId);
    }
    return locked;
  });

  await Promise.all(
    group.map(({ id }) =>
      filesService.removePropertyFolder(id).catch((error) => {
        console.error("Failed to remove property folder:", id, error.message);
      })
    )
  );
}

async function assertCanAddFile(trx, propertyId, { kind, meta }) {
  if (kind === "media" && !meta.category) {
    throw new AppError("Category is required for photos and videos", 400);
  }
  if (kind === "media" && (await editRepository.countMedia(trx, propertyId, { brochure: false })) >= LIMITS.maxMediaPerDraft) {
    throw new AppError(`You can upload up to ${LIMITS.maxMediaPerDraft} photos and videos`, 409);
  }
  if (kind === "brochure" && (await editRepository.countMedia(trx, propertyId, { brochure: true })) >= 1) {
    throw new AppError("Only one brochure can be uploaded, remove the current one first", 409);
  }
  if (kind === "floor-plan" && (await editRepository.countFloorPlans(trx, propertyId)) >= MAX_FLOOR_PLANS) {
    throw new AppError(`You can upload up to ${MAX_FLOOR_PLANS} floor plans`, 409);
  }
}

// The upload is already stored under the property folder; it is removed again when rejected
async function addPropertyFile(user, propertyId, { file, kind, meta }) {
  if (!file) {
    throw new AppError("File is required", 400);
  }

  try {
    return await db.transaction(async (trx) => {
      const locked = await lockOwnedProperty(trx, propertyId, user);
      await assertCanAddFile(trx, propertyId, { kind, meta });

      const base = {
        property_id: propertyId,
        file_path: filesService.getPropertyFilePaths(propertyId, file.filename).publicPath,
        original_name: file.originalname,
        mime_type: file.mimetype,
        file_size: file.size,
      };

      let result;
      if (kind === "floor-plan") {
        const position = await editRepository.countFloorPlans(trx, propertyId);
        const row = await editRepository.insertFloorPlan(trx, {
          ...base,
          label: meta.label || null,
          plan_type: meta.planType ?? DEFAULT_PLAN_TYPE,
          sort_order: position,
        });
        result = { floorPlan: mapper.toFloorPlanDto(row) };
      } else {
        const row = await editRepository.insertMedia(trx, {
          ...base,
          category: kind === "brochure" ? "brochure" : meta.category,
          media_type: filesService.toMediaType(file.mimetype),
          sort_order: await editRepository.countMedia(trx, propertyId, { brochure: false }),
        });
        result = { media: mapper.toMediaDto(row) };
      }

      result.status = await markEdited(trx, locked, toActor(user));
      return result;
    });
  } catch (error) {
    await fs.rm(file.path, { force: true });
    throw error;
  }
}

async function removeStoredFile(user, propertyId, { find, remove }, fileId) {
  const removed = await db.transaction(async (trx) => {
    const locked = await lockOwnedProperty(trx, propertyId, user);
    const row = await find(trx, fileId, propertyId);
    if (!row) {
      throw new AppError("File not found", 404);
    }

    await remove(trx, row.id);
    const status = await markEdited(trx, locked, toActor(user));
    return { filePath: row.file_path, status };
  });

  await filesService.removePropertyFile(propertyId, removed.filePath).catch((error) => {
    console.error("Failed to remove property file:", removed.filePath, error.message);
  });
  return { status: removed.status };
}

const removeMedia = (user, propertyId, mediaId) =>
  removeStoredFile(user, propertyId, { find: editRepository.findMediaById, remove: editRepository.deleteMedia }, mediaId);

const removeFloorPlan = (user, propertyId, planId) =>
  removeStoredFile(
    user,
    propertyId,
    { find: editRepository.findFloorPlanById, remove: editRepository.deleteFloorPlan },
    planId
  );

module.exports = {
  updateProperty,
  submitProperty,
  closeProperty,
  deleteProperty,
  addPropertyFile,
  removeMedia,
  removeFloorPlan,
};
