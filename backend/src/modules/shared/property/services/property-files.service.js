const fs = require("fs/promises");
const path = require("path");
const { FILE_NAME_PATTERN, STORAGE, UPLOAD_MIME_TYPES } = require("../constants/property.constants");

const MIME_BY_EXTENSION = Object.fromEntries(
  Object.values(UPLOAD_MIME_TYPES).flatMap((mimeMap) =>
    Object.entries(mimeMap).map(([mime, extension]) => [extension, mime])
  )
);

function toMediaType(mimeType) {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  return "document";
}

// Returns the stored file facts, or null when the path is not a file of this draft
async function inspectDraftFile(draftId, filePath, kind) {
  const prefix = `temp/drafts/${draftId}/`;
  if (!filePath.startsWith(prefix)) return null;

  const name = filePath.slice(prefix.length);
  if (!FILE_NAME_PATTERN.test(name) || !name.startsWith(`${kind}-`)) return null;

  const mimeType = MIME_BY_EXTENSION[path.extname(name)];
  if (!mimeType) return null;

  const absolutePath = path.join(STORAGE.tempDraftsDir, draftId, name);
  try {
    const { size } = await fs.stat(absolutePath);
    return { name, absolutePath, size, mimeType, mediaType: toMediaType(mimeType) };
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

function getPropertyFilePaths(propertyId, name) {
  return {
    absolutePath: path.join(STORAGE.propertiesDir, propertyId, name),
    publicPath: `${STORAGE.publicPrefix}/${propertyId}/${name}`,
  };
}

async function moveFile(from, to) {
  await fs.mkdir(path.dirname(to), { recursive: true });
  try {
    await fs.rename(from, to);
  } catch (error) {
    if (error.code !== "EXDEV") throw error;
    await fs.copyFile(from, to);
    await fs.rm(from, { force: true });
  }
}

// Moves are recorded so a failed save can put every file back
async function moveToProperty(propertyId, file, moved) {
  const { absolutePath, publicPath } = getPropertyFilePaths(propertyId, file.name);
  await moveFile(file.absolutePath, absolutePath);
  moved.push({ from: file.absolutePath, to: absolutePath, propertyId });
  return publicPath;
}

async function restoreMoved(moved) {
  for (const { from, to } of [...moved].reverse()) {
    try {
      await moveFile(to, from);
    } catch (error) {
      console.error("Failed to restore draft file:", to, error.message);
    }
  }

  const propertyIds = new Set(moved.map(({ propertyId }) => propertyId));
  await Promise.all(
    [...propertyIds].map((propertyId) =>
      fs.rm(path.join(STORAGE.propertiesDir, propertyId), { recursive: true, force: true })
    )
  );
}

async function removeDraftFolder(draftId) {
  await fs.rm(path.join(STORAGE.tempDraftsDir, draftId), { recursive: true, force: true });
}

// Only the base name of the stored path is used, so a stored value can never point elsewhere
async function removePropertyFile(propertyId, storedPath) {
  await fs.rm(path.join(STORAGE.propertiesDir, propertyId, path.basename(storedPath)), { force: true });
}

async function removePropertyFolder(propertyId) {
  await fs.rm(path.join(STORAGE.propertiesDir, propertyId), { recursive: true, force: true });
}

module.exports = {
  toMediaType,
  getPropertyFilePaths,
  inspectDraftFile,
  moveToProperty,
  restoreMoved,
  removeDraftFolder,
  removePropertyFile,
  removePropertyFolder,
};
