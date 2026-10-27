import type {
  BrochureImage,
  FloorPlanRow,
  ProjectDetailsValues,
} from "@/components/master/post-property/postPropertyProjectDetails";
import {
  PHOTO_CATEGORY_OPTIONS,
  createEmptyPhotosVideosValues,
  type PhotosVideosValues,
  type PropertyMediaFile,
} from "../config/postPropertyForm.shared";
import type { UploadedFileRef } from "../utils/mediaUploader";

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function readRemote(value: unknown): UploadedFileRef | null {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.path !== "string") {
    return null;
  }
  return { id: value.id, path: value.path };
}

// Only files that reached the server are kept; a draft cannot hold a browser file
const isStored = (item: { status?: string; remote?: UploadedFileRef }) =>
  item.status === "uploaded" && Boolean(item.remote);

function serializeMedia(media: PropertyMediaFile): PropertyMediaFile {
  return {
    id: media.id,
    name: media.name,
    type: media.type,
    status: "uploaded",
    remote: media.remote,
    previewUrl: "",
  };
}

export function serializePhotos(values: PhotosVideosValues): PhotosVideosValues {
  const photos = createEmptyPhotosVideosValues();

  for (const category of PHOTO_CATEGORY_OPTIONS) {
    photos.mediaByCategory[category.id] = values.mediaByCategory[category.id]
      .filter(isStored)
      .map(serializeMedia);
  }
  photos.brochure = values.brochure && isStored(values.brochure) ? serializeMedia(values.brochure) : null;

  return photos;
}

function parseMedia(raw: unknown): PropertyMediaFile | null {
  const remote = isRecord(raw) ? readRemote(raw.remote) : null;
  if (!isRecord(raw) || !remote || typeof raw.id !== "string") {
    return null;
  }

  return {
    id: raw.id,
    name: typeof raw.name === "string" ? raw.name : remote.id,
    type: raw.type === "video" ? "video" : "image",
    status: "uploaded",
    remote,
    previewUrl: "",
  };
}

export function parsePhotos(raw: unknown): PhotosVideosValues {
  const photos = createEmptyPhotosVideosValues();
  if (!isRecord(raw)) return photos;

  const byCategory = isRecord(raw.mediaByCategory) ? raw.mediaByCategory : {};
  for (const category of PHOTO_CATEGORY_OPTIONS) {
    const list = byCategory[category.id];
    photos.mediaByCategory[category.id] = Array.isArray(list)
      ? list.map(parseMedia).filter((media): media is PropertyMediaFile => media !== null)
      : [];
  }
  photos.brochure = parseMedia(raw.brochure);

  return photos;
}

export function serializePhotosMap(map: Record<string, PhotosVideosValues>) {
  return Object.fromEntries(Object.entries(map).map(([id, values]) => [id, serializePhotos(values)]));
}

export function parsePhotosMap(raw: unknown): Record<string, PhotosVideosValues> {
  if (!isRecord(raw)) return {};
  return Object.fromEntries(Object.entries(raw).map(([id, values]) => [id, parsePhotos(values)]));
}

function serializeBrochureImage(image: BrochureImage): BrochureImage {
  return { id: image.id, name: image.name, status: "uploaded", remote: image.remote, previewUrl: "" };
}

function serializeFloorPlan(row: FloorPlanRow): FloorPlanRow {
  const base = { id: row.id, label: row.label, planType: row.planType, file: null, previewUrl: "" };
  return isStored(row) ? { ...base, status: "uploaded", remote: row.remote } : base;
}

// Project details keep their text values; only uploaded images and floor plans are stored
export function serializeProjectFiles(project: ProjectDetailsValues): ProjectDetailsValues {
  return {
    ...project,
    brochureImages: project.brochureImages.filter(isStored).map(serializeBrochureImage),
    floorPlans: project.floorPlans.map(serializeFloorPlan),
  };
}

export function parseProjectFiles(project: ProjectDetailsValues): ProjectDetailsValues {
  const brochureImages = (Array.isArray(project.brochureImages) ? project.brochureImages : []).flatMap(
    (raw): BrochureImage[] => {
      const remote = readRemote(raw?.remote);
      return remote && typeof raw.id === "string" ? [{ ...serializeBrochureImage({ ...raw, remote }) }] : [];
    },
  );
  const floorPlans = (Array.isArray(project.floorPlans) ? project.floorPlans : []).flatMap(
    (raw): FloorPlanRow[] => {
      if (!isRecord(raw) || typeof raw.id !== "string") return [];

      const remote = readRemote(raw.remote);
      const row = serializeFloorPlan({
        ...(raw as unknown as FloorPlanRow),
        ...(remote ? { status: "uploaded" as const, remote } : { status: undefined, remote: undefined }),
      });
      return [row];
    },
  );

  return { ...project, brochureImages, floorPlans };
}
