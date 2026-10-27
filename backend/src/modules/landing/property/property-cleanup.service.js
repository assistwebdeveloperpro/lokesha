const fs = require("fs/promises");
const path = require("path");
const repository = require("./property.repository");
const filesService = require("./property-files.service");
const { CLEANUP, LIMITS, STORAGE } = require("./property.constants");

const DAY_MS = 24 * 60 * 60 * 1000;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

// Deletes drafts untouched for the retention period, with their folders
async function removeStaleDrafts(now) {
  const cutoff = new Date(now.getTime() - LIMITS.draftMaxAgeDays * DAY_MS);
  let removed = 0;
  let ids;

  do {
    ids = await repository.findStaleDraftIds(cutoff, CLEANUP.batchSize);
    if (!ids.length) break;

    await repository.deleteDraftsByIds(ids);
    await Promise.all(ids.map((id) => filesService.removeDraftFolder(id)));
    removed += ids.length;
  } while (ids.length === CLEANUP.batchSize);

  return removed;
}

async function listDraftFolders() {
  try {
    const entries = await fs.readdir(STORAGE.tempDraftsDir, { withFileTypes: true });
    return entries.filter((entry) => entry.isDirectory() && UUID_PATTERN.test(entry.name)).map((entry) => entry.name);
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}


async function removeOrphanFolders(now) {
  const folders = await listDraftFolders();
  if (!folders.length) return 0;

  const existing = new Set(await repository.findExistingDraftIds(folders));
  const orphans = folders.filter((folder) => !existing.has(folder));
  let removed = 0;

  for (const folder of orphans) {
    const { mtimeMs } = await fs.stat(path.join(STORAGE.tempDraftsDir, folder));
    if (now.getTime() - mtimeMs < CLEANUP.orphanGraceMs) continue;

    await filesService.removeDraftFolder(folder);
    removed += 1;
  }

  return removed;
}

async function cleanupStaleDrafts(now = new Date()) {
  const deletedDrafts = await removeStaleDrafts(now);
  const removedFolders = await removeOrphanFolders(now);
  return { deletedDrafts, removedFolders };
}

async function runCleanup() {
  try {
    const { deletedDrafts, removedFolders } = await cleanupStaleDrafts();
    if (deletedDrafts || removedFolders) {
      console.log(`Draft cleanup removed ${deletedDrafts} drafts and ${removedFolders} orphan folders`);
    }
  } catch (error) {
    console.error("Draft cleanup failed:", error.message);
  }
}

// Runs once on start and then daily; unref lets the process exit normally
function scheduleDraftCleanup() {
  runCleanup();
  return setInterval(runCleanup, CLEANUP.intervalMs).unref();
}

module.exports = { cleanupStaleDrafts, scheduleDraftCleanup };