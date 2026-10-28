const fs = require("fs/promises");
const path = require("path");
const repository = require("../repositories/property-draft.repository");
const { LIMITS, STORAGE, FILE_NAME_PATTERN } = require("../constants/property.constants");
const { AppError } = require("../utils/property.errors");
const { completeDraft } = require("./property-complete.service");
const { listAmenityOptions } = require("./property-read.service");
const editService = require("./property-edit.service");
const { toOwner } = require("../utils/property-actor.util");

const DEFAULT_PLAN_TYPE = "2d";

function toDraftSummary(draft) {
  return {
    id: draft.id,
    listedBy: draft.listed_by,
    currentStep: draft.current_step,
    summary: draft.form_data?.summary ?? null,
    createdAt: draft.created_at,
    updatedAt: draft.updated_at,
  };
}

function toDraftDetail(draft) {
  return {
    id: draft.id,
    listedBy: draft.listed_by,
    currentStep: draft.current_step,
    formData: draft.form_data,
    createdAt: draft.created_at,
    updatedAt: draft.updated_at,
  };
}

function getDraftDir(draftId) {
  return path.join(STORAGE.tempDraftsDir, draftId);
}

function getDraftFilePath(draftId, fileName) {
  if (!FILE_NAME_PATTERN.test(fileName)) {
    throw new AppError("File not found", 404);
  }
  return path.join(getDraftDir(draftId), fileName);
}

function toTempPath(draftId, fileName) {
  return `temp/drafts/${draftId}/${fileName}`;
}

async function removeFileQuietly(filePath) {
  await fs.rm(filePath, { force: true });
}

async function listDraftFileNames(draftId) {
  try {
    return await fs.readdir(getDraftDir(draftId));
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function getFolderSize(draftId, fileNames) {
  const sizes = await Promise.all(
    fileNames.map(async (name) => (await fs.stat(path.join(getDraftDir(draftId), name))).size)
  );
  return sizes.reduce((total, size) => total + size, 0);
}

async function assertDraftOwned(user, draftId) {
  const exists = await repository.draftExistsForOwner(draftId, toOwner(user));
  if (!exists) {
    throw new AppError("Draft not found", 404);
  }
}

async function createDraft(user, { currentStep, formData }) {
  const owner = toOwner(user);

  if ((await repository.countDraftsByOwner(owner)) >= LIMITS.maxDraftsPerUser) {
    throw new AppError("Draft limit reached, delete an old draft first", 409);
  }

  const draft = await repository.insertDraft(owner, { currentStep, formData });
  return toDraftDetail(draft);
}

async function listDrafts(user) {
  const drafts = await repository.findDraftsByOwner(toOwner(user));
  return drafts.map(toDraftSummary);
}

async function getDraft(user, draftId) {
  const draft = await repository.findDraftByIdForOwner(draftId, toOwner(user));
  if (!draft) {
    throw new AppError("Draft not found", 404);
  }
  return toDraftDetail(draft);
}

async function saveDraft(user, draftId, { currentStep, formData }) {
  const draft = await repository.updateDraft(draftId, toOwner(user), { currentStep, formData });
  if (!draft) {
    throw new AppError("Draft not found", 404);
  }
  return { id: draft.id, currentStep: draft.current_step, updatedAt: draft.updated_at };
}

async function deleteDraft(user, draftId) {
  const deleted = await repository.deleteDraft(draftId, toOwner(user));
  if (!deleted) {
    throw new AppError("Draft not found", 404);
  }
  await fs.rm(getDraftDir(draftId), { recursive: true, force: true });
}

// Removes the stored file whenever the upload is rejected
async function registerDraftFile(user, draftId, { file, kind, meta }) {
  if (!file) {
    throw new AppError("File is required", 400);
  }

  try {
    await assertDraftOwned(user, draftId);

    if (kind === "media" && !meta.category) {
      throw new AppError("Category is required for photos and videos", 400);
    }

    const fileNames = await listDraftFileNames(draftId);
    const mediaCount = fileNames.filter((name) => name.startsWith("media-")).length;

    if (kind === "media" && mediaCount > LIMITS.maxMediaPerDraft) {
      throw new AppError(`You can upload up to ${LIMITS.maxMediaPerDraft} photos and videos`, 409);
    }
    if (kind === "brochure" && fileNames.filter((name) => name.startsWith("brochure-")).length > 1) {
      throw new AppError("Only one brochure can be uploaded", 409);
    }
    if ((await getFolderSize(draftId, fileNames)) > LIMITS.maxDraftFolderBytes) {
      throw new AppError("Upload size limit reached for this draft", 413);
    }
  } catch (error) {
    await removeFileQuietly(file.path);
    throw error;
  }

  await repository.touchDraft(draftId, toOwner(user));

  return {
    id: file.filename,
    path: toTempPath(draftId, file.filename),
    kind,
    category: meta.category ?? null,
    planType: kind === "floor-plan" ? meta.planType ?? DEFAULT_PLAN_TYPE : null,
    label: meta.label || null,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
  };
}

async function removeDraftFile(user, draftId, fileName) {
  await assertDraftOwned(user, draftId);

  const filePath = getDraftFilePath(draftId, fileName);
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new AppError("File not found", 404);
    }
    throw error;
  }
}

async function resolveDraftFile(user, draftId, fileName) {
  await assertDraftOwned(user, draftId);

  const filePath = getDraftFilePath(draftId, fileName);
  try {
    await fs.access(filePath);
  } catch (error) {
    throw new AppError("File not found", 404);
  }
  return filePath;
}

module.exports = {
  AppError,
  completeDraft,
  listAmenityOptions,
  ...editService,
  createDraft,
  listDrafts,
  getDraft,
  saveDraft,
  deleteDraft,
  registerDraftFile,
  removeDraftFile,
  resolveDraftFile,
};
