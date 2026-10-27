jest.mock("../../../config/db", () => ({ db: {} }));
jest.mock("fs/promises");
jest.mock("./property.repository");
jest.mock("./property-files.service");

const fs = require("fs/promises");
const repository = require("./property.repository");
const filesService = require("./property-files.service");
const { CLEANUP, LIMITS } = require("./property.constants");
const { cleanupStaleDrafts } = require("./property-cleanup.service");

const NOW = new Date("2026-10-26T12:00:00Z");
const DAY_MS = 24 * 60 * 60 * 1000;
const ids = (count, prefix = "1") =>
  Array.from({ length: count }, (_, index) => `${prefix}0000000-0000-4000-8000-${String(index).padStart(12, "0")}`);

const folder = (name) => ({ name, isDirectory: () => true });

beforeEach(() => {
  repository.findStaleDraftIds.mockResolvedValue([]);
  repository.findExistingDraftIds.mockResolvedValue([]);
  filesService.removeDraftFolder.mockResolvedValue();
  fs.readdir.mockResolvedValue([]);
});

describe("cleanupStaleDrafts", () => {
  it("uses the retention period as the cutoff", async () => {
    await cleanupStaleDrafts(NOW);

    const [cutoff, limit] = repository.findStaleDraftIds.mock.calls[0];
    expect(cutoff).toEqual(new Date(NOW.getTime() - LIMITS.draftMaxAgeDays * DAY_MS));
    expect(limit).toBe(CLEANUP.batchSize);
  });

  it("deletes stale drafts and their folders", async () => {
    const stale = ids(2);
    repository.findStaleDraftIds.mockResolvedValueOnce(stale);

    const result = await cleanupStaleDrafts(NOW);

    expect(repository.deleteDraftsByIds).toHaveBeenCalledWith(stale);
    stale.forEach((id) => expect(filesService.removeDraftFolder).toHaveBeenCalledWith(id));
    expect(result).toEqual({ deletedDrafts: 2, removedFolders: 0 });
  });

  it("keeps going while batches come back full", async () => {
    repository.findStaleDraftIds
      .mockResolvedValueOnce(ids(CLEANUP.batchSize))
      .mockResolvedValueOnce(ids(3, "2"));

    const result = await cleanupStaleDrafts(NOW);

    expect(repository.findStaleDraftIds).toHaveBeenCalledTimes(2);
    expect(result.deletedDrafts).toBe(CLEANUP.batchSize + 3);
  });

  it("removes old folders that have no draft row", async () => {
    const [kept, orphan] = ids(2, "3");
    fs.readdir.mockResolvedValue([folder(kept), folder(orphan), folder("not-a-uuid"), { name: kept, isDirectory: () => false }]);
    repository.findExistingDraftIds.mockResolvedValue([kept]);
    fs.stat.mockResolvedValue({ mtimeMs: NOW.getTime() - 2 * CLEANUP.orphanGraceMs });

    const result = await cleanupStaleDrafts(NOW);

    expect(repository.findExistingDraftIds).toHaveBeenCalledWith([kept, orphan]);
    expect(filesService.removeDraftFolder).toHaveBeenCalledTimes(1);
    expect(filesService.removeDraftFolder).toHaveBeenCalledWith(orphan);
    expect(result.removedFolders).toBe(1);
  });

  it("skips orphan folders inside the grace period", async () => {
    const [orphan] = ids(1, "4");
    fs.readdir.mockResolvedValue([folder(orphan)]);
    fs.stat.mockResolvedValue({ mtimeMs: NOW.getTime() - 1000 });

    const result = await cleanupStaleDrafts(NOW);

    expect(filesService.removeDraftFolder).not.toHaveBeenCalled();
    expect(result.removedFolders).toBe(0);
  });

  it("handles a missing temp folder", async () => {
    fs.readdir.mockRejectedValue(Object.assign(new Error("missing"), { code: "ENOENT" }));

    await expect(cleanupStaleDrafts(NOW)).resolves.toEqual({ deletedDrafts: 0, removedFolders: 0 });
    expect(repository.findExistingDraftIds).not.toHaveBeenCalled();
  });

  it("rethrows other file system errors", async () => {
    fs.readdir.mockRejectedValue(Object.assign(new Error("denied"), { code: "EACCES" }));

    await expect(cleanupStaleDrafts(NOW)).rejects.toThrow("denied");
  });
});
