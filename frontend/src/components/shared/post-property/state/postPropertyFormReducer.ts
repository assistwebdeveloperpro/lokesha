import type { SetStateAction } from "react";
import {
  createInitialProjectDetails,
  getAvailableSizesPriceRange,
  getUnitTypeConfig,
  type ProjectDetailsValues,
} from "@/components/master/post-property/postPropertyProjectDetails";
import type { PropertyMedia } from "@/services/property.service";
import { getBuilderConfig } from "../builder/builderConfig";
import type { BuilderFieldErrors } from "../builder/builderValidation";
import {
  DEFAULT_RENT_AGE_OF_CONSTRUCTION,
  RESIDENTIAL_SUB_TYPES,
  SUB_TYPES_BY_PROPERTY_TYPE,
  createEmptyPhotosVideosValues,
  isRentListing,
  type AddressLocationFieldErrors,
  type AddressLocationValues,
  type AmenitiesFieldErrors,
  type AmenitiesValues,
  type ListingTypeId,
  type PhotosVideosValues,
  type PricingOthersFieldErrors,
  type PricingOthersValues,
  type PropertyDetailsFieldErrors,
  type PropertyDetailsValues,
  type PropertyTypeId,
} from "../config/postPropertyForm.shared";
import type { EditFormState } from "../utils/postPropertyEdit";
import {
  applyDetailsChange,
  clearAmenitiesErrors,
  clearDetailsErrors,
  clearPricingErrors,
  withoutConstructionProgress,
} from "./postPropertyFormState";
import {
  INITIAL_ADDRESS_LOCATION,
  INITIAL_AMENITIES,
  INITIAL_PRICING_OTHERS,
  INITIAL_PROPERTY_DETAILS,
} from "./postPropertyInitialValues";

export type PostPropertyDraft = {
  listingType: ListingTypeId;
  propertyType: PropertyTypeId;
  propertySubTypes: string[];
  addressLocation: AddressLocationValues;
  addressLocationErrors: AddressLocationFieldErrors;
  propertyDetails: PropertyDetailsValues;
  propertyDetailsErrors: PropertyDetailsFieldErrors;
  amenities: AmenitiesValues;
  amenitiesErrors: AmenitiesFieldErrors;
  photosVideos: PhotosVideosValues;
  photosError: string;
  pricingOthers: PricingOthersValues;
  pricingOthersErrors: PricingOthersFieldErrors;
  projectDetails: ProjectDetailsValues;
  builderErrors: BuilderFieldErrors;
  existingMedia: PropertyMedia[];
  removedMediaIds: string[];
  possessionDatePastAnchor: string;
  availableFromPastAnchor: string;
  isSubmitting: boolean;
};

export type DraftErrors = Pick<
  PostPropertyDraft,
  | "addressLocationErrors"
  | "propertyDetailsErrors"
  | "amenitiesErrors"
  | "pricingOthersErrors"
  | "photosError"
  | "builderErrors"
>;

export type PostPropertyAction =
  | { type: "hydrated"; form: EditFormState; media: PropertyMedia[] }
  | { type: "listingTypeChanged"; listingType: ListingTypeId }
  | { type: "propertyTypeChanged"; propertyType: PropertyTypeId }
  | { type: "subTypeChanged"; subType: string }
  | { type: "subTypesChanged"; subTypes: string[] }
  | {
      type: "addressChanged";
      field: keyof AddressLocationValues;
      value: AddressLocationValues[keyof AddressLocationValues];
    }
  | {
      type: "detailsChanged";
      field: keyof PropertyDetailsValues;
      value: PropertyDetailsValues[keyof PropertyDetailsValues];
    }
  | {
      type: "amenitiesChanged";
      field: keyof AmenitiesValues;
      value: AmenitiesValues[keyof AmenitiesValues];
    }
  | {
      type: "pricingChanged";
      field: keyof PricingOthersValues;
      value: PricingOthersValues[keyof PricingOthersValues];
    }
  | {
      type: "projectDetailsChanged";
      field: keyof ProjectDetailsValues;
      value: ProjectDetailsValues[keyof ProjectDetailsValues];
    }
  | { type: "photosChanged"; photos: PhotosVideosValues }
  | { type: "constructionProgressCleared" }
  | { type: "detailsSet"; update: SetStateAction<PropertyDetailsValues> }
  | { type: "amenitiesSet"; update: SetStateAction<AmenitiesValues> }
  | { type: "pricingSet"; update: SetStateAction<PricingOthersValues> }
  | { type: "photosSet"; update: SetStateAction<PhotosVideosValues> }
  | { type: "projectSet"; update: SetStateAction<ProjectDetailsValues> }
  | { type: "existingMediaRemoved"; mediaId: string }
  | { type: "errorsReplaced"; errors: Partial<DraftErrors> }
  | { type: "builderErrorsMerged"; errors: BuilderFieldErrors }
  | { type: "submittingChanged"; isSubmitting: boolean }
  | { type: "draftReset" };

