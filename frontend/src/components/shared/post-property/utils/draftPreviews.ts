import type { ProjectDetailsValues } from "@/components/master/post-property/postPropertyProjectDetails";
import {
  PHOTO_CATEGORY_OPTIONS,
  type PhotosVideosValues,
} from "../config/postPropertyForm.shared";
import type { RestoredDraft } from "../state/postPropertyDraftSnapshot";
import { MAX_PARALLEL_UPLOADS, runWithConcurrency, updateMediaItem } from "./photosVideosValues";

type PreviewJob = {
  fileName: string;
  apply: (previewUrl: string) => void;
};

export type PreviewTargets = {
  // Applies to the single form and every sub type tab; items are found by id
  updatePhotos: (update: (values: PhotosVideosValues) => PhotosVideosValues) => void;
  updateProject: (update: (project: ProjectDetailsValues) => ProjectDetailsValues) => void;
};

function collectPhotoJobs(values: PhotosVideosValues, targets: PreviewTargets): PreviewJob[] {
  return PHOTO_CATEGORY_OPTIONS.flatMap((category) => values.mediaByCategory[category.id])
    .filter((media) => media.type === "image" && media.remote && !media.previewUrl)
    .map((media) => ({
      fileName: media.remote!.id,
      apply: (previewUrl) =>
        targets.updatePhotos((current) => updateMediaItem(current, media.id, (item) => ({ ...item, previewUrl }))),
    }));
}

function collectProjectJobs(project: ProjectDetailsValues, targets: PreviewTargets): PreviewJob[] {
  const withPreview = <T extends { id: string; previewUrl: string }>(rows: T[], id: string, previewUrl: string) =>
    rows.map((row) => (row.id === id ? { ...row, previewUrl } : row));

  const images = project.brochureImages
    .filter((image) => image.remote && !image.previewUrl)
    .map<PreviewJob>((image) => ({
      fileName: image.remote!.id,
      apply: (previewUrl) =>
        targets.updateProject((current) => ({
          ...current,
          brochureImages: withPreview(current.brochureImages, image.id, previewUrl),
        })),
    }));

  const floorPlans = project.floorPlans
    .filter((row) => row.remote && !row.previewUrl)
    .map<PreviewJob>((row) => ({
      fileName: row.remote!.id,
      apply: (previewUrl) =>
        targets.updateProject((current) => ({
          ...current,
          floorPlans: withPreview(current.floorPlans, row.id, previewUrl),
        })),
    }));

  return [...images, ...floorPlans];
}

// Restored files come back without a preview; images are fetched one by one in the background
export async function loadDraftPreviews(
  restored: RestoredDraft,
  loadPreview: (fileName: string) => Promise<string>,
  targets: PreviewTargets,
) {
  const jobs = [
    ...collectPhotoJobs(restored.form.photosVideos, targets),
    ...Object.values(restored.tabs.photos).flatMap((values) => collectPhotoJobs(values, targets)),
    ...collectProjectJobs(restored.form.projectDetails, targets),
  ];

  await runWithConcurrency(jobs, MAX_PARALLEL_UPLOADS, async ({ fileName, apply }) => {
    try {
      apply(await loadPreview(fileName));
    } catch {
      // A missing preview only leaves the placeholder; the file itself is still attached
    }
  });
}
