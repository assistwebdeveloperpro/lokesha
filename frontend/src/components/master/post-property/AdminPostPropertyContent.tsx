"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { setRedirectToast } from "@/components/shared/ui/redirectToast";
import { useToast } from "@/components/shared/ui/ToastProvider";
import { DEFAULT_STATE } from "@/data/indianStatesCities";
import { ApiError } from "@/services/apiClient";
import { createAdminProperty } from "@/services/adminProperty.service";
import { getAdminToken } from "@/services/adminSession";
import type { PropertyMedia } from "@/services/property.service";
import { getToken } from "@/services/session";
import AddressLocationField from "./step-1-basic-information/AddressLocationField";
import ListingTypeField from "./step-1-basic-information/ListingTypeField";
import PropertyTypeField from "./step-1-basic-information/PropertyTypeField";
import {
  PrimeLocationHighlightsField,
  ProjectHighlightsField,
  ProjectOverviewField,
} from "./step-1-basic-information/ProjectDetailsField";
import PropertyDetailsField from "./step-2-property-details/PropertyDetailsField";
import AmenitiesField from "./step-3-amenities/AmenitiesField";
import FloorPlansField from "./step-4-media-upload/FloorPlansField";
import PhotosVideosField from "./step-4-media-upload/PhotosVideosField";
import PricingOthersField from "./step-5-pricing-and-additional-details/PricingOthersField";
import {
  ProjectFaqField,
  ProjectPricingField,
  VideoWalkthroughField,
} from "./step-5-pricing-and-additional-details/ProjectPricingFaqField";
import EditPropertyStatus from "./EditPropertyStatus";
import FormStepper from "./FormStepper";
import ProgressBar from "./ProgressBar";
import {
  createInitialProjectDetails,
  getUnitTypeConfig,
  type ProjectDetailsValues,
} from "./postPropertyProjectDetails";
import {
  EMPTY_AMENITIES_EXTRA,
  EMPTY_PROPERTY_DETAILS_EXTRA,
  arePhotosRequired,
  DEFAULT_RENT_AGE_OF_CONSTRUCTION,
  RESIDENTIAL_SUB_TYPES,
  SUB_TYPES_BY_PROPERTY_TYPE,
  isRentListing,
  createEmptyPhotosVideosValues,
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
import { resolveSubType } from "@/components/shared/post-property/config/postPropertySaleConfig";
import { mapPropertyToFormState } from "./postPropertyEdit";
import { buildAdminPropertyFormData } from "./postPropertyPayload";
import { saveEditedProperty } from "./saveEditedProperty";
import { useEditProperty } from "./useEditProperty";
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

export default function AdminPostPropertyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const currentStep = getStepFromSearchParam(searchParams.get("step"));
  const editId = searchParams.get("edit");
  const basePath = "/backend/properties/post-property";
  const loginPath = "/backend/login";
  const afterSubmitPath = "/backend/properties/manage-properties";
  const isEditMode = Boolean(editId);
  const {
    property: editProperty,
    isLoading: isLoadingEdit,
    error: editError,
  } = useEditProperty(editId);

  const [listingType, setListingType] = useState<ListingTypeId>("sale");
  const [propertyType, setPropertyType] =
    useState<PropertyTypeId>("residential");
  const [propertySubType, setPropertySubType] = useState<string[]>([
    RESIDENTIAL_SUB_TYPES[0].id,
  ]);
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
  const [projectDetails, setProjectDetails] = useState<ProjectDetailsValues>(
    createInitialProjectDetails,
  );
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

  // Prefill every step once the property being edited has loaded
  useEffect(() => {
    if (!editProperty) {
      return;
    }

    const state = mapPropertyToFormState(editProperty);
    /* eslint-disable react-hooks/set-state-in-effect */
    setListingType(state.listingType);
    setPropertyType(state.propertyType);
    setPropertySubType(state.propertySubType);
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

  const handleProjectDetailsChange = <K extends keyof ProjectDetailsValues>(
    field: K,
    value: ProjectDetailsValues[K],
  ) => {
    setProjectDetails((current) => ({ ...current, [field]: value }));
  };

  const handleBasicDetailsNext = () => {
    const errors = validateAddressLocation(addressLocation);

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

  const saleSubType = resolveSubType(propertySubType);

  const handlePropertyDetailsNext = () => {
    const errors = validatePropertyDetails(propertyDetails, {
      listingType,
      propertyType,
      subType: saleSubType,
      possessionDatePastAnchor: possessionDatePastAnchor || undefined,
      availableFromPastAnchor: availableFromPastAnchor || undefined,
    });

    if (hasPropertyDetailsErrors(errors)) {
      setPropertyDetailsErrors(errors);
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
    const errors = validateAmenities(amenities, propertyType, {
      listingType,
      subType: saleSubType,
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
    if (
      arePhotosRequired(propertyType, { listingType, subType: saleSubType }) &&
      getTotalMediaCount(photosVideos) + existingMedia.length === 0
    ) {
      setPhotosError("Please add at least one photo");
      return;
    }

    setPhotosError("");
    goToStep(5);
  };

  const applyFullFormValidation = (): number | null => {
    const nextAddressErrors = validateAddressLocation(addressLocation);
    const nextPropertyDetailsErrors = validatePropertyDetails(propertyDetails, {
      listingType,
      propertyType,
      subType: saleSubType,
      possessionDatePastAnchor: possessionDatePastAnchor || undefined,
      availableFromPastAnchor: availableFromPastAnchor || undefined,
    });
    const nextAmenitiesErrors = validateAmenities(amenities, propertyType, {
      listingType,
      subType: saleSubType,
    });
    const nextPricingErrors = validatePricingOthers(
      pricingOthers,
      listingType,
      propertyType,
      saleSubType,
    );
    const nextPhotosError =
      arePhotosRequired(propertyType, { listingType, subType: saleSubType }) &&
      getTotalMediaCount(photosVideos) + existingMedia.length === 0
        ? "Please add at least one photo"
        : "";

    setAddressLocationErrors(nextAddressErrors);
    setPropertyDetailsErrors(nextPropertyDetailsErrors);
    setAmenitiesErrors(nextAmenitiesErrors);
    setPricingOthersErrors(nextPricingErrors);
    setPhotosError(nextPhotosError);

    if (hasAddressLocationErrors(nextAddressErrors)) {
      return 1;
    }
    if (hasPropertyDetailsErrors(nextPropertyDetailsErrors)) {
      return 2;
    }
    if (hasAmenitiesErrors(nextAmenitiesErrors)) {
      return 3;
    }
    if (nextPhotosError) {
      return 4;
    }
    if (hasPricingOthersErrors(nextPricingErrors)) {
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

    const token = editId ? getToken() : getAdminToken();
    if (!token) {
      router.push(loginPath);
      return;
    }

    setIsSubmitting(true);

    const formState = {
      listingType,
      propertyType,
      propertySubType,
      addressLocation,
      propertyDetails,
      amenities,
      photosVideos,
      pricingOthers,
    };

    try {
      if (editId) {
        await saveEditedProperty({
          propertyId: editId,
          token,
          state: formState,
          removedMediaIds,
        });
        setRedirectToast("Property updated successfully");
      } else {
        await createAdminProperty(buildAdminPropertyFormData(formState, projectDetails), token);
        setRedirectToast("Property listed successfully");
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
    const nextSubTypes = subTypeOptions ? [subTypeOptions[0].id] : [];
    setPropertySubType(nextSubTypes);
    clearStaleUnitTypes(nextPropertyType, nextSubTypes);

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

  const handleSubTypeChange = (nextSubTypes: string[]) => {
    const previousSubType = resolveSubType(propertySubType);
    const nextSubType = resolveSubType(nextSubTypes);

    setPropertySubType(nextSubTypes);
    clearStaleUnitTypes(propertyType, nextSubTypes);

    if (previousSubType === nextSubType) {
      return;
    }

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

  // Unit types no longer offered by the selected sub types are cleared
  const clearStaleUnitTypes = (
    nextPropertyType: PropertyTypeId,
    nextSubTypes: string[],
  ) => {
    const { unitTypes } = getUnitTypeConfig(nextPropertyType, nextSubTypes);
    const keep = (value: string) => (unitTypes.includes(value) ? value : "");

    setProjectDetails((current) => ({
      ...current,
      configurations: current.configurations.map((row) => ({
        ...row,
        unitType: keep(row.unitType),
      })),
      availableSizes: current.availableSizes.map((row) => ({
        ...row,
        unitType: keep(row.unitType),
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
                propertyType === "pg-co-living" ? ["rent-lease"] : undefined
              }
            />

            <PropertyTypeField
              value={propertyType}
              onChange={handlePropertyTypeChange}
              subType={propertySubType}
              onSubTypeChange={handleSubTypeChange}
            />

            <AddressLocationField
              values={addressLocation}
              onChange={handleAddressLocationChange}
              errors={addressLocationErrors}
            />

            <ProjectOverviewField
              values={projectDetails}
              onChange={handleProjectDetailsChange}
              propertyType={propertyType}
              subType={propertySubType}
            />

            <ProjectHighlightsField
              values={projectDetails}
              onChange={handleProjectDetailsChange}
            />

            <PrimeLocationHighlightsField
              projectName={addressLocation.projectName}
              values={projectDetails}
              onChange={handleProjectDetailsChange}
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
            <PropertyDetailsField
              listingType={listingType}
              propertyType={propertyType}
              subType={propertySubType}
              values={propertyDetails}
              onChange={handlePropertyDetailsChange}
              errors={propertyDetailsErrors}
              projectDetails={projectDetails}
              onProjectDetailsChange={handleProjectDetailsChange}
            />

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
            <AmenitiesField
              isRent={isRent}
              propertyType={propertyType}
              subType={saleSubType}
              values={amenities}
              onChange={handleAmenitiesChange}
              errors={amenitiesErrors}
            />

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
            <PhotosVideosField
              key={`${propertyType}-${saleSubType ?? "multi"}`}
              propertyType={propertyType}
              listingType={listingType}
              subType={saleSubType}
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

            <FloorPlansField
              projectName={addressLocation.projectName}
              propertyType={propertyType}
              subType={propertySubType}
              values={projectDetails}
              onChange={handleProjectDetailsChange}
            />

            <VideoWalkthroughField
              values={projectDetails}
              onChange={handleProjectDetailsChange}
            />

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
            <PricingOthersField
              isRent={isRent}
              propertyType={propertyType}
              subType={saleSubType}
              values={pricingOthers}
              onChange={handlePricingOthersChange}
              errors={pricingOthersErrors}
            />

            {isRent ? null : (
              <ProjectPricingField
                values={projectDetails}
                onChange={handleProjectDetailsChange}
              />
            )}

            <ProjectFaqField
              values={projectDetails}
              onChange={handleProjectDetailsChange}
            />

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
