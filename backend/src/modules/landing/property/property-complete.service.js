const crypto = require("crypto");
const { db } = require("../../../config/db");
const draftRepository = require("./property.repository");
const writeRepository = require("./property-write.repository");
const filesService = require("./property-files.service");
const writer = require("./property-listing.writer");
const { changeStatus } = require("./property-status.service");
const { validateCompletePayload } = require("./property-payload.validation");
const { AppError, validationError } = require("./property.errors");
const { POSTING_AS_ROLES, getRule } = require("./property.constants");
const { isAdminCaller, toOwner, toStatusActor } = require("./property-actor");

function isBuilderPost(user, payload) {
  return user.role === "builder" || (POSTING_AS_ROLES.includes(user.role) && payload?.postingAs === "builder");
}

// Every file must be a distinct file of this draft; the plan keeps the stored facts per listing
async function resolveFiles(draftId, value, fields) {
  const seen = new Set();

  const inspect = async (entry, kind, fieldPath) => {
    // Marked before awaiting so parallel lookups cannot accept the same file twice
    if (seen.has(entry.path)) {
      fields[fieldPath] = "File is used more than once";
      return null;
    }
    seen.add(entry.path);

    const file = await filesService.inspectDraftFile(draftId, entry.path, kind);
    if (!file) {
      fields[fieldPath] = "File was not found in this draft";
      return null;
    }
    return { ...file, entry };
  };

  return Promise.all(
    value.listings.map(async (listing, index) => {
      const prefix = `listings.${index}.files`;
      const { media, floorPlans, brochure } = listing.files;

      return {
        media: (await Promise.all(media.map((entry, i) => inspect(entry, "media", `${prefix}.media.${i}`)))).filter(Boolean),
        floorPlans: (
          await Promise.all(floorPlans.map((entry, i) => inspect(entry, "floor-plan", `${prefix}.floorPlans.${i}`)))
        ).filter(Boolean),
        brochure: brochure ? await inspect(brochure, "brochure", `${prefix}.brochure`) : null,
      };
    })
  );
}

async function insertFiles(trx, { propertyId, files, moved }) {
  const toFileRow = async (file, index) => ({
    property_id: propertyId,
    file_path: await filesService.moveToProperty(propertyId, file, moved),
    original_name: file.entry.originalName ?? null,
    mime_type: file.mimeType,
    file_size: file.size,
    sort_order: index,
  });

  const media = await Promise.all(
    files.media.map(async (file, index) => ({
      ...(await toFileRow(file, index)),
      category: file.entry.category,
      media_type: file.mediaType,
    }))
  );
  if (files.brochure) {
    media.push({
      ...(await toFileRow(files.brochure, media.length)),
      category: "brochure",
      media_type: files.brochure.mediaType,
    });
  }
  const floorPlans = await Promise.all(
    files.floorPlans.map(async (file, index) => ({
      ...(await toFileRow(file, index)),
      label: file.entry.label ?? null,
      plan_type: file.entry.planType,
    }))
  );

  await writeRepository.insertMedia(trx, media);
  await writeRepository.insertFloorPlans(trx, floorPlans);
}

async function insertListing(trx, context, listing, index) {
  const { user, value, lookups, files, projectId, groupId, moved } = context;
  const rule = getRule(value.propertyType, listing.propertySubType);
  const subTypeRow = lookups.subTypes.get(listing.propertySubType);
  const propertyId = crypto.randomUUID();

  const property = await writeRepository.insertProperty(
    trx,
    writer.buildPropertyRow({ id: propertyId, user, value, listing, rule, subTypeRow, projectId, groupId })
  );

  await writer.insertListingDetails(trx, context, listing, propertyId);
  await insertFiles(trx, { propertyId, files: files[index], moved });
  await writeRepository.insertStatusHistory(trx, {
    property_id: propertyId,
    from_status: null,
    to_status: "draft",
    changed_by_user_id: user.id ?? null,
    changed_by_admin_id: user.adminId ?? null,
  });

  return property;
}

// Saves the draft as real listings; files move last and are restored when anything fails
async function completeDraft(user, draftId, { payload, submit }) {
  const { listedBy, ...owner } = toOwner(user);
  const draft = await draftRepository.findDraftByIdForOwner(draftId, owner);
  if (!draft) {
    throw new AppError("Draft not found", 404);
  }

  const { value, fields } = validateCompletePayload(payload, { isBuilderPost: isBuilderPost(user, payload) });
  if (!value) {
    throw validationError(fields);
  }

  const lookups = await writer.resolveLookups(value, fields);
  const files = await resolveFiles(draftId, value, fields);
  if (Object.keys(fields).length) {
    throw validationError(fields);
  }

  const moved = [];
  let result;
  try {
    result = await db.transaction(async (trx) => {
      if (!(await writeRepository.findDraftForUpdate(trx, draftId, owner))) {
        throw new AppError("Draft not found", 404);
      }

      const projectId = value.project ? await writer.insertProject(trx, user, value.project) : null;
      // Sub types posted together share one group, so they are listed as a single property
      const groupId = value.listings.length > 1 ? crypto.randomUUID() : null;
      const context = { user, value, lookups, files, projectId, groupId, moved };
      const properties = [];

      for (const [index, listing] of value.listings.entries()) {
        properties.push(await insertListing(trx, context, listing, index));
      }
      if (submit) {
        // Admin listings go live directly, everyone else goes to review
        const targetStatus = isAdminCaller(user) ? "published" : "pending";
        for (const [index, property] of properties.entries()) {
          await changeStatus(trx, {
            propertyId: property.id,
            from: "draft",
            to: targetStatus,
            actor: toStatusActor(user),
            notify: index === 0,
          });
          property.status = targetStatus;
        }
      }

      await writeRepository.deleteDraft(trx, draftId, owner);
      return { projectId, properties };
    });
  } catch (error) {
    await filesService.restoreMoved(moved);
    throw error;
  }

  // The listings are saved; a leftover draft folder is removed later by the cleanup job
  await filesService.removeDraftFolder(draftId).catch((error) => {
    console.error("Failed to remove draft folder:", draftId, error.message);
  });

  return {
    projectId: result.projectId,
    properties: result.properties.map(({ id, listing_number: listingNumber, status }) => ({
      id,
      listingNumber: Number(listingNumber),
      status,
    })),
  };
}

module.exports = { completeDraft };