const ADDRESS_FIELDS_WITH_ERRORS = new Set<keyof AddressLocationValues>([
  "projectName",
  "locality",
  "pinCode",
  "propertyDescription",
]);

const resolve = <T>(update: SetStateAction<T>, current: T): T =>
  typeof update === "function" ? (update as (value: T) => T)(current) : update;

const setField = <T extends object>(source: T, field: keyof T, value: T[keyof T]): T => ({
  ...source,
  [field]: value,
});

export function createInitialDraft(): PostPropertyDraft {
  return {
    listingType: "sale",
    propertyType: "residential",
    propertySubTypes: [RESIDENTIAL_SUB_TYPES[0].id],
    addressLocation: INITIAL_ADDRESS_LOCATION,
    addressLocationErrors: {},
    propertyDetails: INITIAL_PROPERTY_DETAILS,
    propertyDetailsErrors: {},
    amenities: INITIAL_AMENITIES,
    amenitiesErrors: {},
    photosVideos: createEmptyPhotosVideosValues(),
    photosError: "",
    pricingOthers: INITIAL_PRICING_OTHERS,
    pricingOthersErrors: {},
    projectDetails: createInitialProjectDetails(
      getBuilderConfig("residential", RESIDENTIAL_SUB_TYPES[0].id).defaultUnitType,
    ),
    builderErrors: {},
    existingMedia: [],
    removedMediaIds: [],
    possessionDatePastAnchor: "",
    availableFromPastAnchor: "",
    isSubmitting: false,
  };
}

// Plot defaults: new transaction, landlord managed
function createStepDefaults(propertyType: PropertyTypeId, listingType: ListingTypeId) {
  const isPlot = propertyType === "plot";

  return {
    propertyDetails: {
      ...INITIAL_PROPERTY_DETAILS,
      propertyTransaction: isPlot ? ("new" as const) : ("" as const),
      managedBy: isPlot ? "Landlord" : "",
      ageOfConstruction: isRentListing(listingType)
        ? DEFAULT_RENT_AGE_OF_CONSTRUCTION
        : ("" as const),
    },
    amenities: INITIAL_AMENITIES,
    pricingOthers: INITIAL_PRICING_OTHERS,
    photosVideos: createEmptyPhotosVideosValues(),
    propertyDetailsErrors: {},
    amenitiesErrors: {},
    pricingOthersErrors: {},
    photosError: "",
  };
}

// Each sub type has its own fields, so the later steps start afresh
function selectSingleSubType(
  state: PostPropertyDraft,
  propertyType: PropertyTypeId,
  listingType: ListingTypeId,
  subType: string,
): PostPropertyDraft {
  return {
    ...state,
    propertyType,
    listingType,
    propertySubTypes: [subType],
    projectDetails: createInitialProjectDetails(
      getBuilderConfig(propertyType, subType).defaultUnitType,
    ),
    builderErrors: {},
    ...createStepDefaults(propertyType, listingType),
  };
}

function clearAddressErrors(
  current: AddressLocationFieldErrors,
  field: keyof AddressLocationValues,
): AddressLocationFieldErrors {
  if (!ADDRESS_FIELDS_WITH_ERRORS.has(field) || !(field in current)) {
    return current;
  }

  const next = { ...current };
  delete next[field as keyof AddressLocationFieldErrors];
  return next;
}

function changeProjectDetails(
  current: ProjectDetailsValues,
  field: keyof ProjectDetailsValues,
  value: ProjectDetailsValues[keyof ProjectDetailsValues],
): ProjectDetailsValues {
  const next = setField(current, field, value);

  if (field === "availableSizes") {
    const range = getAvailableSizesPriceRange(next);
    next.priceMin = range.min;
    next.priceMax = range.max;
  }

  return next;
}

