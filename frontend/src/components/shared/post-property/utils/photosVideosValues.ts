import type { DraftFileKind, DraftFileMeta } from "@/services/property.service";
import {
  PHOTO_CATEGORY_OPTIONS,
  type PhotoCategoryId,
  type PhotosVideosValues,
  type PropertyMediaFile,
} from "../config/postPropertyForm.shared";
import type { MediaUploader } from "./mediaUploader";
import { removeStoredFile, uploadItemFile } from "./uploadItemFile";

type MediaUpdate = (media: PropertyMediaFile) => PropertyMediaFile;

// Applies update to the file with this id, wherever it is; other values are returned as they are
export function updateMediaItem(
  values: PhotosVideosValues,
  id: string,
  update: MediaUpdate,
): PhotosVideosValues {
  let changed = false;
  const apply = (media: PropertyMediaFile) => {
    if (media.id !== id) return media;
    changed = true;
    return update(media);
  };

  const mediaByCategory = { ...values.mediaByCategory };
  for (const category of PHOTO_CATEGORY_OPTIONS) {
    mediaByCategory[category.id] = values.mediaByCategory[category.id].map(apply);
  }
  const brochure = values.brochure ? apply(values.brochure) : null;

  return changed ? { mediaByCategory, brochure } : values;
}

export function findMediaItem(values: PhotosVideosValues, id: string): PropertyMediaFile | undefined {
  for (const category of PHOTO_CATEGORY_OPTIONS) {
    const found = values.mediaByCategory[category.id].find((media) => media.id === id);
    if (found) return found;
  }
  return values.brochure?.id === id ? values.brochure : undefined;
}

export function addMediaItems(
  values: PhotosVideosValues,
  categoryId: PhotoCategoryId,
  items: PropertyMediaFile[],
): PhotosVideosValues {
  return {
    ...values,
    mediaByCategory: {
      ...values.mediaByCategory,
      [categoryId]: [...values.mediaByCategory[categoryId], ...items],
    },
  };
}

export function removeMediaItem(values: PhotosVideosValues, id: string): PhotosVideosValues {
  const mediaByCategory = { ...values.mediaByCategory };
  for (const category of PHOTO_CATEGORY_OPTIONS) {
    mediaByCategory[category.id] = values.mediaByCategory[category.id].filter((media) => media.id !== id);
  }

  return { mediaByCategory, brochure: values.brochure?.id === id ? null : values.brochure };
}

export type MediaUploadContext = {
  uploader: MediaUploader;
  // Always the newest values, since uploads finish long after they started
  getValues: () => PhotosVideosValues;
  commit: (update: (values: PhotosVideosValues) => PhotosVideosValues) => void;
};

// Uploads a local file and records the result on the item; never throws
export function uploadMediaItem(
  { uploader, getValues, commit }: MediaUploadContext,
  media: PropertyMediaFile,
  kind: DraftFileKind,
  meta: DraftFileMeta,
) {
  return uploadItemFile(
    {
      uploader,
      exists: (id) => Boolean(findMediaItem(getValues(), id)),
      patch: (id, change) =>
        commit((values) => updateMediaItem(values, id, (item) => ({ ...item, ...change }))),
    },
    media,
    kind,
    meta,
  );
}

export const MAX_PARALLEL_UPLOADS = 3;

// Runs task for every item with at most `limit` running at once
export async function runWithConcurrency<T>(
  items: T[],
  limit: number,
  task: (item: T) => Promise<void>,
) {
  let nextIndex = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (nextIndex < items.length) {
      const item = items[nextIndex++];
      await task(item);
    }
  });

  await Promise.all(workers);
}

export const removeStoredMedia = removeStoredFile;
