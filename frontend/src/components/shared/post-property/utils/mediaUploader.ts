import {
  deleteDraftFile,
  deletePropertyFloorPlan,
  deletePropertyMedia,
  uploadDraftFile,
  uploadPropertyFloorPlan,
  uploadPropertyMedia,
  type DraftFileKind,
  type DraftFileMeta,
  type PropertyScope,
} from "@/services/property.service";

// A file that already lives on the server; id is its stored file name, or its row id on a posted property
export type UploadedFileRef = { id: string; path: string; kind?: DraftFileKind };

// Fields write through this, so the same field works for new and posted properties
export type MediaUploader = {
  upload: (file: File, kind: DraftFileKind, meta: DraftFileMeta) => Promise<UploadedFileRef>;
  remove: (ref: UploadedFileRef) => Promise<void>;
};

const START_UPLOAD_ERROR = "Unable to start the upload. Please try again.";

// Files of a posted property: they are added to and removed from the live listing at once
export function createPropertyMediaUploader({
  propertyId,
  scope = "user",
  getToken,
}: {
  propertyId: string;
  scope?: PropertyScope;
  getToken: () => string | null;
}): MediaUploader {
  function requireToken() {
    const token = getToken();
    if (!token) {
      throw new Error(START_UPLOAD_ERROR);
    }
    return token;
  }

  return {
    async upload(file, kind, meta) {
      const token = requireToken();

      if (kind === "floor-plan") {
        const { floorPlan } = await uploadPropertyFloorPlan(propertyId, file, meta, token, scope);
        return { id: floorPlan.id, path: floorPlan.path, kind };
      }

      const { media } = await uploadPropertyMedia(propertyId, file, kind, meta, token, scope);
      return { id: media.id, path: media.path, kind };
    },

    async remove(ref) {
      const token = requireToken();

      if (ref.kind === "floor-plan") {
        await deletePropertyFloorPlan(propertyId, ref.id, token, scope);
        return;
      }
      await deletePropertyMedia(propertyId, ref.id, token, scope);
    },
  };
}

// Files of a form that is still a draft; the draft is created on the first upload
export function createDraftMediaUploader({
  scope = "user",
  getToken,
  ensureDraftId,
}: {
  scope?: PropertyScope;
  getToken: () => string | null;
  ensureDraftId: () => Promise<string | null>;
}): MediaUploader {
  async function resolveTarget() {
    const [draftId, token] = [await ensureDraftId(), getToken()];
    if (!draftId || !token) {
      throw new Error(START_UPLOAD_ERROR);
    }
    return { draftId, token };
  }

  return {
    async upload(file, kind, meta) {
      const { draftId, token } = await resolveTarget();
      const { file: stored } = await uploadDraftFile(draftId, file, kind, meta, token, scope);
      return { id: stored.id, path: stored.path };
    },

    async remove(ref) {
      const { draftId, token } = await resolveTarget();
      await deleteDraftFile(draftId, ref.id, token, scope);
    },
  };
}
