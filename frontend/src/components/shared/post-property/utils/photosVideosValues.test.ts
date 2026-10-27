import { describe, expect, it, vi } from "vitest";
import {
  createEmptyPhotosVideosValues,
  createPropertyMediaFromFile,
  getTotalMediaCount,
  hasFailedMedia,
  hasUploadingMedia,
  type PhotosVideosValues,
} from "../config/postPropertyForm.shared";
import type { MediaUploader } from "./mediaUploader";
import {
  addMediaItems,
  findMediaItem,
  removeMediaItem,
  removeStoredMedia,
  runWithConcurrency,
  updateMediaItem,
  uploadMediaItem,
} from "./photosVideosValues";

const newFile = (name = "a.jpg") => new File(["x"], name, { type: "image/jpeg" });
const newMedia = (name?: string) => createPropertyMediaFromFile(newFile(name), "uploading");
const remote = { id: "media-1.jpg", path: "temp/drafts/d/media-1.jpg" };

function createStore(initial: PhotosVideosValues) {
  let values = initial;
  return {
    getValues: () => values,
    commit: (update: (current: PhotosVideosValues) => PhotosVideosValues) => {
      values = update(values);
    },
  };
}

function createUploader(overrides: Partial<MediaUploader> = {}): MediaUploader {
  return {
    upload: vi.fn().mockResolvedValue(remote),
    remove: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("media values helpers", () => {
  it("adds items to a category", () => {
    const item = newMedia();
    const values = addMediaItems(createEmptyPhotosVideosValues(), "exterior", [item]);

    expect(values.mediaByCategory.exterior).toEqual([item]);
    expect(getTotalMediaCount(values)).toBe(1);
  });

  it("finds and updates an item in any category and the brochure", () => {
    const photo = newMedia();
    const brochure = newMedia("b.pdf");
    const values = { ...addMediaItems(createEmptyPhotosVideosValues(), "kitchen", [photo]), brochure };

    expect(findMediaItem(values, photo.id)).toBe(photo);
    expect(findMediaItem(values, brochure.id)).toBe(brochure);
    expect(findMediaItem(values, "missing")).toBeUndefined();

    const updated = updateMediaItem(values, brochure.id, (item) => ({ ...item, status: "uploaded" }));
    expect(updated.brochure?.status).toBe("uploaded");
    expect(updated.mediaByCategory.kitchen[0]).toBe(photo);
  });

  it("returns the same values when the item does not exist", () => {
    const values = createEmptyPhotosVideosValues();

    expect(updateMediaItem(values, "missing", (item) => item)).toBe(values);
  });

  it("removes an item or the brochure", () => {
    const photo = newMedia();
    const brochure = newMedia("b.pdf");
    const values = { ...addMediaItems(createEmptyPhotosVideosValues(), "kitchen", [photo]), brochure };

    expect(removeMediaItem(values, photo.id).mediaByCategory.kitchen).toEqual([]);
    expect(removeMediaItem(values, brochure.id).brochure).toBeNull();
    expect(removeMediaItem(values, photo.id).brochure).toBe(brochure);
  });

  it("reports uploading and failed files", () => {
    const base = createEmptyPhotosVideosValues();
    const uploading = addMediaItems(base, "exterior", [newMedia()]);
    const failed = updateMediaItem(uploading, uploading.mediaByCategory.exterior[0].id, (item) => ({
      ...item,
      status: "error",
    }));

    expect(hasUploadingMedia(uploading)).toBe(true);
    expect(hasFailedMedia(uploading)).toBe(false);
    expect(hasUploadingMedia(failed)).toBe(false);
    expect(hasFailedMedia(failed)).toBe(true);
    expect(hasUploadingMedia(base)).toBe(false);
  });
});

describe("uploadMediaItem", () => {
  it("stores the remote reference and frees the local file", async () => {
    const media = newMedia();
    const store = createStore(addMediaItems(createEmptyPhotosVideosValues(), "exterior", [media]));
    const uploader = createUploader();

    await uploadMediaItem({ uploader, ...store }, media, "media", { category: "exterior" });

    expect(uploader.upload).toHaveBeenCalledWith(media.file, "media", { category: "exterior" });
    expect(findMediaItem(store.getValues(), media.id)).toMatchObject({ status: "uploaded", remote, file: undefined });
  });

  it("marks the item as failed with the server message", async () => {
    const media = newMedia();
    const store = createStore(addMediaItems(createEmptyPhotosVideosValues(), "exterior", [media]));
    const uploader = createUploader({ upload: vi.fn().mockRejectedValue(new Error("File is too large")) });

    await uploadMediaItem({ uploader, ...store }, media, "media", {});

    expect(findMediaItem(store.getValues(), media.id)).toMatchObject({
      status: "error",
      errorMessage: "File is too large",
    });
    expect(findMediaItem(store.getValues(), media.id)?.file).toBe(media.file);
  });

  it("uses a generic message when the error has none", async () => {
    const media = newMedia();
    const store = createStore(addMediaItems(createEmptyPhotosVideosValues(), "exterior", [media]));
    const uploader = createUploader({ upload: vi.fn().mockRejectedValue("boom") });

    await uploadMediaItem({ uploader, ...store }, media, "media", {});

    expect(findMediaItem(store.getValues(), media.id)?.errorMessage).toBe("Upload failed. Please try again.");
  });

  it("deletes the stored copy when the file was removed during the upload", async () => {
    const media = newMedia();
    const store = createStore(addMediaItems(createEmptyPhotosVideosValues(), "exterior", [media]));
    const uploader = createUploader({
      upload: vi.fn().mockImplementation(async () => {
        store.commit((values) => removeMediaItem(values, media.id));
        return remote;
      }),
    });

    await uploadMediaItem({ uploader, ...store }, media, "media", {});

    expect(uploader.remove).toHaveBeenCalledWith(remote);
    expect(findMediaItem(store.getValues(), media.id)).toBeUndefined();
  });

  it("keeps results apart when several uploads finish in a different order", async () => {
    const first = newMedia("one.jpg");
    const second = newMedia("two.jpg");
    const store = createStore(addMediaItems(createEmptyPhotosVideosValues(), "exterior", [first, second]));
    const resolvers: Array<(ref: typeof remote) => void> = [];
    const uploader = createUploader({
      upload: vi.fn().mockImplementation(() => new Promise((resolve) => resolvers.push(resolve))),
    });

    const done = Promise.all([
      uploadMediaItem({ uploader, ...store }, first, "media", {}),
      uploadMediaItem({ uploader, ...store }, second, "media", {}),
    ]);
    resolvers[1]({ id: "two.jpg", path: "p/two.jpg" });
    resolvers[0]({ id: "one.jpg", path: "p/one.jpg" });
    await done;

    expect(findMediaItem(store.getValues(), first.id)?.remote?.id).toBe("one.jpg");
    expect(findMediaItem(store.getValues(), second.id)?.remote?.id).toBe("two.jpg");
  });

  it("does nothing for an item without a file", async () => {
    const media = { ...newMedia(), file: undefined };
    const uploader = createUploader();

    await uploadMediaItem({ uploader, ...createStore(createEmptyPhotosVideosValues()) }, media, "media", {});

    expect(uploader.upload).not.toHaveBeenCalled();
  });
});

describe("runWithConcurrency", () => {
  it("never runs more than the limit at once and runs every item", async () => {
    let running = 0;
    let peak = 0;
    const seen: number[] = [];

    await runWithConcurrency([1, 2, 3, 4, 5, 6, 7], 3, async (item) => {
      running += 1;
      peak = Math.max(peak, running);
      await new Promise((resolve) => setTimeout(resolve, 2));
      seen.push(item);
      running -= 1;
    });

    expect(peak).toBe(3);
    expect(seen.sort()).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("handles an empty list", async () => {
    await expect(runWithConcurrency([], 3, async () => undefined)).resolves.toBeUndefined();
  });
});

describe("removeStoredMedia", () => {
  it("removes the stored copy of an uploaded item only", async () => {
    const uploader = createUploader();

    await removeStoredMedia(uploader, { ...newMedia(), remote });
    await removeStoredMedia(uploader, newMedia());
    await removeStoredMedia(uploader, undefined);

    expect(uploader.remove).toHaveBeenCalledTimes(1);
    expect(uploader.remove).toHaveBeenCalledWith(remote);
  });

  it("ignores a failed removal", async () => {
    const uploader = createUploader({ remove: vi.fn().mockRejectedValue(new Error("offline")) });

    await expect(removeStoredMedia(uploader, { ...newMedia(), remote })).resolves.toBeUndefined();
  });
});
