const fs = require("fs/promises");
const { db } = require("../../../config/db");
const editRepository = require("./property-edit.repository");
const readRepository = require("./property-read.repository");
const filesService = require("./property-files.service");
const writeRepository = require("./property-write.repository");
const writer = require("./property-listing.writer");
const mapper = require("./property.mapper");
const { changeStatus, markEdited } = require("./property-status.service");
const { validateCompletePayload } = require("./property-payload.validation");
const { AppError, validationError } = require("./property.errors");
const { LIMITS, PROPERTY_TYPE_TO_DB, getRule } = require("./property.constants");

const MAX_FLOOR_PLANS = 20;
const SUBMITTABLE_STATUSES = ["draft", "rejected", "closed"];
const DEFAULT_PLAN_TYPE = "2d";

const toActor = (user) => ({ userId: user.id });

async function lockOwnedProperty(trx, propertyId, user) {
  const property = await editRepository.findPropertyForUpdate(trx, propertyId, user.id);
  if (!property) {
    throw new AppError("Property not found", 404);
  }
  return property;
}

function findListingCountError(value) {
  return value.listings.length === 1 ? {} : { listings: "Exactly one listing can be edited at a time" };
}

// Files are managed by their own endpoints, so an edit never touches them
async function updateProperty(user, propertyId, { payload }) {
  const existing = await readRepository.findOwnedProperty(propertyId, user.id);
  if (!existing) {
    throw new AppError("Property not found", 404);
  }

  const { value, fields } = validateCompletePayload(payload, { isBuilderPost: Boolean(existing.builder_project_id) });
  if (!value) {
    throw validationError(fields);
  }
  Object.assign(fields, findListingCountError(value));
  if (Object.keys(fields).length) {
    throw validationError(fields);
  }

  const lookups = await writer.resolveLookups(value, fields);
  if (Object.keys(fields).length) {
    throw validationError(fields);
  }

  const [listing] = value.listings;
  const rule = getRule(value.propertyType, listing.propertySubType);
  const subTypeRow = lookups.subTypes.get(listing.propertySubType);

  return db.transaction(async (trx) => {
    const locked = await lockOwnedProperty(trx, propertyId, user);

    if (value.project) {
      await writer.replaceProject(trx, locked.builder_project_id, value.project);
    }
    await editRepository.updateProperty(trx, propertyId, {
      listing_type: value.listingType,
      property_type: PROPERTY_TYPE_TO_DB[value.propertyType],
      property_sub_type_id: subTypeRow.id,
      ...writer.buildPropertyColumns({ value, listing, rule, subTypeRow }),
    });
    await editRepository.deleteListingChildren(trx, propertyId);
    await writer.insertListingDetails(trx, { value, lookups }, listing, propertyId);

    const status = await markEdited(trx, locked, toActor(user));
    return { id: propertyId, status };
  });
}

// The close and its updated_at bump share one transaction time, so only a later edit is greater
async function wasEditedSinceClosed(trx, property) {
  const closedAt = await writeRepository.findLastStatusChangeAt(trx, property.id, "closed");
  return !closedAt || property.updated_at > closedAt;
}

async function submitProperty(user, propertyId) {
  return db.transaction(async (trx) => {
    const locked = await lockOwnedProperty(trx, propertyId, user);
    if (!SUBMITTABLE_STATUSES.includes(locked.status)) {
      throw new AppError(`A ${locked.status} property cannot be submitted`, 409);
    }

    const targetStatus = locked.status === "closed" && !(await wasEditedSinceClosed(trx, locked)) ? "published" : "pending";
    await changeStatus(trx, { propertyId, from: locked.status, to: targetStatus, actor: toActor(user) });
    return { id: propertyId, status: targetStatus };
  });
}

async function closeProperty(user, propertyId) {
  return db.transaction(async (trx) => {
    const locked = await lockOwnedProperty(trx, propertyId, user);

    await changeStatus(trx, { propertyId, from: locked.status, to: "closed", actor: toActor(user) });
    return { id: propertyId, status: "closed" };
  });
}

async function deleteProperty(user, propertyId) {
  await db.transaction(async (trx) => {
    const locked = await lockOwnedProperty(trx, propertyId, user);

    await editRepository.deleteProperty(trx, propertyId);
    // The project goes with its last listing
    if (locked.builder_project_id && (await editRepository.countProjectProperties(trx, locked.builder_project_id)) === 0) {
      await editRepository.deleteProject(trx, locked.builder_project_id);
    }
  });

  await filesService.removePropertyFolder(propertyId).catch((error) => {
    console.error("Failed to remove property folder:", propertyId, error.message);
  });
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
