import { describe, expect, it, vi } from "vitest";
import {
  createEmptyPhotosVideosValues,
  type PhotosVideosValues,
  type PropertyMediaFile,
} from "../config/postPropertyForm.shared";
import { createInitialDraft } from "../state/postPropertyFormReducer";
import type { RestoredDraft } from "../state/postPropertyDraftSnapshot";
import { EMPTY_SUB_TYPE_FORMS_SNAPSHOT } from "../hooks/useSubTypeForms";
import { loadDraftPreviews, type PreviewTargets } from "./draftPreviews";
import { findMediaItem } from "./photosVideosValues";

const media = (id: string, type: "image" | "video" = "image"): PropertyMediaFile => ({
  id,
  name: `${id}.jpg`,
  type,
  status: "uploaded",
  remote: { id: `${id}-file.jpg`, path: `temp/drafts/d/${id}-file.jpg` },
  previewUrl: "",
});

function buildRestored(): RestoredDraft {
  const initial = createInitialDraft();
  const photos = createEmptyPhotosVideosValues();
  photos.mediaByCategory.exterior = [media("p1"), media("video-1", "video")];

  const tabPhotos = createEmptyPhotosVideosValues();
  tabPhotos.mediaByCategory.kitchen = [media("t1")];

  return {
    postingAs: "",
    form: {
      listingType: initial.listingType,
      propertyType: initial.propertyType,
      propertySubTypes: initial.propertySubTypes,
      addressLocation: initial.addressLocation,
      propertyDetails: initial.propertyDetails,
      amenities: initial.amenities,
      pricingOthers: initial.pricingOthers,
      photosVideos: photos,
      projectDetails: {
        ...initial.projectDetails,
        brochureImages: [{ id: "b1", previewUrl: "", status: "uploaded", remote: { id: "b1-file.jpg", path: "p" } }],
        floorPlans: [
          { id: "f1", label: "Hall", planType: "2d", file: null, previewUrl: "", status: "uploaded", remote: { id: "f1-file.jpg", path: "p" } },
          { id: "f2", label: "Empty", planType: "2d", file: null, previewUrl: "" },
        ],
      },
    },
    tabs: { ...EMPTY_SUB_TYPE_FORMS_SNAPSHOT, photos: { duplex: tabPhotos } },
  };
}

function createTargets(restored: RestoredDraft) {
  let single = restored.form.photosVideos;
  let tab = restored.tabs.photos.duplex;
  let project = restored.form.projectDetails;

  const targets: PreviewTargets = {
    updatePhotos: (update) => {
      single = update(single);
      tab = update(tab);
    },
    updateProject: (update) => {
      project = update(project);
    },
  };

  return { targets, get: () => ({ single, tab, project }) as { single: PhotosVideosValues; tab: PhotosVideosValues; project: typeof project } };
}

describe("loadDraftPreviews", () => {
  it("loads a preview for every stored image, brochure image and floor plan", async () => {
    const restored = buildRestored();
    const { targets, get } = createTargets(restored);
    const loadPreview = vi.fn(async (fileName: string) => `blob:${fileName}`);

    await loadDraftPreviews(restored, loadPreview, targets);

    expect(findMediaItem(get().single, "p1")?.previewUrl).toBe("blob:p1-file.jpg");
    expect(findMediaItem(get().tab, "t1")?.previewUrl).toBe("blob:t1-file.jpg");
    expect(get().project.brochureImages[0].previewUrl).toBe("blob:b1-file.jpg");
    expect(get().project.floorPlans[0].previewUrl).toBe("blob:f1-file.jpg");
  });

  it("skips videos and rows without a stored file", async () => {
    const restored = buildRestored();
    const { targets, get } = createTargets(restored);
    const loadPreview = vi.fn(async (fileName: string) => `blob:${fileName}`);

    await loadDraftPreviews(restored, loadPreview, targets);

    expect(loadPreview).not.toHaveBeenCalledWith("video-1-file.jpg");
    expect(findMediaItem(get().single, "video-1")?.previewUrl).toBe("");
    expect(get().project.floorPlans[1].previewUrl).toBe("");
    expect(loadPreview).toHaveBeenCalledTimes(4);
  });

  it("keeps going when one preview fails", async () => {
    const restored = buildRestored();
    const { targets, get } = createTargets(restored);
    const loadPreview = vi.fn(async (fileName: string) => {
      if (fileName === "p1-file.jpg") throw new Error("gone");
      return `blob:${fileName}`;
    });

    await expect(loadDraftPreviews(restored, loadPreview, targets)).resolves.toBeUndefined();

    expect(findMediaItem(get().single, "p1")?.previewUrl).toBe("");
    expect(findMediaItem(get().tab, "t1")?.previewUrl).toBe("blob:t1-file.jpg");
  });

  it("does nothing when nothing was stored", async () => {
    const restored = buildRestored();
    restored.form.photosVideos = createEmptyPhotosVideosValues();
    restored.tabs = EMPTY_SUB_TYPE_FORMS_SNAPSHOT;
    restored.form.projectDetails = { ...restored.form.projectDetails, brochureImages: [], floorPlans: [] };
    const loadPreview = vi.fn();

    await loadDraftPreviews(restored, loadPreview, { updatePhotos: vi.fn(), updateProject: vi.fn() });

    expect(loadPreview).not.toHaveBeenCalled();
  });
});
