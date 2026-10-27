import { createInitialProjectDetails } from "@/components/master/post-property/postPropertyProjectDetails";
import type { DraftFormData, DraftFormSummary } from "@/services/property.service";
import { getBuilderConfig } from "../builder/builderConfig";
import { isPostingAsId, type PostingAsId } from "../config/postingAs";
import {
  LISTING_TYPES,
  PROPERTY_TYPES,
  SUB_TYPES_BY_PROPERTY_TYPE,
  type ListingTypeId,
  type PropertyTypeId,
} from "../config/postPropertyForm.shared";
import {
  EMPTY_SUB_TYPE_FORMS_SNAPSHOT,
  type SubTypeFormsSnapshot,
} from "../hooks/useSubTypeForms";
import {
  parsePhotos,
  parsePhotosMap,
  parseProjectFiles,
  serializePhotos,
  serializePhotosMap,
  serializeProjectFiles,
} from "./postPropertyDraftFiles";
import type { PostPropertyDraft } from "./postPropertyFormReducer";
import {
  INITIAL_ADDRESS_LOCATION,
  INITIAL_AMENITIES,
  INITIAL_PRICING_OTHERS,
  INITIAL_PROPERTY_DETAILS,
} from "./postPropertyInitialValues";

// Bump when the saved shape changes in a way old drafts cannot be read
export const DRAFT_SNAPSHOT_VERSION = 1;

// The part of the form state a server draft keeps; errors and edit-only values are left out
export type SerializableFormState = Pick<
  PostPropertyDraft,
  | "listingType"
  | "propertyType"
  | "propertySubTypes"
  | "addressLocation"
  | "propertyDetails"
  | "amenities"
  | "pricingOthers"
  | "projectDetails"
  | "photosVideos"
>;

export type RestoredDraft = {
  form: SerializableFormState;
  postingAs: PostingAsId | "";
  tabs: SubTypeFormsSnapshot;
};

export type DraftSnapshotInput = {
  form: SerializableFormState;
  postingAs: PostingAsId | "";
  tabs: SubTypeFormsSnapshot;
};

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

function buildSummary({ form }: DraftSnapshotInput): DraftFormSummary {
  return {
    listingType: form.listingType,
    propertyType: form.propertyType,
    subTypes: form.propertySubTypes,
    locality: form.addressLocation.locality || undefined,
  };
}

export function createDraftFormData(input: DraftSnapshotInput): DraftFormData {
  return {
    version: DRAFT_SNAPSHOT_VERSION,
    summary: buildSummary(input),
    postingAs: input.postingAs,
    // Only files that reached the server are kept
    form: {
      ...input.form,
      photosVideos: serializePhotos(input.form.photosVideos),
      projectDetails: serializeProjectFiles(input.form.projectDetails),
    },
    tabs: { ...input.tabs, photos: serializePhotosMap(input.tabs.photos) },
  };
}

function readListingType(value: unknown): ListingTypeId | null {
  return LISTING_TYPES.find((option) => option.id === value)?.id ?? null;
}

function readPropertyType(value: unknown): PropertyTypeId | null {
  return PROPERTY_TYPES.find((option) => option.id === value)?.id ?? null;
}

// Types without sub types (PG) keep the empty id the form uses for them
function readSubTypes(value: unknown, propertyType: PropertyTypeId): string[] {
  const options = SUB_TYPES_BY_PROPERTY_TYPE[propertyType];
  if (!options) return [""];

  const valid = isStringArray(value)
    ? value.filter((id) => options.some((option) => option.id === id))
    : [];
  return valid.length ? valid : [options[0].id];
}

// Saved values sit on top of the initial ones, so fields added later still have a value
function mergeValues<T extends object>(initial: T, saved: unknown): T {
  return isRecord(saved) ? { ...initial, ...(saved as Partial<T>) } : initial;
}

function mergeRecordValues<T extends object>(initial: T, saved: unknown): Record<string, T> {
  if (!isRecord(saved)) return {};

  return Object.fromEntries(Object.entries(saved).map(([id, values]) => [id, mergeValues(initial, values)]));
}

function readTabs(value: unknown, subTypes: string[]): SubTypeFormsSnapshot {
  if (!isRecord(value)) return EMPTY_SUB_TYPE_FORMS_SNAPSHOT;

  const activeId = typeof value.activeId === "string" && subTypes.includes(value.activeId) ? value.activeId : "";
  const keepKnown = <T>(source: Record<string, T>) =>
    Object.fromEntries(Object.entries(source).filter(([id]) => subTypes.includes(id)));

  return {
    activeId,
    details: keepKnown(mergeRecordValues(INITIAL_PROPERTY_DETAILS, value.details)),
    areaMax: keepKnown(mergeRecordValues({ carpetAreaMax: "", superBuildUpMax: "", plotAreaMax: "", terraceAreaMax: "" }, value.areaMax)),
    amenities: keepKnown(mergeRecordValues(INITIAL_AMENITIES, value.amenities)),
    pricing: keepKnown(mergeRecordValues(INITIAL_PRICING_OTHERS, value.pricing)),
    photos: keepKnown(parsePhotosMap(value.photos)),
  };
}

// Returns null for drafts this version cannot read; the caller then starts a clean form
export function hydrateFormState(formData: DraftFormData): RestoredDraft | null {
  if (formData.version !== DRAFT_SNAPSHOT_VERSION || !isRecord(formData.form)) {
    return null;
  }

  const saved = formData.form;
  const listingType = readListingType(saved.listingType);
  const propertyType = readPropertyType(saved.propertyType);
  if (!listingType || !propertyType) {
    return null;
  }

  const propertySubTypes = readSubTypes(saved.propertySubTypes, propertyType);
  const defaultUnitType = getBuilderConfig(propertyType, propertySubTypes[0]).defaultUnitType;

  return {
    form: {
      listingType,
      propertyType,
      propertySubTypes,
      addressLocation: mergeValues(INITIAL_ADDRESS_LOCATION, saved.addressLocation),
      propertyDetails: mergeValues(INITIAL_PROPERTY_DETAILS, saved.propertyDetails),
      amenities: mergeValues(INITIAL_AMENITIES, saved.amenities),
      pricingOthers: mergeValues(INITIAL_PRICING_OTHERS, saved.pricingOthers),
      photosVideos: parsePhotos(saved.photosVideos),
      projectDetails: parseProjectFiles(
        mergeValues(createInitialProjectDetails(defaultUnitType), saved.projectDetails),
      ),
    },
    postingAs:
      typeof formData.postingAs === "string" && isPostingAsId(formData.postingAs) ? formData.postingAs : "",
    tabs: readTabs(formData.tabs, propertySubTypes),
  };
}
