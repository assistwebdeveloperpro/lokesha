"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { setPendingToast } from "@/components/shared/ui/pendingToast";
import { useToast } from "@/components/shared/ui/ToastProvider";
import { DEFAULT_STATE } from "@/data/indianStatesCities";
import { ApiError } from "@/services/apiClient";
import { createProperty, type PropertyMedia } from "@/services/property.service";
import { getToken } from "@/services/session";
import { useAuth } from "@/hooks/useAuth";
import {
  PrimeLocationHighlightsField,
  ProjectHighlightsField,
  ProjectOverviewField,
} from "@/components/master/post-property/step-1-basic-information/ProjectDetailsField";
import BuilderPropertyDetailsField from "@/components/master/post-property/step-2-property-details/PropertyDetailsField";
import FloorPlansField from "@/components/master/post-property/step-4-media-upload/FloorPlansField";
import {
  ProjectFaqField,
  ProjectPricingField,
  VideoWalkthroughField,
  VirtualTourField,
} from "@/components/master/post-property/step-5-pricing-and-additional-details/ProjectPricingFaqField";
import {
  createInitialProjectDetails,
  getAvailableSizesPriceRange,
  getFloorPlanTitles,
  getUnitTypeConfig,
  showsConstructionProgress,
  type ProjectDetailsValues,
} from "@/components/master/post-property/postPropertyProjectDetails";
import AvailableSizesField from "@/components/master/post-property/step-2-property-details/AvailableSizesField";
import BhkCarParkingField from "./builder/BhkCarParkingField";
import BhkChargesField from "./builder/BhkChargesField";
import BrochureImagesField from "./builder/BrochureImagesField";
import BuilderExtraDetailsField from "./builder/BuilderExtraDetailsField";
import { getBuilderConfig, getMergedBuilderConfig } from "./builder/builderConfig";
import {
  validateBuilderPricing,
  validateBuilderProjectType,
  type BuilderFieldErrors,
} from "./builder/builderValidation";
import PostPropertyInput from "./PostPropertyInput";
import {
  ProjectExtraDetailsField,
  ProjectSpecificationsField,
} from "./builder/BuilderProjectFields";
import AddressLocationField from "./step-1-basic-information/AddressLocationField";
import ListingTypeField from "./step-1-basic-information/ListingTypeField";
import PropertyTypeField from "./step-1-basic-information/PropertyTypeField";
import PropertyDetailsField from "./step-2-property-details/PropertyDetailsField";
import SubTypeDetailsTabs from "./step-2-property-details/SubTypeDetailsTabs";
import AmenitiesField from "./step-3-amenities/AmenitiesField";
import PhotosVideosField from "./step-4-media-upload/PhotosVideosField";
import PricingOthersField from "./step-5-pricing-and-additional-details/PricingOthersField";
import EditPropertyStatus from "./EditPropertyStatus";
import FormStepper from "./FormStepper";
import ProgressBar from "./ProgressBar";
import {
  EMPTY_AMENITIES_EXTRA,
  EMPTY_PROPERTY_DETAILS_EXTRA,
  arePhotosRequired,
  DEFAULT_RENT_AGE_OF_CONSTRUCTION,
  RESIDENTIAL_SUB_TYPES,
  SUB_TYPES_BY_PROPERTY_TYPE,
  isRentListing,
  createEmptyPhotosVideosValues,
  getPhotoCategories,
  getProgressForStep,
  getStepFromSearchParam,
  getTotalMediaCount,
  type AddressLocationFieldErrors,
  type AddressLocationValues,
  type AmenitiesFieldErrors,
  hasAmenitiesErrors,
  validateAmenities,
  type PricingOthersFieldErrors,
  hasPricingOthersErrors,
  validatePricingOthers,
  type AmenitiesValues,
  hasAddressLocationErrors,
  validateAddressLocation,
  hasPropertyDetailsErrors,
  validatePropertyDetails,
  type ListingTypeId,
  type PhotosVideosValues,
  type PricingOthersValues,
  type PropertyDetailsFieldErrors,
  type PropertyDetailsValues,
  type PropertyTypeId,
} from "./postPropertyForm.shared";
import { mapPropertyToFormState } from "./postPropertyEdit";
import {
  AMENITY_SECTION_FIELDS,
  COMMON_SECTION_FIELDS,
  getBuilderAmenitiesConfig,
  getBuilderDetailsConfig,
  getCommonAmenitySections,
  getCommonDetailSections,
  getFormConfig,
  type CommonDetailSections,
} from "./postPropertySaleConfig";
import { SaleCommonSections } from "./step-2-property-details/PropertyDetailsVariants";
import { buildPropertyFormData } from "./postPropertyPayload";
import { saveEditedProperty } from "./saveEditedProperty";
import { useEditProperty } from "./useEditProperty";
import { useSubTypeForms } from "./useSubTypeForms";
import {
  POST_PROPERTY_BACK_BTN,
  POST_PROPERTY_PRIMARY_BTN,
  POST_PROPERTY_STEP_ACCENT,
  POST_PROPERTY_STEP_DESC,
  POST_PROPERTY_STEP_HEADER,
  POST_PROPERTY_STEP_TITLE,
} from "./postPropertyForm.styles";
import { ArrowLeft } from "lucide-react";

const initialPropertyDetails: PropertyDetailsValues = {
  carpetAreaNumber: "",
  carpetAreaType: "",
  superBuildUpNumber: "",
  superBuildUpType: "",
  propertyTransaction: "",
  constructionStatus: "",
  possessionDate: "",
  ageOfConstruction: "",
  bedrooms: "",
  balcony: "",
  totalFloors: "",
  floorNumber: "",
  bathrooms: "",
  lift: "",
  fullHouse: false,
  sharingBasis: false,
  availableFrom: "",
  interiorModificationAllowed: false,
  tenantPreferences: [],
  ...EMPTY_PROPERTY_DETAILS_EXTRA,
};

const initialPricingOthers: PricingOthersValues = {
  monthlyRent: "",
  noticePeriod: "",
  depositAmount: "",
  expectedPrice: "",
  priceInclusion: [],
  priceNegotiable: false,
  transferFee: "",
  bookingAmount: "",
  maintenanceCharges: "",
  benefitsRemarks: "",
  assuredReturn: "",
  yearlyIncrement: "",
  leaseAmount: "",
};

