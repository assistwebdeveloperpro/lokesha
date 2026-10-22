"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import type { ProjectDetailsValues } from "@/components/master/post-property/postPropertyProjectDetails";
import {
  DEFAULT_RENT_AGE_OF_CONSTRUCTION,
  SUB_TYPES_BY_PROPERTY_TYPE,
  arePhotosRequired,
  createEmptyPhotosVideosValues,
  getTotalMediaCount,
  hasAmenitiesErrors,
  hasPricingOthersErrors,
  hasPropertyDetailsErrors,
  validateAmenities,
  validatePricingOthers,
  validatePropertyDetails,
  type AmenitiesFieldErrors,
  type AmenitiesValues,
  type ListingTypeId,
  type PhotosVideosValues,
  type PricingOthersFieldErrors,
  type PricingOthersValues,
  type PropertyDetailsFieldErrors,
  type PropertyDetailsValues,
  type PropertyTypeId,
} from "./postPropertyForm.shared";

export type SubTypeTab = { id: string; label: string };

const AREA_MAX_FIELDS = [
  "carpetAreaMax",
  "superBuildUpMax",
  "plotAreaMax",
  "terraceAreaMax",
] as const;

type AreaMaxField = (typeof AREA_MAX_FIELDS)[number];
type AreaMaxValues = Record<AreaMaxField, string>;

const EMPTY_AREA_MAX: AreaMaxValues = {
  carpetAreaMax: "",
  superBuildUpMax: "",
  plotAreaMax: "",
  terraceAreaMax: "",
};

const isAreaMaxField = (field: string): field is AreaMaxField =>
  (AREA_MAX_FIELDS as readonly string[]).includes(field);

const pickAreaMax = (project: ProjectDetailsValues): AreaMaxValues => ({
  carpetAreaMax: project.carpetAreaMax,
  superBuildUpMax: project.superBuildUpMax,
  plotAreaMax: project.plotAreaMax,
  terraceAreaMax: project.terraceAreaMax,
});

// Keeps each sub type's own values when the selection changes
function reconcileBySubType<T>(
  previousIds: string[],
  nextIds: string[],
  map: Record<string, T>,
  single: T,
  createFallback: () => T,
  onDropped?: (value: T) => void,
): { map: Record<string, T>; single: T } {
  const seeded: Record<string, T> =
    previousIds.length > 1
      ? map
      : previousIds.length === 1
        ? { [previousIds[0]]: single }
        : {};
  const kept: Record<string, T> = {};

  for (const [id, value] of Object.entries(seeded)) {
    if (nextIds.includes(id)) {
      kept[id] = value;
    } else {
      onDropped?.(value);
    }
  }

  if (nextIds.length > 1) {
    return { map: kept, single };
  }

  return { map: {}, single: kept[nextIds[0]] ?? createFallback() };
}

function revokePhotoPreviews(photos: PhotosVideosValues) {
  for (const items of Object.values(photos.mediaByCategory)) {
    items.forEach((item) => URL.revokeObjectURL(item.previewUrl));
  }
  if (photos.brochure) {
    URL.revokeObjectURL(photos.brochure.previewUrl);
  }
}

function mergePhotos(list: PhotosVideosValues[]): PhotosVideosValues {
  const merged = createEmptyPhotosVideosValues();

  for (const photos of list) {
    for (const key of Object.keys(merged.mediaByCategory) as Array<
      keyof PhotosVideosValues["mediaByCategory"]
    >) {
      merged.mediaByCategory[key] = [
        ...merged.mediaByCategory[key],
        ...photos.mediaByCategory[key],
      ];
    }
    merged.brochure = merged.brochure ?? photos.brochure;
  }

  return merged;
}

