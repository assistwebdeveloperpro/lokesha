import type { DraftFileKind, DraftFileMeta } from "@/services/property.service";
import type { MediaUploader, UploadedFileRef } from "./mediaUploader";

const UPLOAD_FAILED_MESSAGE = "Upload failed. Please try again.";

// What every file-bearing item (photo, brochure image, floor plan) has in common
export type UploadableItem = {
  id: string;
  file?: File | null;
  status?: "local" | "uploading" | "uploaded" | "error";
  remote?: UploadedFileRef;
  errorMessage?: string;
};

// What an upload changes on its item; an undefined file means it was released
export type UploadPatch = Partial<Pick<UploadableItem, "remote" | "errorMessage">> & {
  status?: "uploading" | "uploaded" | "error";
  file?: undefined;
};

export type UploadItemContext = {
  uploader: MediaUploader;
  // Reads the newest state: uploads finish long after they started
  exists: (id: string) => boolean;
  patch: (id: string, change: UploadPatch) => void;
};

// Uploads the item's file and records the result on the item; never throws
export async function uploadItemFile(
  { uploader, exists, patch }: UploadItemContext,
  item: UploadableItem,
  kind: DraftFileKind,
  meta: DraftFileMeta,
) {
  if (!item.file) return;

  patch(item.id, { status: "uploading", errorMessage: undefined });

  try {
    const remote = await uploader.upload(item.file, kind, meta);

    // The item was removed while it was uploading, so the stored copy is not needed
    if (!exists(item.id)) {
      await uploader.remove(remote).catch(() => undefined);
      return;
    }

    patch(item.id, { status: "uploaded", remote, file: undefined, errorMessage: undefined });
  } catch (error) {
    const errorMessage = error instanceof Error && error.message ? error.message : UPLOAD_FAILED_MESSAGE;
    patch(item.id, { status: "error", errorMessage });
  }
}

// Removes the stored copy, if there is one; a failure leaves a file the cleanup job removes later
export async function removeStoredFile(uploader: MediaUploader, item: UploadableItem | null | undefined) {
  if (item?.remote) {
    await uploader.remove(item.remote).catch(() => undefined);
  }
}