export function postPropertyReducer(
  state: PostPropertyDraft,
  action: PostPropertyAction,
): PostPropertyDraft {
  switch (action.type) {
    case "hydrated": {
      const { form, media } = action;
      return {
        ...state,
        listingType: form.listingType,
        propertyType: form.propertyType,
        propertySubTypes: [form.propertySubType],
        addressLocation: form.addressLocation,
        propertyDetails: form.propertyDetails,
        possessionDatePastAnchor: form.propertyDetails.possessionDate,
        availableFromPastAnchor: form.propertyDetails.availableFrom,
        amenities: form.amenities,
        pricingOthers: form.pricingOthers,
        existingMedia: media,
      };
    }

    case "listingTypeChanged": {
      if (action.listingType === state.listingType) {
        return state;
      }

      return {
        ...state,
        listingType: action.listingType,
        propertyDetails: {
          ...state.propertyDetails,
          propertyTransaction: state.propertyType === "plot" ? "new" : "",
          constructionStatus: "",
          possessionDate: "",
          ageOfConstruction: isRentListing(action.listingType)
            ? DEFAULT_RENT_AGE_OF_CONSTRUCTION
            : "",
        },
        propertyDetailsErrors: {},
        pricingOthersErrors: {},
      };
    }

    case "propertyTypeChanged": {
      if (action.propertyType === state.propertyType) {
        return state;
      }

      const subTypeOptions = SUB_TYPES_BY_PROPERTY_TYPE[action.propertyType];
      const listingType =
        action.propertyType === "pg-co-living" ? "rent-lease" : state.listingType;

      return selectSingleSubType(
        state,
        action.propertyType,
        listingType,
        subTypeOptions ? subTypeOptions[0].id : "",
      );
    }

    case "subTypeChanged": {
      if (action.subType === state.propertySubTypes[0]) {
        return state;
      }

      return selectSingleSubType(
        state,
        state.propertyType,
        state.listingType,
        action.subType,
      );
    }

    case "subTypesChanged": {
      // Unit types of sub types that are no longer selected are cleared
      const { unitTypes } = getUnitTypeConfig(state.propertyType, action.subTypes);
      const keepUnitType = (value: string) =>
        unitTypes.includes(value) ? value : unitTypes.length === 1 ? unitTypes[0] : "";

      return {
        ...state,
        propertySubTypes: action.subTypes,
        builderErrors: {},
        propertyDetailsErrors: {},
        amenitiesErrors: {},
        pricingOthersErrors: {},
        photosError: "",
        projectDetails: {
          ...state.projectDetails,
          configurations: state.projectDetails.configurations.map((row) => ({
            ...row,
            unitType: keepUnitType(row.unitType),
          })),
          availableSizes: state.projectDetails.availableSizes.map((row) => ({
            ...row,
            unitType: keepUnitType(row.unitType),
          })),
        },
      };
    }

    case "addressChanged":
      return {
        ...state,
        addressLocation: setField(state.addressLocation, action.field, action.value),
        addressLocationErrors: clearAddressErrors(
          state.addressLocationErrors,
          action.field,
        ),
      };

    case "detailsChanged":
      return {
        ...state,
        propertyDetails: applyDetailsChange(
          state.propertyDetails,
          action.field,
          action.value,
        ),
        propertyDetailsErrors: clearDetailsErrors(
          state.propertyDetailsErrors,
          action.field,
        ),
      };

    case "amenitiesChanged":
      return {
        ...state,
        amenities: setField(state.amenities, action.field, action.value),
        amenitiesErrors: clearAmenitiesErrors(state.amenitiesErrors, action.field),
      };

    case "pricingChanged":
      return {
        ...state,
        pricingOthers: setField(state.pricingOthers, action.field, action.value),
        pricingOthersErrors: clearPricingErrors(state.pricingOthersErrors, action.field),
        builderErrors:
          action.field === "assuredReturn"
            ? { ...state.builderErrors, assuredReturn: undefined }
            : state.builderErrors,
      };

    case "projectDetailsChanged":
      return {
        ...state,
        projectDetails: changeProjectDetails(
          state.projectDetails,
          action.field,
          action.value,
        ),
        builderErrors:
          action.field === "projectType"
            ? { ...state.builderErrors, projectType: undefined }
            : state.builderErrors,
      };

    case "photosChanged":
      return { ...state, photosVideos: action.photos, photosError: "" };

    case "constructionProgressCleared":
      return { ...state, photosVideos: withoutConstructionProgress(state.photosVideos) };

    case "detailsSet":
      return { ...state, propertyDetails: resolve(action.update, state.propertyDetails) };

    case "amenitiesSet":
      return { ...state, amenities: resolve(action.update, state.amenities) };

    case "pricingSet":
      return { ...state, pricingOthers: resolve(action.update, state.pricingOthers) };

    case "photosSet":
      return { ...state, photosVideos: resolve(action.update, state.photosVideos) };

    case "projectSet":
      return { ...state, projectDetails: resolve(action.update, state.projectDetails) };

    case "existingMediaRemoved":
      return {
        ...state,
        existingMedia: state.existingMedia.filter((media) => media.id !== action.mediaId),
        removedMediaIds: [...state.removedMediaIds, action.mediaId],
        photosError: "",
      };

    case "errorsReplaced":
      return { ...state, ...action.errors };

    case "builderErrorsMerged":
      return { ...state, builderErrors: { ...state.builderErrors, ...action.errors } };

    case "submittingChanged":
      return { ...state, isSubmitting: action.isSubmitting };

    case "draftReset":
      return createInitialDraft();

    default:
      return state;
  }
}
