import { ApiError } from "@/services/apiClient";
import {
  addPropertyMedia,
  deletePropertyMedia,
  updateProperty,
} from "@/services/property.service";
import {
  buildMediaFormData,
  buildPropertyUpdateData,
  hasNewMedia,
  type PostPropertyFormState,
} from "./postPropertyPayload";

// Keeps the HTTP status but tells the user which part was already saved
function withSavedNote(error: unknown, note: string): unknown {
  if (!(error instanceof ApiError)) {
    return error;
  }
  return new ApiError(`${note} ${error.message}`, error.status, error.errors);
}

type SaveEditedPropertyArgs = {
  propertyId: string;
  token: string;
  state: PostPropertyFormState;
  removedMediaIds: string[];
};

// Update details, then upload new media, then remove deleted media
export async function saveEditedProperty({
  propertyId,
  token,
  state,
  removedMediaIds,
}: SaveEditedPropertyArgs): Promise<void> {
  await updateProperty(propertyId, buildPropertyUpdateData(state), token);

  try {
    if (hasNewMedia(state.photosVideos)) {
      await addPropertyMedia(propertyId, buildMediaFormData(state.photosVideos), token);
    }
  } catch (error) {
    throw withSavedNote(error, "Details were saved, but the new photos could not be uploaded.");
  }

  try {
    await Promise.all(
      removedMediaIds.map((mediaId) => deletePropertyMedia(propertyId, mediaId, token)),
    );
  } catch (error) {
    throw withSavedNote(error, "Details were saved, but some photos could not be removed.");
  }
}