const initialAmenities: AmenitiesValues = {
  status: "",
  furnishing: [],
  amenities: [],
  facing: "",
  carParkingAvailable: false,
  carParking: "",
  clubMembership: false,
  reraNumber: "",
  openSides: "",
  ...EMPTY_AMENITIES_EXTRA,
};

export default function PostPropertyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const currentStep = getStepFromSearchParam(searchParams.get("step"));
  const editId = searchParams.get("edit");
  const basePath = "/post-property";
  const loginPath = "/login";
  const afterSubmitPath = "/user/properties/manage-properties";
  const isEditMode = Boolean(editId);
  const {
    property: editProperty,
    isLoading: isLoadingEdit,
    error: editError,
  } = useEditProperty(editId);

  const [listingType, setListingType] = useState<ListingTypeId>("sale");
  const [propertyType, setPropertyType] =
    useState<PropertyTypeId>("residential");
  // Only a builder can select several; propertySubType is the first one
  const [propertySubTypes, setPropertySubTypes] = useState([
    RESIDENTIAL_SUB_TYPES[0].id,
  ]);
  const propertySubType = propertySubTypes[0] ?? "";
  const [addressLocationErrors, setAddressLocationErrors] =
    useState<AddressLocationFieldErrors>({});
  const [addressLocation, setAddressLocation] = useState<AddressLocationValues>({
    blockNo: "",
    flatNumber: "",
    projectName: "",
    locality: "",
    addressLine2: "",
    landmark: "",
    pinCode: "",
    city: "",
    state: DEFAULT_STATE,
    propertyDescription: "",
  });
  const [propertyDetails, setPropertyDetails] =
    useState<PropertyDetailsValues>(initialPropertyDetails);
  const [propertyDetailsErrors, setPropertyDetailsErrors] =
    useState<PropertyDetailsFieldErrors>({});
  const [amenities, setAmenities] = useState<AmenitiesValues>(initialAmenities);
  const [photosVideos, setPhotosVideos] = useState<PhotosVideosValues>(
    createEmptyPhotosVideosValues(),
  );
  const [pricingOthers, setPricingOthers] =
    useState<PricingOthersValues>(initialPricingOthers);
  const [amenitiesErrors, setAmenitiesErrors] =
    useState<AmenitiesFieldErrors>({});
  const [pricingOthersErrors, setPricingOthersErrors] =
    useState<PricingOthersFieldErrors>({});
  const [photosError, setPhotosError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingMedia, setExistingMedia] = useState<PropertyMedia[]>([]);
  const [removedMediaIds, setRemovedMediaIds] = useState<string[]>([]);
  const [possessionDatePastAnchor, setPossessionDatePastAnchor] =
    useState("");
  const [availableFromPastAnchor, setAvailableFromPastAnchor] = useState("");
  const isRent = isRentListing(listingType);
  const { role, isAuthReady } = useAuth();
  const [projectDetails, setProjectDetails] = useState<ProjectDetailsValues>(
    createInitialProjectDetails,
  );
  const showBuilderFields = isAuthReady && role === "builder";
  const builderConfig = getMergedBuilderConfig(propertyType, propertySubTypes);
  const [builderErrors, setBuilderErrors] = useState<BuilderFieldErrors>({});
  const addressValidationOptions = {
    projectNameOptional: showBuilderFields && !builderConfig.projectNameRequired,
  };

  // Builder form hides these fields, so their errors must not block the steps
  const withoutHiddenDetailsErrors = (errors: PropertyDetailsFieldErrors) => {
    if (!showBuilderFields) {
      return errors;
    }
    const {
      bedrooms: _bedrooms,
      balcony: _balcony,
      floorNumber: _floorNumber,
      bathrooms: _bathrooms,
      ...rest
    } = errors;
    return rest;
  };

  const withoutHiddenPricingErrors = (errors: PricingOthersFieldErrors) => {
    if (!showBuilderFields) {
      return errors;
    }
    const { expectedPrice: _expectedPrice, bookingAmount: _bookingAmount, ...rest } =
      errors;
    return rest;
  };

  // Sections every selected sub type shows the same way are asked once above the tabs
  const detailConfigs = propertySubTypes.map((id) =>
    getBuilderDetailsConfig(propertyType, id),
  );
  const commonSections: CommonDetailSections =
    showBuilderFields && propertySubTypes.length > 1
      ? getCommonDetailSections(detailConfigs)
      : { transaction: false, floors: false };
  const commonDetailsCfg = detailConfigs[0];
  const commonDetailsFields = [
    ...(commonSections.transaction ? COMMON_SECTION_FIELDS.transaction : []),
    ...(commonSections.floors ? COMMON_SECTION_FIELDS.floors : []),
  ];

  const isBuilderMulti = showBuilderFields && propertySubTypes.length > 1;
  const amenitySections = isBuilderMulti
    ? getCommonAmenitySections(
        propertySubTypes.map((id) => getBuilderAmenitiesConfig(propertyType, id)),
      )
    : { common: [], perSubType: [] };
  const commonAmenitiesFields = amenitySections.common.flatMap(
    (section) => AMENITY_SECTION_FIELDS[section],
  ) as Array<keyof AmenitiesValues>;
  // Same photo categories for every sub type means one shared photo set
  const sharedPhotos =
    isBuilderMulti &&
    new Set(
      propertySubTypes.map((id) =>
        getPhotoCategories(propertyType, { listingType, subType: id })
          .map((category) => category.id)
          .join(","),
      ),
    ).size === 1;
  const priceInclusionFlags = propertySubTypes.map(
    (id) => getFormConfig("sale", propertyType, id, true)?.pricing.priceInclusion ?? true,
  );
  const sharedPricing = priceInclusionFlags.every((flag) => flag === priceInclusionFlags[0]);

  const subForms = useSubTypeForms({
    commonDetailsFields,
    commonAmenitiesFields,
    sharedPhotos,
    propertyType,
    listingType,
    isRent,
    subTypes: propertySubTypes,
    builder: showBuilderFields,
    initials: {
      details: initialPropertyDetails,
      amenities: initialAmenities,
      pricing: initialPricingOthers,
    },
    single: {
      details: propertyDetails,
      amenities,
      pricing: pricingOthers,
      photos: photosVideos,
    },
    setSingle: {
      details: setPropertyDetails,
      amenities: setAmenities,
      pricing: setPricingOthers,
      photos: setPhotosVideos,
      project: setProjectDetails,
    },
    project: projectDetails,
    anchors: {
      possession: possessionDatePastAnchor,
      availableFrom: availableFromPastAnchor,
    },
    existingMediaCount: existingMedia.length,
    filterDetailsErrors: withoutHiddenDetailsErrors,
    filterPricingErrors: withoutHiddenPricingErrors,
  });
  const isMultiSubType = subForms.isMulti;
  const activeTabId = subForms.activeTabId;

  const handleProjectDetailsChange = <K extends keyof ProjectDetailsValues>(
    field: K,
    value: ProjectDetailsValues[K],
  ) => {
    setProjectDetails((current) => {
      const next = { ...current, [field]: value };

      if (field === "availableSizes") {
        const range = getAvailableSizesPriceRange(next);
        next.priceMin = range.min;
        next.priceMax = range.max;
      }

      return next;
    });

    if (field === "projectType") {
      setBuilderErrors((current) => ({ ...current, projectType: undefined }));

      // Construction Progress photos only exist for these project types
      if (!showsConstructionProgress(String(value))) {
        const clearConstructionProgress = (current: PhotosVideosValues) => {
          const media = current.mediaByCategory["construction-progress"];
          if (media.length === 0) {
            return current;
          }
          media.forEach((item) => URL.revokeObjectURL(item.previewUrl));
          return {
            ...current,
            mediaByCategory: {
              ...current.mediaByCategory,
              "construction-progress": [],
            },
          };
        };
        setPhotosVideos(clearConstructionProgress);
        subForms.mapPhotos(clearConstructionProgress);
      }
    }
  };

  const resetProjectDetails = (nextPropertyType: PropertyTypeId, nextSubType: string) => {
    setProjectDetails(
      createInitialProjectDetails(
        getBuilderConfig(nextPropertyType, nextSubType).defaultUnitType,
      ),
    );
    setBuilderErrors({});
  };

  // Prefill every step once the property being edited has loaded
  useEffect(() => {
    if (!editProperty) {
      return;
    }

    const state = mapPropertyToFormState(editProperty);
    /* eslint-disable react-hooks/set-state-in-effect */
    setListingType(state.listingType);
    setPropertyType(state.propertyType);
    setPropertySubTypes([state.propertySubType]);
    setAddressLocation(state.addressLocation);
    setPropertyDetails(state.propertyDetails);
    setPossessionDatePastAnchor(state.propertyDetails.possessionDate);
    setAvailableFromPastAnchor(state.propertyDetails.availableFrom);
    setAmenities(state.amenities);
    setPricingOthers(state.pricingOthers);
    setExistingMedia(editProperty.media);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [editProperty]);

  const handleListingTypeChange = (nextListingType: ListingTypeId) => {
    if (nextListingType === listingType) {
      return;
    }

    setListingType(nextListingType);
    setPropertyDetails((current) => ({
      ...current,
      propertyTransaction: propertyType === "plot" ? "new" : "",
      constructionStatus: "",
      possessionDate: "",
      ageOfConstruction: isRentListing(nextListingType)
        ? DEFAULT_RENT_AGE_OF_CONSTRUCTION
        : "",
    }));
    setPropertyDetailsErrors({});
    setPricingOthersErrors({});
  };

  const handleRemoveExistingMedia =(mediaId: string) => {
    setExistingMedia((current) => current.filter((media) => media.id !== mediaId));
    setRemovedMediaIds((current) => [...current, mediaId]);
    setPhotosError("");
  };

  const handleAddressLocationChange = <
    K extends keyof AddressLocationValues,
  >(
    field: K,
    value: AddressLocationValues[K],
  ) => {
    setAddressLocation((current) => ({ ...current, [field]: value }));

    if (
      field === "projectName" ||
      field === "locality" ||
      field === "pinCode" ||
      field === "propertyDescription"
    ) {
      setAddressLocationErrors((current) => {
        if (!(field in current)) {
          return current;
        }

        const next = { ...current };
        delete next[field as keyof AddressLocationFieldErrors];
        return next;
      });
    }
  };

  const handleBasicDetailsNext = () => {
    const errors = validateAddressLocation(addressLocation, addressValidationOptions);

    if (hasAddressLocationErrors(errors)) {
      setAddressLocationErrors(errors);
      return;
    }

    setAddressLocationErrors({});
    goToStep(2);
  };

  const handlePropertyDetailsChange = <
    K extends keyof PropertyDetailsValues,
  >(
    field: K,
    value: PropertyDetailsValues[K],
  ) => {
    setPropertyDetails((current) => {
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
    });

    setPropertyDetailsErrors((current) => {
      const fieldsToClear = new Set<keyof PropertyDetailsFieldErrors>();

      if (
        field === "carpetAreaNumber" ||
        field === "carpetAreaType" ||
        field === "superBuildUpNumber" ||
        field === "superBuildUpType" ||
        field === "availableFrom" ||
        field === "leaseContractTill" ||
        field === "tenantPreferences" ||
        field === "pgName" ||
        field === "occupancies" ||
        field === "pgGender" ||
        field === "propertyTransaction" ||
        field === "constructionStatus" ||
        field === "ageOfConstruction" ||
        field === "possessionDate" ||
        field === "bedrooms" ||
        field === "balcony" ||
        field === "totalFloors" ||
        field === "floorNumber" ||
        field === "bathrooms" ||
        field === "plotAreaNumber" ||
        field === "plotAreaType" ||
        field === "terraceAreaNumber" ||
        field === "terraceAreaType" ||
        field === "penthouseType" ||
        field === "floorsAllowed" ||
        field === "currentlyLeasedOut"
      ) {
        fieldsToClear.add(field);
      }

      if (field === "propertyTransaction") {
        fieldsToClear.add("constructionStatus");
        fieldsToClear.add("possessionDate");
        fieldsToClear.add("ageOfConstruction");
      }

      if (field === "totalFloors") {
        fieldsToClear.add("floorNumber");
      }

      const hasFieldsToClear = [...fieldsToClear].some((key) => key in current);
      if (!hasFieldsToClear) {
        return current;
      }

      const next = { ...current };
      for (const key of fieldsToClear) {
        delete next[key];
      }
      return next;
    });
  };

  const handlePropertyDetailsNext = () => {
    if (isMultiSubType) {
      const hasTabErrors = subForms.validateStep("details");
      const tabProjectErrors = validateBuilderProjectType(projectDetails, builderConfig);

      if (hasTabErrors || tabProjectErrors.projectType) {
        setBuilderErrors((current) => ({ ...current, ...tabProjectErrors }));
        return;
      }

      goToStep(3);
      return;
    }

    const errors = withoutHiddenDetailsErrors(
      validatePropertyDetails(propertyDetails, {
        listingType,
        propertyType,
        subType: propertySubType,
        possessionDatePastAnchor: possessionDatePastAnchor || undefined,
        availableFromPastAnchor: availableFromPastAnchor || undefined,
        builder: showBuilderFields,
      }),
    );
    const projectErrors = showBuilderFields
      ? validateBuilderProjectType(projectDetails, builderConfig)
      : {};

    if (hasPropertyDetailsErrors(errors) || projectErrors.projectType) {
      setPropertyDetailsErrors(errors);
      setBuilderErrors((current) => ({ ...current, ...projectErrors }));
      return;
    }

    setPropertyDetailsErrors({});
    goToStep(3);
  };

  const handleAmenitiesChange = <K extends keyof AmenitiesValues>(
    field: K,
    value: AmenitiesValues[K],
  ) => {
    setAmenities((current) => ({ ...current, [field]: value }));

    setAmenitiesErrors((current) => {
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
    });
  };

  const handleAmenitiesNext = () => {
    if (isMultiSubType) {
      if (subForms.validateStep("amenities")) {
        return;
      }

      goToStep(4);
      return;
    }

    const errors = validateAmenities(amenities, propertyType, {
      listingType,
      subType: propertySubType,
      builder: showBuilderFields,
    });

    if (hasAmenitiesErrors(errors)) {
      setAmenitiesErrors(errors);
      return;
    }

    setAmenitiesErrors({});
    goToStep(4);
  };

  const handlePricingOthersChange = <K extends keyof PricingOthersValues>(
    field: K,
    value: PricingOthersValues[K],
  ) => {
    setPricingOthers((current) => ({ ...current, [field]: value }));

    if (field === "assuredReturn") {
      setBuilderErrors((current) => ({ ...current, assuredReturn: undefined }));
    }

    setPricingOthersErrors((current) => {
      if (!(field in current)) {
        return current;
      }

      const next = { ...current };
      delete next[field as keyof PricingOthersFieldErrors];
      return next;
    });
  };

  const handlePhotosNext = () => {
    if (isMultiSubType) {
      if (subForms.validateStep("photos")) {
        return;
      }

      goToStep(5);
      return;
    }

    if (
      arePhotosRequired(propertyType, { listingType, subType: propertySubType }) &&
      getTotalMediaCount(photosVideos) + existingMedia.length === 0
    ) {
      setPhotosError("Please add at least one photo");
      return;
    }

    setPhotosError("");
    goToStep(5);
  };

  const applyFullFormValidation = (): number | null => {
    const nextAddressErrors = validateAddressLocation(
      addressLocation,
      addressValidationOptions,
    );
    const nextPropertyDetailsErrors = isMultiSubType
      ? {}
      : withoutHiddenDetailsErrors(
          validatePropertyDetails(propertyDetails, {
            listingType,
            propertyType,
            subType: propertySubType,
            possessionDatePastAnchor: possessionDatePastAnchor || undefined,
            availableFromPastAnchor: availableFromPastAnchor || undefined,
            builder: showBuilderFields,
          }),
        );
    const nextBuilderErrors: BuilderFieldErrors = showBuilderFields
      ? {
          ...validateBuilderProjectType(projectDetails, builderConfig),
          ...validateBuilderPricing(
            isMultiSubType ? subForms.getPricing(subForms.firstTabId) : pricingOthers,
            builderConfig,
          ),
        }
      : {};
    const nextAmenitiesErrors = isMultiSubType
      ? {}
      : validateAmenities(amenities, propertyType, {
          listingType,
          subType: propertySubType,
          builder: showBuilderFields,
        });
    const nextPricingErrors = isMultiSubType
      ? {}
      : withoutHiddenPricingErrors(
          validatePricingOthers(
            pricingOthers,
            listingType,
            propertyType,
            propertySubType,
          ),
        );
    const nextPhotosError =
      !isMultiSubType &&
      arePhotosRequired(propertyType, { listingType, subType: propertySubType }) &&
      getTotalMediaCount(photosVideos) + existingMedia.length === 0
        ? "Please add at least one photo"
        : "";

    // Later steps run first so the tab of the earliest failing step stays open
    const tabStepErrors = isMultiSubType
      ? {
          pricing: subForms.validateStep("pricing"),
          photos: subForms.validateStep("photos"),
          amenities: subForms.validateStep("amenities"),
          details: subForms.validateStep("details"),
        }
      : null;

    setAddressLocationErrors(nextAddressErrors);
    setPropertyDetailsErrors(nextPropertyDetailsErrors);
    setAmenitiesErrors(nextAmenitiesErrors);
    setPricingOthersErrors(nextPricingErrors);
    setPhotosError(nextPhotosError);
    setBuilderErrors(nextBuilderErrors);

    if (hasAddressLocationErrors(nextAddressErrors)) {
      return 1;
    }
    if (
      hasPropertyDetailsErrors(nextPropertyDetailsErrors) ||
      tabStepErrors?.details ||
      nextBuilderErrors.projectType
    ) {
      return 2;
    }
    if (hasAmenitiesErrors(nextAmenitiesErrors) || tabStepErrors?.amenities) {
      return 3;
    }
    if (nextPhotosError || tabStepErrors?.photos) {
      return 4;
    }
    if (
      hasPricingOthersErrors(nextPricingErrors) ||
      tabStepErrors?.pricing ||
      nextBuilderErrors.assuredReturn
    ) {
      return 5;
    }

    return null;
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    const firstInvalidStep = applyFullFormValidation();
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

    const token = getToken();
    if (!token) {
      router.push(loginPath);
      return;
    }

    setIsSubmitting(true);

    // Several sub types still send one set of values until the backend takes a list
    const tabValues = isMultiSubType ? subForms.getSubmitValues() : null;
    const formState = {
      listingType,
      propertyType,
      propertySubType,
      addressLocation,
      propertyDetails: tabValues?.details ?? propertyDetails,
      amenities: tabValues?.amenities ?? amenities,
      photosVideos: tabValues?.photos ?? photosVideos,
      pricingOthers: tabValues?.pricing ?? pricingOthers,
    };

    try {
      if (editId) {
        await saveEditedProperty({
          propertyId: editId,
          token,
          state: formState,
          removedMediaIds,
        });
        setPendingToast("Property updated successfully");
      } else {
        await createProperty(buildPropertyFormData(formState), token);
        setPendingToast("Property listed successfully");
      }
      router.push(afterSubmitPath);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        router.push(loginPath);
        return;
      }

      if (error instanceof ApiError) {
        const message =
          error.errors && error.errors.length > 0
            ? error.errors[0]
            : error.message;
        showToast(message, "error");
      } else {
        showToast("Something went wrong. Please try again.", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePropertyTypeChange = (nextPropertyType: PropertyTypeId) => {
    if (nextPropertyType === propertyType) {
      return;
    }

    setPropertyType(nextPropertyType);

    const subTypeOptions = SUB_TYPES_BY_PROPERTY_TYPE[nextPropertyType];
    const nextSubType = subTypeOptions ? subTypeOptions[0].id : "";
    setPropertySubTypes([nextSubType]);
    resetProjectDetails(nextPropertyType, nextSubType);
    subForms.reset();

    const nextListingType =
      nextPropertyType === "pg-co-living" ? "rent-lease" : listingType;
    setListingType(nextListingType);

    // Plot defaults: new transaction, landlord managed
    const isPlot = nextPropertyType === "plot";
    setPropertyDetails({
      ...initialPropertyDetails,
      propertyTransaction: isPlot ? "new" : "",
      managedBy: isPlot ? "Landlord" : "",
      ageOfConstruction: isRentListing(nextListingType)
        ? DEFAULT_RENT_AGE_OF_CONSTRUCTION
        : "",
    });
    setAmenities(initialAmenities);
    setPricingOthers(initialPricingOthers);
    setPhotosVideos(createEmptyPhotosVideosValues());
    setPropertyDetailsErrors({});
    setAmenitiesErrors({});
    setPricingOthersErrors({});
    setPhotosError("");
  };

  const handleSubTypeChange = (nextSubType: string) => {
    if (nextSubType === propertySubType) {
      return;
    }

    setPropertySubTypes([nextSubType]);
    resetProjectDetails(propertyType, nextSubType);
    subForms.reset();

    // Each sub type has its own fields, so start the later steps afresh
    const isPlot = propertyType === "plot";
    setPropertyDetails({
      ...initialPropertyDetails,
      propertyTransaction: isPlot ? "new" : "",
      managedBy: isPlot ? "Landlord" : "",
      ageOfConstruction: isRent ? DEFAULT_RENT_AGE_OF_CONSTRUCTION : "",
    });
    setAmenities(initialAmenities);
    setPricingOthers(initialPricingOthers);
    setPhotosVideos(createEmptyPhotosVideosValues());
    setPropertyDetailsErrors({});
    setAmenitiesErrors({});
    setPricingOthersErrors({});
    setPhotosError("");
  };

  // Builder selects many sub types; each keeps its own details, amenities, photos and pricing
  const handleSubTypesChange = (nextSubTypes: string[]) => {
    const keepsSingle = propertySubTypes.length === 1 && nextSubTypes.length === 1;

    if (keepsSingle) {
      handleSubTypeChange(nextSubTypes[0]);
      return;
    }

    subForms.changeSelection(nextSubTypes);
    setPropertySubTypes(nextSubTypes);
    setBuilderErrors({});
    setPropertyDetailsErrors({});
    setAmenitiesErrors({});
    setPricingOthersErrors({});
    setPhotosError("");

    // Unit types of sub types that are no longer selected are cleared
    const { unitTypes } = getUnitTypeConfig(propertyType, nextSubTypes);
    const keepUnitType = (value: string) => (unitTypes.includes(value) ? value : "");
    setProjectDetails((current) => ({
      ...current,
      configurations: current.configurations.map((row) => ({
        ...row,
        unitType: keepUnitType(row.unitType),
      })),
      availableSizes: current.availableSizes.map((row) => ({
        ...row,
        unitType: keepUnitType(row.unitType),
      })),
    }));
  };

  const goToStep = (step: number) => {
    const params = new URLSearchParams();
    if (editId) params.set("edit", editId);
    if (step > 1) params.set("step", String(step));

    const query = params.toString();
    router.push(query ? `${basePath}?${query}` : basePath, {
      scroll: false,
    });
  };

  const handleGoBack = () => goToStep(currentStep - 1);

  const isBasicDetailsStep = currentStep === 1;
  const isPropertyDetailsStep = currentStep === 2;
  const isAmenitiesStep = currentStep === 3;
  const isPhotosVideosStep = currentStep === 4;
  const isPricingOthersStep = currentStep === 5;

  // Price Inclusion is the only per sub type block of the builder pricing step
  const pricingTabs = subForms.tabs.filter(
    (tab) => getFormConfig("sale", propertyType, tab.id, true)?.pricing.priceInclusion ?? true,
  );
  const activePricingTabId = pricingTabs.some((tab) => tab.id === activeTabId)
    ? activeTabId
    : (pricingTabs[0]?.id ?? "");

  // Charges and assured return are project wide, so every tab gets the same value
  const handleAllPricingChange = <K extends keyof PricingOthersValues>(
    field: K,
    value: PricingOthersValues[K],
  ) => {
    if (field === "assuredReturn") {
      setBuilderErrors((current) => ({ ...current, assuredReturn: undefined }));
    }
    subForms.changePricingAll(field, value);
  };

  // Brochure images, floor plans and walkthroughs are project wide, so they never sit in a tab
  const builderMediaBlocks = showBuilderFields ? (
    <>
      <BrochureImagesField values={projectDetails} onChange={handleProjectDetailsChange} />
      {builderConfig.showFloorPlans ? (
        <FloorPlansField
          projectName={addressLocation.projectName}
          propertyType={propertyType}
          subType={propertySubTypes}
          values={projectDetails}
          onChange={handleProjectDetailsChange}
          autoTitles={
            getFloorPlanTitles(projectDetails).length > 0
              ? getFloorPlanTitles(projectDetails)
              : undefined
          }
        />
      ) : null}
      <VideoWalkthroughField values={projectDetails} onChange={handleProjectDetailsChange} />
      <VirtualTourField values={projectDetails} onChange={handleProjectDetailsChange} />
    </>
  ) : null;

  const builderProjectBlocks = showBuilderFields ? (
    <>
      <ProjectOverviewField
        values={projectDetails}
        onChange={handleProjectDetailsChange}
        propertyType={propertyType}
        subType={propertySubTypes}
        hideConfiguration
        showProjectType={builderConfig.showProjectType}
        projectTypeError={builderErrors.projectType}
        totalUnitsLabel={builderConfig.totalUnitsLabel}
        hideTotalBlocks={builderConfig.hideTotalBlocks}
      />
      <BuilderExtraDetailsField
        extras={builderConfig.extras}
        values={projectDetails}
        onChange={handleProjectDetailsChange}
      />
      <ProjectExtraDetailsField
        values={projectDetails}
        onChange={handleProjectDetailsChange}
      />
      {builderConfig.showSpecifications ? (
        <ProjectSpecificationsField
          values={projectDetails}
          onChange={handleProjectDetailsChange}
        />
      ) : null}
    </>
  ) : null;

  const builderAmenityExtras = showBuilderFields ? (
    <>
      <PostPropertyInput
        id="approvedBy"
        label="Approved By"
        placeholder="e.g. DTCP, development authority"
        variant="underline"
        staticLabel
        value={projectDetails.approvedBy}
        onChange={(value) => handleProjectDetailsChange("approvedBy", value)}
      />
      <PostPropertyInput
        id="reraLink"
        label="RERA Website / Link"
        placeholder="https://"
        type="url"
        variant="underline"
        staticLabel
        value={projectDetails.reraLink}
        onChange={(value) => handleProjectDetailsChange("reraLink", value)}
      />
    </>
  ) : undefined;

  if (isEditMode && (isLoadingEdit || editError || !editProperty)) {
    return <EditPropertyStatus error={editError} />;
  }

  return (
    <div className="mx-auto w-full max-w-360 px-3 py-8 sm:px-4 sm:py-10 lg:px-4">
      <header>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-30">
          <div className="shrink-0">
            <h1 className="font-display text-2xl font-bold text-navy-blue sm:text-2xl">
              {isEditMode ? "Edit Property Details" : "Add Property Details"}
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-600">
              {isEditMode ? "Update your listing" : "Sell or rent your property"}
            </p>
          </div>
          <ProgressBar percent={getProgressForStep(currentStep)} />
        </div>
      </header>

      <section className="mt-8 sm:mt-10">
        <FormStepper currentStep={currentStep} />
      </section>

      {isBasicDetailsStep ? (
        <section className="post-property-form-card mt-8 py-5 px-2 md:p-5 sm:mt-10 sm:p-8">
          <div className={POST_PROPERTY_STEP_HEADER}>
            <span className={POST_PROPERTY_STEP_ACCENT} aria-hidden />
            <div>
              <h2 className={POST_PROPERTY_STEP_TITLE}>Add Basic Details</h2>
              <p className={POST_PROPERTY_STEP_DESC}>
                Step 1 of 5 - Tell us about your listing
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <ListingTypeField
              value={listingType}
              onChange={handleListingTypeChange}
              allowedIds={
                showBuilderFields
                  ? ["sale"]
                  : propertyType === "pg-co-living"
                    ? ["rent-lease"]
                    : undefined
              }
            />

            <PropertyTypeField
              value={propertyType}
              onChange={handlePropertyTypeChange}
              subType={propertySubType}
              onSubTypeChange={handleSubTypeChange}
              subTypes={showBuilderFields ? propertySubTypes : undefined}
              onSubTypesChange={showBuilderFields ? handleSubTypesChange : undefined}
              hiddenIds={showBuilderFields ? ["pg-co-living"] : undefined}
            />

            <AddressLocationField
              values={addressLocation}
              onChange={handleAddressLocationChange}
              errors={addressLocationErrors}
              hideUnitFields={showBuilderFields && builderConfig.hideUnitFields}
              projectNameRequired={!addressValidationOptions.projectNameOptional}
            />

            <div className="flex justify-center border-t border-slate-100/90 bg-linear-to-t from-slate-50/50 to-transparent pt-7">
              <button
                type="button"
                onClick={handleBasicDetailsNext}
                className={POST_PROPERTY_PRIMARY_BTN}
              >
                Next, Add Property Details
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {isPropertyDetailsStep ? (
        <section className="post-property-form-card mt-8 py-5 px-2 md:p-5 sm:mt-10 sm:p-6">
          <div className="mb-4 flex justify-start">
            <button
              type="button"
              onClick={handleGoBack}
              className={POST_PROPERTY_BACK_BTN}
            >
             <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
            </button>
          </div>

          <div className={POST_PROPERTY_STEP_HEADER}>
            <span className={POST_PROPERTY_STEP_ACCENT} aria-hidden />
            <div>
              <h2 className={POST_PROPERTY_STEP_TITLE}>Add Property Details</h2>
              <p className={POST_PROPERTY_STEP_DESC}>
                Step 2 of 5 - Area, rooms, and floor information
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {showBuilderFields && isMultiSubType ? (
              <>
                {builderProjectBlocks}
                <AvailableSizesField
                  values={projectDetails}
                  onChange={handleProjectDetailsChange}
                  propertyType={propertyType}
                  subType={propertySubTypes}
                  hideBhk={!builderConfig.showBhk}
                  sizeUnits={builderConfig.sizeUnits}
                  showUnitsAvailable
                />
                {commonDetailsCfg ? (
                  <SaleCommonSections
                    cfg={commonDetailsCfg}
                    sections={commonSections}
                    values={subForms.getDetails(subForms.firstTabId)}
                    onChange={subForms.changeDetailsAll}
                    errors={subForms.getCommonDetailsErrors()}
                  />
                ) : null}
                <SubTypeDetailsTabs
                  tabs={subForms.tabs}
                  activeId={activeTabId}
                  onActiveChange={subForms.setActiveId}
                  errorIds={subForms.errorIds.details}
                >
                  <BuilderPropertyDetailsField
                    key={activeTabId}
                    listingType={listingType}
                    propertyType={propertyType}
                    subType={[activeTabId]}
                    values={subForms.getDetails(activeTabId)}
                    onChange={(field, value) =>
                      subForms.changeDetails(activeTabId, field, value)
                    }
                    errors={subForms.detailsErrors[activeTabId] ?? {}}
                    projectDetails={subForms.getProject(activeTabId)}
                    onProjectDetailsChange={(field, value) =>
                      subForms.changeProject(
                        activeTabId,
                        field,
                        value,
                        handleProjectDetailsChange,
                      )
                    }
                    builderLayout
                    hideAvailableSizes
                    hideCommon={commonSections}
                  />
                </SubTypeDetailsTabs>
              </>
            ) : showBuilderFields ? (
              <BuilderPropertyDetailsField
                listingType={listingType}
                propertyType={propertyType}
                subType={[propertySubType]}
                values={propertyDetails}
                onChange={handlePropertyDetailsChange}
                errors={propertyDetailsErrors}
                projectDetails={projectDetails}
                onProjectDetailsChange={handleProjectDetailsChange}
                builderLayout
              />
            ) : (
              <PropertyDetailsField
                listingType={listingType}
                propertyType={propertyType}
                subType={propertySubType}
                values={propertyDetails}
                onChange={handlePropertyDetailsChange}
                errors={propertyDetailsErrors}
              />
            )}

            {isMultiSubType ? null : builderProjectBlocks}

            <div className="flex justify-center border-t border-slate-100/90 bg-linear-to-t from-slate-50/50 to-transparent pt-7">
              <button
                type="button"
                onClick={handlePropertyDetailsNext}
                className={POST_PROPERTY_PRIMARY_BTN}
              >
                Next, Add Amenities
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {isAmenitiesStep ? (
        <section className="post-property-form-card mt-8 py-5 px-2 md:p-5 sm:mt-10 sm:p-6">
          <div className="mb-4 flex justify-start">
            <button
              type="button"
              onClick={handleGoBack}
              className={POST_PROPERTY_BACK_BTN}
            >
             <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
            </button>
          </div>

          <div className={POST_PROPERTY_STEP_HEADER}>
            <span className={POST_PROPERTY_STEP_ACCENT} aria-hidden />
            <div>
              <h2 className={POST_PROPERTY_STEP_TITLE}>Add Amenities</h2>
              <p className={POST_PROPERTY_STEP_DESC}>
                Step 3 of 5 - Furnishing, amenities, and parking
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {showBuilderFields && isMultiSubType ? (
              <>
                {amenitySections.common.length > 0 ? (
                  <AmenitiesField
                    key="common-amenities"
                    isRent={isRent}
                    propertyType={propertyType}
                    subType={subForms.firstTabId}
                    catalogSubTypes={propertySubTypes}
                    values={subForms.getAmenities(subForms.firstTabId)}
                    onChange={subForms.changeAmenitiesAll}
                    errors={subForms.getCommonAmenitiesErrors()}
                    hideCarParking
                    builder
                    builderExtras={builderAmenityExtras}
                    sections={{ only: amenitySections.common }}
                  />
                ) : null}
                {amenitySections.perSubType.length > 0 ? (
                  <SubTypeDetailsTabs
                    tabs={subForms.tabs}
                    activeId={activeTabId}
                    onActiveChange={subForms.setActiveId}
                    errorIds={subForms.errorIds.amenities}
                  >
                    <AmenitiesField
                      key={activeTabId}
                      isRent={isRent}
                      propertyType={propertyType}
                      subType={activeTabId}
                      values={subForms.getAmenities(activeTabId)}
                      onChange={(field, value) =>
                        subForms.changeAmenities(activeTabId, field, value)
                      }
                      errors={subForms.amenitiesErrors[activeTabId] ?? {}}
                      hideCarParking
                      builder
                      builderExtras={builderAmenityExtras}
                      sections={{ only: amenitySections.perSubType }}
                    />
                  </SubTypeDetailsTabs>
                ) : null}
              </>
            ) : (
              <AmenitiesField
                isRent={isRent}
                propertyType={propertyType}
                subType={propertySubType}
                values={amenities}
                onChange={handleAmenitiesChange}
                errors={amenitiesErrors}
                hideCarParking={showBuilderFields}
                builder={showBuilderFields}
                builderExtras={builderAmenityExtras}
              />
            )}

            {showBuilderFields ? (
              <>
                {builderConfig.carParking === "none" ? null : (
                  <BhkCarParkingField
                    values={projectDetails}
                    onChange={handleProjectDetailsChange}
                    amenities={
                      isMultiSubType
                        ? subForms.getAmenities(subForms.firstTabId)
                        : amenities
                    }
                    onAmenitiesChange={
                      isMultiSubType
                        ? subForms.changeAmenitiesAll
                        : handleAmenitiesChange
                    }
                    error={
                      isMultiSubType
                        ? subForms.amenitiesErrors[subForms.firstTabId]?.carParking
                        : amenitiesErrors.carParking
                    }
                    singleBlock={builderConfig.carParking === "single"}
                    hideClubMembership={builderConfig.hideClubMembership}
                  />
                )}
                <ProjectHighlightsField
                  values={projectDetails}
                  onChange={handleProjectDetailsChange}
                />
                <PrimeLocationHighlightsField
                  projectName={addressLocation.projectName}
                  values={projectDetails}
                  onChange={handleProjectDetailsChange}
                />
              </>
            ) : null}

            <div className="flex justify-center border-t border-slate-100/90 bg-linear-to-t from-slate-50/50 to-transparent pt-7">
              <button
                type="button"
                onClick={handleAmenitiesNext}
                className={POST_PROPERTY_PRIMARY_BTN}
              >
                Next, Add Photos & Videos
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {isPhotosVideosStep ? (
        <section className="post-property-form-card mt-8 py-5 px-2 md:p-5 sm:mt-10 sm:p-6">
          <div className="mb-4 flex justify-start">
            <button
              type="button"
              onClick={handleGoBack}
              className={POST_PROPERTY_BACK_BTN}
            >
             <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
            </button>
          </div>

          <div className={POST_PROPERTY_STEP_HEADER}>
            <span className={POST_PROPERTY_STEP_ACCENT} aria-hidden />
            <div>
              <h2 className={POST_PROPERTY_STEP_TITLE}>Add Photos & Videos</h2>
              <p className={POST_PROPERTY_STEP_DESC}>
                Step 4 of 5 - Upload photos to attract more buyers
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {showBuilderFields && isMultiSubType && sharedPhotos ? (
              <PhotosVideosField
                key={`${propertyType}-shared`}
                propertyType={propertyType}
                listingType={listingType}
                subType={subForms.firstTabId}
                excludedCategoryIds={["brochure-images", "cluster-plan", "elevation"]}
                extraCategoryIds={
                  builderConfig.showConstructionProgress &&
                  showsConstructionProgress(projectDetails.projectType)
                    ? ["construction-progress"]
                    : undefined
                }
                values={subForms.getPhotos(subForms.firstTabId)}
                onChange={(next) => subForms.changePhotos(subForms.firstTabId, next)}
                error={subForms.photosErrors[subForms.firstTabId]}
                existingMedia={existingMedia}
                onRemoveExisting={handleRemoveExistingMedia}
                existingBrochureName={
                  editProperty?.brochurePath?.split("/").pop() ?? null
                }
              />
            ) : showBuilderFields && isMultiSubType ? (
              <>
                <PhotosVideosField
                  key={`${propertyType}-brochure`}
                  parts="brochure"
                  propertyType={propertyType}
                  listingType={listingType}
                  subType={subForms.firstTabId}
                  values={subForms.getPhotos(subForms.firstTabId)}
                  onChange={(next) => subForms.changePhotos(subForms.firstTabId, next)}
                  existingBrochureName={
                    editProperty?.brochurePath?.split("/").pop() ?? null
                  }
                />
                {builderMediaBlocks}
              <SubTypeDetailsTabs
                tabs={subForms.tabs}
                activeId={activeTabId}
                onActiveChange={subForms.setActiveId}
                errorIds={subForms.errorIds.photos}
              >
                <PhotosVideosField
                  key={`${propertyType}-${activeTabId}`}
                  parts="photos"
                  propertyType={propertyType}
                  listingType={listingType}
                  subType={activeTabId}
                  excludedCategoryIds={["brochure-images", "cluster-plan", "elevation"]}
                  extraCategoryIds={
                    builderConfig.showConstructionProgress &&
                    showsConstructionProgress(projectDetails.projectType)
                      ? ["construction-progress"]
                      : undefined
                  }
                  values={subForms.getPhotos(activeTabId)}
                  onChange={(next) => subForms.changePhotos(activeTabId, next)}
                  error={subForms.photosErrors[activeTabId]}
                  existingMedia={
                    activeTabId === subForms.firstTabId ? existingMedia : []
                  }
                  onRemoveExisting={handleRemoveExistingMedia}
                />
              </SubTypeDetailsTabs>
              </>
            ) : (
              <PhotosVideosField
                key={`${propertyType}-${propertySubType}`}
                propertyType={propertyType}
                listingType={listingType}
                subType={propertySubType}
                excludedCategoryIds={
                  showBuilderFields
                    ? ["brochure-images", "cluster-plan", "elevation"]
                    : undefined
                }
                extraCategoryIds={
                  showBuilderFields &&
                  builderConfig.showConstructionProgress &&
                  showsConstructionProgress(projectDetails.projectType)
                    ? ["construction-progress"]
                    : undefined
                }
                values={photosVideos}
                onChange={(next) => {
                  setPhotosVideos(next);
                  setPhotosError("");
                }}
                error={photosError}
                existingMedia={existingMedia}
                onRemoveExisting={handleRemoveExistingMedia}
                existingBrochureName={
                  editProperty?.brochurePath?.split("/").pop() ?? null
                }
              />
            )}

            {isMultiSubType && !sharedPhotos ? null : builderMediaBlocks}

            <div className="flex justify-center border-t border-slate-100/90 bg-linear-to-t from-slate-50/50 to-transparent pt-7">
              <button
                type="button"
                onClick={handlePhotosNext}
                className={POST_PROPERTY_PRIMARY_BTN}
              >
                Continue
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {isPricingOthersStep ? (
        <section className="post-property-form-card mt-8 py-5 px-2 md:p-5 sm:mt-10 sm:p-6">
          <div className="mb-4 flex justify-start">
            <button
              type="button"
              onClick={handleGoBack}
              className={POST_PROPERTY_BACK_BTN}
            >
             <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
            </button>
          </div>

          <div className={POST_PROPERTY_STEP_HEADER}>
            <span className={POST_PROPERTY_STEP_ACCENT} aria-hidden />
            <div>
              <h2 className={POST_PROPERTY_STEP_TITLE}>
                Add Pricing & Other Details
              </h2>
              <p className={POST_PROPERTY_STEP_DESC}>
                Step 5 of 5 - Set your price and finalize the listing
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {showBuilderFields && isMultiSubType && sharedPricing ? (
              priceInclusionFlags[0] ? (
                <PricingOthersField
                  key="shared-pricing"
                  isRent={isRent}
                  propertyType={propertyType}
                  subType={subForms.firstTabId}
                  values={subForms.getPricing(subForms.firstTabId)}
                  onChange={subForms.changePricingAll}
                  errors={subForms.pricingErrors[subForms.firstTabId] ?? {}}
                  builderLayout
                />
              ) : null
            ) : showBuilderFields && isMultiSubType ? (
              pricingTabs.length > 0 ? (
                <SubTypeDetailsTabs
                  tabs={pricingTabs}
                  activeId={activePricingTabId}
                  onActiveChange={subForms.setActiveId}
                  errorIds={subForms.errorIds.pricing}
                >
                  <PricingOthersField
                    key={activePricingTabId}
                    isRent={isRent}
                    propertyType={propertyType}
                    subType={activePricingTabId}
                    values={subForms.getPricing(activePricingTabId)}
                    onChange={(field, value) =>
                      subForms.changePricing(activePricingTabId, field, value)
                    }
                    errors={subForms.pricingErrors[activePricingTabId] ?? {}}
                    builderLayout
                  />
                </SubTypeDetailsTabs>
              ) : null
            ) : (
              <PricingOthersField
                isRent={isRent}
                propertyType={propertyType}
                subType={propertySubType}
                values={pricingOthers}
                onChange={handlePricingOthersChange}
                errors={pricingOthersErrors}
                builderLayout={showBuilderFields}
              />
            )}

            {showBuilderFields ? (
              <>
                <BhkChargesField
                  values={projectDetails}
                  onChange={handleProjectDetailsChange}
                  pricingOthers={
                    isMultiSubType
                      ? subForms.getPricing(subForms.firstTabId)
                      : pricingOthers
                  }
                  onPricingOthersChange={
                    isMultiSubType ? handleAllPricingChange : handlePricingOthersChange
                  }
                  singleBlock={!builderConfig.chargesByBhk}
                  showAssuredReturn={builderConfig.showAssuredReturn}
                  assuredReturnError={builderErrors.assuredReturn}
                />
                <ProjectPricingField
                  values={projectDetails}
                  onChange={handleProjectDetailsChange}
                  priceRangeReadOnly
                />
                <ProjectFaqField
                  values={projectDetails}
                  onChange={handleProjectDetailsChange}
                />
              </>
            ) : null}

            <div className="flex justify-center border-t border-slate-100/90 bg-linear-to-t from-slate-50/50 to-transparent pt-7">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`${POST_PROPERTY_PRIMARY_BTN} disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {isSubmitting
                  ? isEditMode
                    ? "Saving..."
                    : "Submitting..."
                  : isEditMode
                    ? "Save Changes"
                    : "Submit"}
              </button>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
