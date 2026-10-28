import type {
  AmenitiesFieldErrors,
  AmenitiesValues,
  PhotosVideosValues,
  PricingOthersFieldErrors,
  PricingOthersValues,
  PropertyDetailsFieldErrors,
  PropertyDetailsValues,
} from "../config/postPropertyForm.shared";

const DETAILS_ERROR_FIELDS = new Set<string>([
  "carpetAreaNumber",
  "carpetAreaType",
  "superBuildUpNumber",
  "superBuildUpType",
  "availableFrom",
  "leaseContractTill",
  "tenantPreferences",
  "pgName",
  "occupancies",
  "pgGender",
  "propertyTransaction",
  "constructionStatus",
  "ageOfConstruction",
  "possessionDate",
  "bedrooms",
  "balcony",
  "totalFloors",
  "floorNumber",
  "bathrooms",
  "plotAreaNumber",
  "plotAreaType",
  "terraceAreaNumber",
  "terraceAreaType",
  "penthouseType",
  "floorsAllowed",
  "currentlyLeasedOut",
]);

export function applyDetailsChange<K extends keyof PropertyDetailsValues>(
  current: PropertyDetailsValues,
  field: K,
  value: PropertyDetailsValues[K],
): PropertyDetailsValues {
  const next = { ...current, [field]: value };

  if (field === "propertyTransaction") {
    next.constructionStatus = "";
    next.possessionDate = "";
    next.ageOfConstruction = "";
  }

  if (field === "totalFloors") {
    next.floorNumber = "";
  }

  return next;
}

export function clearDetailsErrors(
  current: PropertyDetailsFieldErrors,
  field: keyof PropertyDetailsValues,
): PropertyDetailsFieldErrors {
  const fieldsToClear = new Set<keyof PropertyDetailsFieldErrors>();

  if (DETAILS_ERROR_FIELDS.has(field)) {
    fieldsToClear.add(field as keyof PropertyDetailsFieldErrors);
  }
  if (field === "propertyTransaction") {
    fieldsToClear.add("constructionStatus");
    fieldsToClear.add("possessionDate");
    fieldsToClear.add("ageOfConstruction");
  }
  if (field === "totalFloors") {
    fieldsToClear.add("floorNumber");
  }

  if (![...fieldsToClear].some((key) => key in current)) {
    return current;
  }

  const next = { ...current };
  for (const key of fieldsToClear) {
    delete next[key];
  }
  return next;
}

export function clearAmenitiesErrors(
  current: AmenitiesFieldErrors,
  field: keyof AmenitiesValues,
): AmenitiesFieldErrors {
  const next = { ...current };
  delete next[field as keyof AmenitiesFieldErrors];
  if (field === "status") {
    delete next.furnishing;
  }
  if (field === "carParkingAvailable") {
    delete next.carParking;
  }
  return Object.keys(next).length === Object.keys(current).length
    ? current
    : next;
}

export function clearPricingErrors(
  current: PricingOthersFieldErrors,
  field: keyof PricingOthersValues,
): PricingOthersFieldErrors {
  if (!(field in current)) {
    return current;
  }

  const next = { ...current };
  delete next[field as keyof PricingOthersFieldErrors];
  return next;
}

const omitKeys = <T extends object>(source: T, keys: ReadonlyArray<keyof T>): T => {
  const next = { ...source };
  for (const key of keys) {
    delete next[key];
  }
  return next;
};

// Builder form hides these fields, so their errors must not block the steps
export function withoutHiddenDetailsErrors(
  errors: PropertyDetailsFieldErrors,
  builder: boolean,
  bhkAreas = false,
): PropertyDetailsFieldErrors {
  if (!builder) {
    return errors;
  }

  const hidden: Array<keyof PropertyDetailsFieldErrors> = [
    "bedrooms",
    "balcony",
    "floorNumber",
    "bathrooms",
    ...(bhkAreas
      ? (["carpetAreaNumber", "carpetAreaType", "superBuildUpNumber", "superBuildUpType"] as const)
      : []),
  ];

  return omitKeys(errors, hidden);
}

export function withoutHiddenPricingErrors(
  errors: PricingOthersFieldErrors,
  builder: boolean,
): PricingOthersFieldErrors {
  return builder ? omitKeys(errors, ["expectedPrice", "bookingAmount"]) : errors;
}

// Returns the same object when there is nothing to clear
export function withoutConstructionProgress(
  photos: PhotosVideosValues,
): PhotosVideosValues {
  if (photos.mediaByCategory["construction-progress"].length === 0) {
    return photos;
  }

  return {
    ...photos,
    mediaByCategory: { ...photos.mediaByCategory, "construction-progress": [] },
  };
}

export function revokeConstructionProgressPreviews(photos: PhotosVideosValues) {
  photos.mediaByCategory["construction-progress"].forEach((item) =>
    URL.revokeObjectURL(item.previewUrl),
  );
}

export function revokePhotoPreviews(photos: PhotosVideosValues) {
  for (const items of Object.values(photos.mediaByCategory)) {
    items.forEach((item) => URL.revokeObjectURL(item.previewUrl));
  }
  if (photos.brochure) {
    URL.revokeObjectURL(photos.brochure.previewUrl);
  }
}
