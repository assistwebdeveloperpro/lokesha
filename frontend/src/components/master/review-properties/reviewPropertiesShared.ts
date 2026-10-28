import {
  PROJECT_PHOTO_CATEGORY_IDS,
  type PhotoCategoryId,
} from "@/components/shared/post-property/config/postPropertyForm.shared";
import type { PropertyDetailResponse, PropertyMediaFileDto } from "@/services/property.service";
import type { ReviewStatus } from "@/services/propertyReview.service";

export function getDetailListingFiles(detail: PropertyDetailResponse) {
  return (
    detail.listingFiles ?? [
      { propertyId: detail.property.id, media: detail.media, floorPlans: detail.floorPlans },
    ]
  );
}

export function getProjectLevelImages(detail: PropertyDetailResponse, isMultiSubType: boolean) {
  if (!isMultiSubType) return [];
  const media = getDetailListingFiles(detail)[0]?.media ?? [];
  return media.filter(
    (item) =>
      item.mediaType === "image" &&
      PROJECT_PHOTO_CATEGORY_IDS.includes(item.category as PhotoCategoryId),
  );
}

export function getMainPhotoImage(
  detail: PropertyDetailResponse,
  isMultiSubType: boolean,
): PropertyMediaFileDto | null {
  if (isMultiSubType) {
    const projectImages = getProjectLevelImages(detail, true);
    return projectImages.find((item) => item.category === "main-photo") ?? projectImages[0] ?? null;
  }

  const media = getDetailListingFiles(detail)[0]?.media ?? detail.media;
  return (
    media.find((item) => item.mediaType === "image" && item.category === "main-photo") ??
    media.find((item) => item.mediaType === "image") ??
    null
  );
}

export function getSubTypeListingImages(
  detail: PropertyDetailResponse,
  index: number,
  isMultiSubType: boolean,
) {
  const listingFiles = getDetailListingFiles(detail);
  const media =
    listingFiles[index]?.media ?? (index === 0 && !isMultiSubType ? detail.media : []);

  return media.filter((item) => {
    if (item.mediaType !== "image") return false;
    if (isMultiSubType) {
      return !PROJECT_PHOTO_CATEGORY_IDS.includes(item.category as PhotoCategoryId);
    }
    if (item.category === "main-photo") return false;
    return true;
  });
}

export function getSupplementalProjectImages(
  detail: PropertyDetailResponse,
  isMultiSubType: boolean,
  mainPhoto: PropertyMediaFileDto | null,
) {
  return getProjectLevelImages(detail, isMultiSubType).filter((item) => item.id !== mainPhoto?.id);
}

export const PAGE_SIZE = 12;

export const REVIEW_EMPTY_STATES: Record<
  ReviewStatus,
  { title: string; description: string }
> = {
  pending: {
    title: "Nothing in the queue",
    description: "No properties are waiting for review. New submissions will appear here.",
  },
  published: {
    title: "No published listings",
    description: "Properties you approve will show up in this list.",
  },
  rejected: {
    title: "No rejected listings",
    description: "Properties declined during review will be listed here.",
  },
  closed: {
    title: "No closed listings",
    description: "Closed properties will appear here when owners mark them inactive.",
  },
};

// "carpetAreaUnit" -> "Carpet area unit"
export function humanizeKey(key: string): string {
  const words = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function formatValue(value: unknown): string {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

// Entries worth showing: empty values and false flags say nothing to a reviewer
export function toDisplayEntries(fields: Record<string, unknown> | undefined): { label: string; value: string }[] {
  return Object.entries(fields ?? {})
    .filter(([, value]) => value !== "" && value !== null && value !== undefined && value !== false)
    .filter(([, value]) => !Array.isArray(value) || value.length > 0)
    .filter(([, value]) => typeof value !== "object" || Array.isArray(value))
    .map(([key, value]) => ({ label: humanizeKey(key), value: formatValue(value) }));
}