function applyDetailsChange<K extends keyof PropertyDetailsValues>(
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

function clearDetailsErrors(
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

function clearAmenitiesErrors(
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

function clearPricingErrors(
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

function omitKey<T>(source: Record<string, T>, id: string): Record<string, T> {
  return Object.fromEntries(Object.entries(source).filter(([key]) => key !== id));
}

type Step = "details" | "amenities" | "photos" | "pricing";

// Per sub type form state for steps 2-5 when several sub types are selected
export function useSubTypeForms({
  propertyType,
  listingType,
  isRent,
  subTypes,
  builder = false,
  initials,
  single,
  setSingle,
  project,
  anchors,
  existingMediaCount,
  filterDetailsErrors = (errors) => errors,
  filterPricingErrors = (errors) => errors,
  commonDetailsFields = [],
  commonAmenitiesFields = [],
  sharedPhotos = false,
}: {
  propertyType: PropertyTypeId;
  listingType: ListingTypeId;
  isRent: boolean;
  subTypes: string[];
  builder?: boolean;
  initials: {
    details: PropertyDetailsValues;
    amenities: AmenitiesValues;
    pricing: PricingOthersValues;
  };
  single: {
    details: PropertyDetailsValues;
    amenities: AmenitiesValues;
    pricing: PricingOthersValues;
    photos: PhotosVideosValues;
  };
  setSingle: {
    details: Dispatch<SetStateAction<PropertyDetailsValues>>;
    amenities: Dispatch<SetStateAction<AmenitiesValues>>;
    pricing: Dispatch<SetStateAction<PricingOthersValues>>;
    photos: Dispatch<SetStateAction<PhotosVideosValues>>;
    project: Dispatch<SetStateAction<ProjectDetailsValues>>;
  };
  project: ProjectDetailsValues;
  anchors: { possession?: string; availableFrom?: string };
  existingMediaCount: number;
  filterDetailsErrors?: (errors: PropertyDetailsFieldErrors) => PropertyDetailsFieldErrors;
  filterPricingErrors?: (errors: PricingOthersFieldErrors) => PricingOthersFieldErrors;
  // Detail fields asked once above the tabs; every tab reads the first tab's value
  commonDetailsFields?: ReadonlyArray<keyof PropertyDetailsValues>;
  // Amenity fields asked once above the tabs; every tab reads the first tab's value
  commonAmenitiesFields?: ReadonlyArray<keyof AmenitiesValues>;
  // One photo set for the whole project, kept on the first tab
  sharedPhotos?: boolean;
}) {
  const [details, setDetails] = useState<Record<string, PropertyDetailsValues>>({});
  const [detailsErrors, setDetailsErrors] = useState<
    Record<string, PropertyDetailsFieldErrors>
  >({});
  const [areaMax, setAreaMax] = useState<Record<string, AreaMaxValues>>({});
  const [amenities, setAmenities] = useState<Record<string, AmenitiesValues>>({});
  const [amenitiesErrors, setAmenitiesErrors] = useState<
    Record<string, AmenitiesFieldErrors>
  >({});
  const [pricing, setPricing] = useState<Record<string, PricingOthersValues>>({});
  const [pricingErrors, setPricingErrors] = useState<
    Record<string, PricingOthersFieldErrors>
  >({});
  const [photos, setPhotos] = useState<Record<string, PhotosVideosValues>>({});
  const [photosErrors, setPhotosErrors] = useState<Record<string, string>>({});
  const [activeId, setActiveId] = useState("");

  const tabs: SubTypeTab[] =
    subTypes.length > 1
      ? (SUB_TYPES_BY_PROPERTY_TYPE[propertyType] ?? [])
          .filter((option) => subTypes.includes(option.id))
          .map((option) => ({ id: option.id, label: option.label }))
      : [];
  const isMulti = tabs.length > 1;
  const activeTabId = tabs.some((tab) => tab.id === activeId)
    ? activeId
    : (tabs[0]?.id ?? "");
  const firstTabId = tabs[0]?.id ?? "";

  const createInitialDetails = (): PropertyDetailsValues => {
    const isPlot = propertyType === "plot";
    return {
      ...initials.details,
      propertyTransaction: isPlot ? "new" : "",
      managedBy: isPlot ? "Landlord" : "",
      ageOfConstruction: isRent ? DEFAULT_RENT_AGE_OF_CONSTRUCTION : "",
    };
  };

  const getDetails = (id: string): PropertyDetailsValues => {
    const own = details[id] ?? createInitialDetails();
    if (id === firstTabId || commonDetailsFields.length === 0) {
      return own;
    }

    const lead = details[firstTabId] ?? createInitialDetails();
    const shared = { ...own };
    for (const field of commonDetailsFields) {
      (shared as Record<string, unknown>)[field] = lead[field];
    }
    return shared;
  };
  const getAmenities = (id: string): AmenitiesValues => {
    const own = amenities[id] ?? initials.amenities;
    if (id === firstTabId || commonAmenitiesFields.length === 0) {
      return own;
    }

    const lead = amenities[firstTabId] ?? initials.amenities;
    const shared = { ...own };
    for (const field of commonAmenitiesFields) {
      (shared as Record<string, unknown>)[field] = lead[field];
    }
    return shared;
  };
  const getPricing = (id: string) => pricing[id] ?? initials.pricing;
  const getPhotos = (id: string) => photos[id] ?? createEmptyPhotosVideosValues();

  // Area max values are kept per sub type, everything else stays project wide
  const getProject = (id: string): ProjectDetailsValues => ({
    ...project,
    ...EMPTY_AREA_MAX,
    ...areaMax[id],
  });

  const changeProject = <K extends keyof ProjectDetailsValues>(
    id: string,
    field: K,
    value: ProjectDetailsValues[K],
    changeProjectWide: (field: K, value: ProjectDetailsValues[K]) => void,
  ) => {
    if (!isAreaMaxField(field)) {
      changeProjectWide(field, value);
      return;
    }

    setAreaMax((current) => ({
      ...current,
      [id]: { ...EMPTY_AREA_MAX, ...current[id], [field]: String(value) },
    }));
  };

  const changeDetails = <K extends keyof PropertyDetailsValues>(
    id: string,
    field: K,
    value: PropertyDetailsValues[K],
  ) => {
    setDetails((current) => ({
      ...current,
      [id]: applyDetailsChange(current[id] ?? createInitialDetails(), field, value),
    }));
    setDetailsErrors((current) =>
      current[id]
        ? { ...current, [id]: clearDetailsErrors(current[id], field) }
        : current,
    );
  };

  const changeAmenities = <K extends keyof AmenitiesValues>(
    id: string,
    field: K,
    value: AmenitiesValues[K],
  ) => {
    setAmenities((current) => ({
      ...current,
      [id]: { ...initials.amenities, ...current[id], [field]: value },
    }));
    setAmenitiesErrors((current) =>
      current[id]
        ? { ...current, [id]: clearAmenitiesErrors(current[id], field) }
        : current,
    );
  };

  const changePricing = <K extends keyof PricingOthersValues>(
    id: string,
    field: K,
    value: PricingOthersValues[K],
  ) => {
    setPricing((current) => ({
      ...current,
      [id]: { ...initials.pricing, ...current[id], [field]: value },
    }));
    setPricingErrors((current) =>
      current[id]
        ? { ...current, [id]: clearPricingErrors(current[id], field) }
        : current,
    );
  };

  // Common details are written to every tab, so removing the first tab keeps them
  const changeDetailsAll = <K extends keyof PropertyDetailsValues>(
    field: K,
    value: PropertyDetailsValues[K],
  ) => tabs.forEach((tab) => changeDetails(tab.id, field, value));

  const isCommonDetailsField = (field: string) =>
    (commonDetailsFields as ReadonlyArray<string>).includes(field);

  // Builder parking is asked once for the project, so its errors never belong to a tab
  const isCommonAmenitiesField = (field: string) =>
    (commonAmenitiesFields as ReadonlyArray<string>).includes(field) ||
    (builder && ["carParking", "carParkingAvailable", "clubMembership"].includes(field));

  const getCommonAmenitiesErrors = (): AmenitiesFieldErrors => {
    const merged: Record<string, unknown> = {};
    for (const errors of Object.values(amenitiesErrors)) {
      for (const [field, message] of Object.entries(errors)) {
        if (isCommonAmenitiesField(field) && !(field in merged)) {
          merged[field] = message;
        }
      }
    }
    return merged as AmenitiesFieldErrors;
  };

  const getCommonDetailsErrors = (): PropertyDetailsFieldErrors => {
    const merged: Record<string, unknown> = {};
    for (const errors of Object.values(detailsErrors)) {
      for (const [field, message] of Object.entries(errors)) {
        if (isCommonDetailsField(field) && !(field in merged)) {
          merged[field] = message;
        }
      }
    }
    return merged as PropertyDetailsFieldErrors;
  };

  // Project wide values (parking, charges) are written to every tab
  const changeAmenitiesAll = <K extends keyof AmenitiesValues>(
    field: K,
    value: AmenitiesValues[K],
  ) => tabs.forEach((tab) => changeAmenities(tab.id, field, value));

  const changePricingAll = <K extends keyof PricingOthersValues>(
    field: K,
    value: PricingOthersValues[K],
  ) => tabs.forEach((tab) => changePricing(tab.id, field, value));

  const changePhotos = (id: string, next: PhotosVideosValues) => {
    setPhotos((current) => ({ ...current, [id]: next }));
    setPhotosErrors((current) => (current[id] ? omitKey(current, id) : current));
  };

  const getPhotosError = (id: string, values: PhotosVideosValues) =>
    arePhotosRequired(propertyType, { listingType, subType: id }) &&
    getTotalMediaCount(values) + (id === firstTabId ? existingMediaCount : 0) === 0
      ? "Please add at least one photo"
      : "";

  const collect = <E,>(
    hasErrors: (errors: E) => boolean,
    validate: (id: string) => E,
  ) => {
    const result: Record<string, E> = {};
    for (const tab of tabs) {
      const errors = validate(tab.id);
      if (hasErrors(errors)) {
        result[tab.id] = errors;
      }
    }
    return result;
  };

  const validators = {
    details: () =>
      collect(hasPropertyDetailsErrors, (id) =>
        filterDetailsErrors(
          validatePropertyDetails(getDetails(id), {
            listingType,
            propertyType,
            subType: id,
            possessionDatePastAnchor: anchors.possession || undefined,
            availableFromPastAnchor: anchors.availableFrom || undefined,
            builder,
          }),
        ),
      ),
    amenities: () =>
      collect(hasAmenitiesErrors, (id) =>
        validateAmenities(getAmenities(id), propertyType, {
          listingType,
          subType: id,
          builder,
        }),
      ),
    pricing: () =>
      collect(hasPricingOthersErrors, (id) =>
        filterPricingErrors(
          validatePricingOthers(getPricing(id), listingType, propertyType, id),
        ),
      ),
    photos: () => {
      const result: Record<string, string> = {};
      for (const tab of sharedPhotos ? tabs.slice(0, 1) : tabs) {
        const message = getPhotosError(tab.id, getPhotos(tab.id));
        if (message) {
          result[tab.id] = message;
        }
      }
      return result;
    },
  };

  // Validates a step, stores the errors and opens the first tab that has any
  const validateStep = (step: Step): boolean => {
    const errors =
      step === "details"
        ? validators.details()
        : step === "amenities"
          ? validators.amenities()
          : step === "pricing"
            ? validators.pricing()
            : validators.photos();

    if (step === "details") setDetailsErrors(errors as typeof detailsErrors);
    if (step === "amenities") setAmenitiesErrors(errors as typeof amenitiesErrors);
    if (step === "pricing") setPricingErrors(errors as typeof pricingErrors);
    if (step === "photos") setPhotosErrors(errors as typeof photosErrors);

    // Errors of common fields show above the tabs, so they do not pick a tab
    const hasOwnErrors = (id: string) =>
      Object.keys(detailsErrorsOf(errors, id)).some(
        (field) =>
          !(step === "details" && isCommonDetailsField(field)) &&
          !(step === "amenities" && isCommonAmenitiesField(field)) &&
          !(step === "photos" && sharedPhotos),
      );
    const first = tabs.find((tab) => tab.id in errors && hasOwnErrors(tab.id));
    if (first) {
      setActiveId(first.id);
    }
    return Object.keys(errors).length > 0;
  };

  const detailsErrorsOf = (errors: object, id: string): Record<string, unknown> =>
    (errors as Record<string, Record<string, unknown>>)[id] ?? {};

  const errorIds = {
    details: Object.keys(detailsErrors).filter((id) =>
      Object.keys(detailsErrors[id]).some((field) => !isCommonDetailsField(field)),
    ),
    amenities: Object.keys(amenitiesErrors).filter((id) =>
      Object.keys(amenitiesErrors[id]).some((field) => !isCommonAmenitiesField(field)),
    ),
    pricing: Object.keys(pricingErrors),
    photos: Object.keys(photosErrors),
  };

  // Applies a new sub type selection, keeping the values of sub types that stay
  const changeSelection = (nextSubTypes: string[]) => {
    const reconcile = <T,>(
      map: Record<string, T>,
      value: T,
      createFallback: () => T,
      onDropped?: (dropped: T) => void,
    ) =>
      reconcileBySubType(subTypes, nextSubTypes, map, value, createFallback, onDropped);
    const keepIds = <T,>(source: Record<string, T>) =>
      Object.fromEntries(
        Object.entries(source).filter(([id]) => nextSubTypes.includes(id)),
      );

    const nextDetails = reconcile(details, single.details, createInitialDetails);
    const nextAreaMax = reconcile(areaMax, pickAreaMax(project), () => EMPTY_AREA_MAX);
    const nextAmenities = reconcile(amenities, single.amenities, () => initials.amenities);
    const nextPricing = reconcile(pricing, single.pricing, () => initials.pricing);
    const nextPhotos = reconcile(
      photos,
      single.photos,
      createEmptyPhotosVideosValues,
      revokePhotoPreviews,
    );

    setSingle.details(nextDetails.single);
    setDetails(nextDetails.map);
    setAreaMax(nextAreaMax.map);
    if (nextSubTypes.length <= 1) {
      setSingle.project((current) => ({ ...current, ...nextAreaMax.single }));
    }
    setSingle.amenities(nextAmenities.single);
    setAmenities(nextAmenities.map);
    setSingle.pricing(nextPricing.single);
    setPricing(nextPricing.map);
    setSingle.photos(nextPhotos.single);
    setPhotos(nextPhotos.map);

    setDetailsErrors(keepIds);
    setAmenitiesErrors(keepIds);
    setPricingErrors(keepIds);
    setPhotosErrors(keepIds);
  };

  const reset = () => {
    Object.values(photos).forEach(revokePhotoPreviews);
    setDetails({});
    setDetailsErrors({});
    setAreaMax({});
    setAmenities({});
    setAmenitiesErrors({});
    setPricing({});
    setPricingErrors({});
    setPhotos({});
    setPhotosErrors({});
  };

  const mapPhotos = (update: (values: PhotosVideosValues) => PhotosVideosValues) =>
    setPhotos((current) =>
      Object.fromEntries(
        Object.entries(current).map(([id, values]) => [id, update(values)]),
      ),
    );

  // Listing type change clears the construction fields of every tab
  const resetListingFields = (
    reset: (values: PropertyDetailsValues) => PropertyDetailsValues,
  ) => {
    setDetails((current) =>
      Object.fromEntries(
        Object.entries(current).map(([id, values]) => [id, reset(values)]),
      ),
    );
    setDetailsErrors({});
    setPricingErrors({});
  };

  // The payload still carries a single set of values until the backend supports a list
  const getSubmitValues = () => ({
    details: getDetails(firstTabId),
    amenities: getAmenities(firstTabId),
    pricing: getPricing(firstTabId),
    photos: mergePhotos(tabs.map((tab) => getPhotos(tab.id))),
  });

  return {
    tabs,
    isMulti,
    activeTabId,
    setActiveId,
    firstTabId,
    errorIds,
    getDetails,
    getAmenities,
    getPricing,
    getPhotos,
    getProject,
    detailsErrors,
    amenitiesErrors,
    pricingErrors,
    photosErrors,
    changeDetails,
    changeDetailsAll,
    getCommonDetailsErrors,
    getCommonAmenitiesErrors,
    changeAmenities,
    changePricing,
    changeAmenitiesAll,
    changePricingAll,
    changePhotos,
    mapPhotos,
    changeProject,
    validateStep,
    changeSelection,
    reset,
    resetListingFields,
    getSubmitValues,
  };
}
