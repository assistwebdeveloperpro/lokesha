"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useReducer, useState } from "react";
import {
  showsConstructionProgress,
  type ProjectDetailsValues,
} from "@/components/master/post-property/postPropertyProjectDetails";
import { useToast } from "@/components/shared/ui/ToastProvider";
import { useAuth } from "@/hooks/useAuth";
import { getMergedBuilderConfig } from "../builder/builderConfig";
import {
  validateBuilderPricing,
  validateBuilderProjectType,
  type BuilderFieldErrors,
} from "../builder/builderValidation";
import { mapPropertyToFormState } from "../utils/postPropertyEdit";
import {
  arePhotosRequired,
  getStepFromSearchParam,
  getTotalMediaCount,
  hasAddressLocationErrors,
  hasAmenitiesErrors,
  hasPropertyDetailsErrors,
  isRentListing,
  validateAddressLocation,
  validateAmenities,
  validatePricingOthers,
  validatePropertyDetails,
  type AddressLocationValues,
  type AmenitiesValues,
  type ListingTypeId,
  type PhotosVideosValues,
  type PricingOthersValues,
  type PropertyDetailsValues,
  type PropertyTypeId,
} from "../config/postPropertyForm.shared";
import {
  createInitialDraft,
  postPropertyReducer,
  type DraftErrors,
} from "../state/postPropertyFormReducer";
import {
  revokeConstructionProgressPreviews,
  withoutConstructionProgress,
  withoutHiddenDetailsErrors,
  withoutHiddenPricingErrors,
} from "../state/postPropertyFormState";
import {
  INITIAL_AMENITIES,
  INITIAL_PRICING_OTHERS,
  INITIAL_PROPERTY_DETAILS,
} from "../state/postPropertyInitialValues";
import { getSubTypeLayout } from "../utils/postPropertyLayout";
import { getFormConfig } from "../config/postPropertySaleConfig";
import type { PostingAsId } from "../config/postingAs";
import { resolveFirstInvalidStep } from "../validation/postPropertyStepValidation";
import { useEditProperty } from "./useEditProperty";
import { useSubTypeForms } from "./useSubTypeForms";

const BASE_PATH = "/post-property";
const MISSING_PHOTOS_MESSAGE = "Please add at least one photo";

export function usePostPropertyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const { role, isAuthReady } = useAuth();
  const currentStep = getStepFromSearchParam(searchParams.get("step"));
  const editId = searchParams.get("edit");
  const isEditMode = Boolean(editId);
  const {
    property: editProperty,
    isLoading: isLoadingEdit,
    error: editError,
  } = useEditProperty(editId);

  const [draft, dispatch] = useReducer(postPropertyReducer, undefined, createInitialDraft);
  const [postingAs, setPostingAs] = useState<PostingAsId | "">("");
  const {
    listingType,
    propertyType,
    propertySubTypes,
    addressLocation,
    propertyDetails,
    amenities,
    photosVideos,
    pricingOthers,
    projectDetails,
    existingMedia,
  } = draft;

  const propertySubType = propertySubTypes[0] ?? "";
  const isRent = isRentListing(listingType);
  const isStaff = isAuthReady && role === "lokesha_staff";
  const showBuilderFields =
    isAuthReady && (role === "builder" || (isStaff && postingAs === "builder"));
  const builderConfig = getMergedBuilderConfig(propertyType, propertySubTypes);
  const addressValidationOptions = {
    projectNameOptional: showBuilderFields && !builderConfig.projectNameRequired,
  };
  const layout = getSubTypeLayout({
    propertyType,
    listingType,
    propertySubTypes,
    builder: showBuilderFields,
  });

  const subForms = useSubTypeForms({
    commonDetailsFields: layout.commonDetailsFields,
    commonAmenitiesFields: layout.commonAmenitiesFields,
    sharedPhotos: layout.sharedPhotos,
    propertyType,
    listingType,
    isRent,
    subTypes: propertySubTypes,
    builder: showBuilderFields,
    initials: {
      details: INITIAL_PROPERTY_DETAILS,
      amenities: INITIAL_AMENITIES,
      pricing: INITIAL_PRICING_OTHERS,
    },
    single: {
      details: propertyDetails,
      amenities,
      pricing: pricingOthers,
      photos: photosVideos,
    },
    setSingle: {
      details: (update) => dispatch({ type: "detailsSet", update }),
      amenities: (update) => dispatch({ type: "amenitiesSet", update }),
      pricing: (update) => dispatch({ type: "pricingSet", update }),
      photos: (update) => dispatch({ type: "photosSet", update }),
      project: (update) => dispatch({ type: "projectSet", update }),
    },
    project: projectDetails,
    anchors: {
      possession: draft.possessionDatePastAnchor,
      availableFrom: draft.availableFromPastAnchor,
    },
    existingMediaCount: existingMedia.length,
    filterDetailsErrors: (errors) => withoutHiddenDetailsErrors(errors, showBuilderFields),
    filterPricingErrors: (errors) => withoutHiddenPricingErrors(errors, showBuilderFields),
  });
  const isMultiSubType = subForms.isMulti;

  // Price Inclusion is the only per sub type block of the builder pricing step
  const pricingTabs = subForms.tabs.filter(
    (tab) => getFormConfig("sale", propertyType, tab.id, true)?.pricing.priceInclusion ?? true,
  );
  const activePricingTabId = pricingTabs.some((tab) => tab.id === subForms.activeTabId)
    ? subForms.activeTabId
    : (pricingTabs[0]?.id ?? "");

  // Prefill every step once the property being edited has loaded
  useEffect(() => {
    if (!editProperty) {
      return;
    }

    dispatch({
      type: "hydrated",
      form: mapPropertyToFormState(editProperty),
      media: editProperty.media,
    });
  }, [editProperty]);

  const goToStep = (step: number) => {
    const params = new URLSearchParams();
    if (editId) params.set("edit", editId);
    if (step > 1) params.set("step", String(step));

    const query = params.toString();
    router.push(query ? `${BASE_PATH}?${query}` : BASE_PATH, { scroll: false });
  };

  const replaceErrors = (errors: Partial<DraftErrors>) =>
    dispatch({ type: "errorsReplaced", errors });

  const mergeBuilderErrors = (errors: BuilderFieldErrors) =>
    dispatch({ type: "builderErrorsMerged", errors });

  const validateSingleDetails = () =>
    withoutHiddenDetailsErrors(
      validatePropertyDetails(propertyDetails, {
        listingType,
        propertyType,
        subType: propertySubType,
        possessionDatePastAnchor: draft.possessionDatePastAnchor || undefined,
        availableFromPastAnchor: draft.availableFromPastAnchor || undefined,
        builder: showBuilderFields,
      }),
      showBuilderFields,
    );

  const validateSingleAmenities = () =>
    validateAmenities(amenities, propertyType, {
      listingType,
      subType: propertySubType,
      builder: showBuilderFields,
    });

  const getSinglePhotosError = () =>
    arePhotosRequired(propertyType, { listingType, subType: propertySubType }) &&
    getTotalMediaCount(photosVideos) + existingMedia.length === 0
      ? MISSING_PHOTOS_MESSAGE
      : "";

  const clearConstructionProgressPhotos = () => {
    revokeConstructionProgressPreviews(photosVideos);
    dispatch({ type: "constructionProgressCleared" });
    subForms.mapPhotos((photos) => {
      revokeConstructionProgressPreviews(photos);
      return withoutConstructionProgress(photos);
    });
  };

  const handleProjectDetailsChange = <K extends keyof ProjectDetailsValues>(
    field: K,
    value: ProjectDetailsValues[K],
  ) => {
    dispatch({ type: "projectDetailsChanged", field, value });

    // Construction Progress photos only exist for these project types
    if (field === "projectType" && !showsConstructionProgress(String(value))) {
      clearConstructionProgressPhotos();
    }
  };

  // Only the builder form differs, so the other two keep what was already filled
  const handlePostingAsChange = (next: PostingAsId) => {
    if ((next === "builder") !== (postingAs === "builder")) {
      subForms.reset();
      dispatch({ type: "draftReset" });
      goToStep(1);
    }
    setPostingAs(next);
  };

  const handleListingTypeChange = (next: ListingTypeId) =>
    dispatch({ type: "listingTypeChanged", listingType: next });

  const handlePropertyTypeChange = (next: PropertyTypeId) => {
    if (next === propertyType) {
      return;
    }
    subForms.reset();
    dispatch({ type: "propertyTypeChanged", propertyType: next });
  };

  const handleSubTypeChange = (next: string) => {
    if (next === propertySubType) {
      return;
    }
    subForms.reset();
    dispatch({ type: "subTypeChanged", subType: next });
  };

  // Builder selects many sub types; each keeps its own details, amenities, photos and pricing
  const handleSubTypesChange = (next: string[]) => {
    if (propertySubTypes.length === 1 && next.length === 1) {
      handleSubTypeChange(next[0]);
      return;
    }

    subForms.changeSelection(next);
    dispatch({ type: "subTypesChanged", subTypes: next });
  };

  const handleAddressChange = <K extends keyof AddressLocationValues>(
    field: K,
    value: AddressLocationValues[K],
  ) => dispatch({ type: "addressChanged", field, value });

  const handleDetailsChange = <K extends keyof PropertyDetailsValues>(
    field: K,
    value: PropertyDetailsValues[K],
  ) => dispatch({ type: "detailsChanged", field, value });

  const handleAmenitiesChange = <K extends keyof AmenitiesValues>(
    field: K,
    value: AmenitiesValues[K],
  ) => dispatch({ type: "amenitiesChanged", field, value });

  const handlePricingChange = <K extends keyof PricingOthersValues>(
    field: K,
    value: PricingOthersValues[K],
  ) => dispatch({ type: "pricingChanged", field, value });

  // Charges and assured return are project wide, so every tab gets the same value
  const handleAllPricingChange = <K extends keyof PricingOthersValues>(
    field: K,
    value: PricingOthersValues[K],
  ) => {
    if (field === "assuredReturn") {
      mergeBuilderErrors({ assuredReturn: undefined });
    }
    subForms.changePricingAll(field, value);
  };

  const handlePhotosChange = (photos: PhotosVideosValues) =>
    dispatch({ type: "photosChanged", photos });

  const handleRemoveExistingMedia = (mediaId: string) =>
    dispatch({ type: "existingMediaRemoved", mediaId });

  const handleBasicDetailsNext = () => {
    const errors = validateAddressLocation(addressLocation, addressValidationOptions);
    replaceErrors({ addressLocationErrors: errors });

    if (!hasAddressLocationErrors(errors)) {
      goToStep(2);
    }
  };

  const handlePropertyDetailsNext = () => {
    if (isMultiSubType) {
      const hasTabErrors = subForms.validateStep("details");
      const projectErrors = validateBuilderProjectType(projectDetails, builderConfig);

      if (hasTabErrors || projectErrors.projectType) {
        mergeBuilderErrors(projectErrors);
        return;
      }

      goToStep(3);
      return;
    }

    const errors = validateSingleDetails();
    const projectErrors = showBuilderFields
      ? validateBuilderProjectType(projectDetails, builderConfig)
      : {};

    if (hasPropertyDetailsErrors(errors) || projectErrors.projectType) {
      replaceErrors({ propertyDetailsErrors: errors });
      mergeBuilderErrors(projectErrors);
      return;
    }

    replaceErrors({ propertyDetailsErrors: {} });
    goToStep(3);
  };

  const handleAmenitiesNext = () => {
    if (isMultiSubType) {
      if (!subForms.validateStep("amenities")) {
        goToStep(4);
      }
      return;
    }

    const errors = validateSingleAmenities();
    replaceErrors({ amenitiesErrors: errors });

    if (!hasAmenitiesErrors(errors)) {
      goToStep(4);
    }
  };

  const handlePhotosNext = () => {
    if (isMultiSubType) {
      if (!subForms.validateStep("photos")) {
        goToStep(5);
      }
      return;
    }

    const photosError = getSinglePhotosError();
    replaceErrors({ photosError });

    if (!photosError) {
      goToStep(5);
    }
  };

  // Returns the earliest step with an error, or null when the whole form is valid
  const validateWholeForm = (): number | null => {
    const address = validateAddressLocation(addressLocation, addressValidationOptions);
    const details = isMultiSubType ? {} : validateSingleDetails();
    const builder: BuilderFieldErrors = showBuilderFields
      ? {
          ...validateBuilderProjectType(projectDetails, builderConfig),
          ...validateBuilderPricing(
            isMultiSubType ? subForms.getPricing(subForms.firstTabId) : pricingOthers,
            builderConfig,
          ),
        }
      : {};
    const amenitiesErrors = isMultiSubType ? {} : validateSingleAmenities();
    const pricing = isMultiSubType
      ? {}
      : withoutHiddenPricingErrors(
          validatePricingOthers(pricingOthers, listingType, propertyType, propertySubType),
          showBuilderFields,
        );
    const photos = isMultiSubType ? "" : getSinglePhotosError();

    // Later steps run first so the tab of the earliest failing step stays open
    const tabs = isMultiSubType
      ? {
          pricing: subForms.validateStep("pricing"),
          photos: subForms.validateStep("photos"),
          amenities: subForms.validateStep("amenities"),
          details: subForms.validateStep("details"),
        }
      : null;

    replaceErrors({
      addressLocationErrors: address,
      propertyDetailsErrors: details,
      amenitiesErrors,
      pricingOthersErrors: pricing,
      photosError: photos,
      builderErrors: builder,
    });

    return resolveFirstInvalidStep({
      address,
      details,
      amenities: amenitiesErrors,
      pricing,
      photos,
      builder,
      tabs,
    });
  };

  const handleSubmit = async () => {
    if (draft.isSubmitting) {
      return;
    }

    const firstInvalidStep = validateWholeForm();
    if (firstInvalidStep !== null) {
      if (firstInvalidStep !== currentStep) {
        goToStep(firstInvalidStep);
      }
      showToast(
        "Some required fields are still empty. Please check the highlighted fields.",
        "error",
      );
      return;
    }

    showToast("Posting properties is currently unavailable.", "error");
  };

  return {
    currentStep,
    isEditMode,
    editStatus: {
      isBlocking: isEditMode && (isLoadingEdit || Boolean(editError) || !editProperty),
      error: editError,
    },
    draft,
    staff: {
      isStaff,
      postingAs,
      changePostingAs: handlePostingAsChange,
    },
    derived: {
      propertySubType,
      isRent,
      showBuilderFields,
      builderConfig,
      addressValidationOptions,
      isMultiSubType,
      activeTabId: subForms.activeTabId,
      pricingTabs,
      activePricingTabId,
      existingBrochureName: editProperty?.brochurePath?.split("/").pop() ?? null,
    },
    layout,
    subForms,
    handlers: {
      goBack: () => goToStep(currentStep - 1),
      changeListingType: handleListingTypeChange,
      changePropertyType: handlePropertyTypeChange,
      changeSubType: handleSubTypeChange,
      changeSubTypes: handleSubTypesChange,
      changeAddress: handleAddressChange,
      changeDetails: handleDetailsChange,
      changeAmenities: handleAmenitiesChange,
      changePricing: handlePricingChange,
      changeAllPricing: handleAllPricingChange,
      changeProjectDetails: handleProjectDetailsChange,
      changePhotos: handlePhotosChange,
      removeExistingMedia: handleRemoveExistingMedia,
      submitBasicDetails: handleBasicDetailsNext,
      submitPropertyDetails: handlePropertyDetailsNext,
      submitAmenities: handleAmenitiesNext,
      submitPhotos: handlePhotosNext,
      submit: handleSubmit,
    },
  };
}

export type PostPropertyForm = ReturnType<typeof usePostPropertyForm>;
