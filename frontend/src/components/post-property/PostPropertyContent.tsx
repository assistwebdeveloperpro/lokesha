"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { DEFAULT_STATE } from "@/data/indianStatesCities";
import { ApiError } from "@/services/apiClient";
import { createProperty } from "@/services/property.service";
import { getToken } from "@/services/session";
import AddressLocationField from "./AddressLocationField";
import AmenitiesField from "./AmenitiesField";
import FormStepper from "./FormStepper";
import PhotosVideosField from "./PhotosVideosField";
import PricingOthersField from "./PricingOthersField";
import ListingTypeField from "./ListingTypeField";
import ProgressBar from "./ProgressBar";
import PropertyDetailsField from "./PropertyDetailsField";
import PropertyTypeField from "./PropertyTypeField";
import {
  RESIDENTIAL_SUB_TYPES,
  SUB_TYPES_BY_PROPERTY_TYPE,
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
import { buildPropertyFormData } from "./postPropertyPayload";
import {
  POST_PROPERTY_PRIMARY_BTN,
  POST_PROPERTY_STEP_ACCENT,
  POST_PROPERTY_STEP_DESC,
  POST_PROPERTY_STEP_HEADER,
  POST_PROPERTY_STEP_TITLE,
} from "./postPropertyForm.styles";

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
};

const initialPricingOthers: PricingOthersValues = {
  expectedPrice: "",
  priceInclusion: [],
  priceNegotiable: false,
  transferFee: "",
  bookingAmount: "",
  maintenanceCharges: "",
  benefitsRemarks: "",
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
};

export default function PostPropertyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStep = getStepFromSearchParam(searchParams.get("step"));

  const [listingType, setListingType] = useState<ListingTypeId>("sale");
  const [propertyType, setPropertyType] =
    useState<PropertyTypeId>("residential");
  const [propertySubType, setPropertySubType] = useState(
    RESIDENTIAL_SUB_TYPES[0].id,
  );
  const [addressLocationErrors, setAddressLocationErrors] =
    useState<AddressLocationFieldErrors>({});
  const [addressLocation, setAddressLocation] = useState<AddressLocationValues>({
    blockNo: "",
    flatNumber: "",
    societyName: "",
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
  const [submitErrors, setSubmitErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddressLocationChange = <
    K extends keyof AddressLocationValues,
  >(
    field: K,
    value: AddressLocationValues[K],
  ) => {
    setAddressLocation((current) => ({ ...current, [field]: value }));

    if (
      field === "societyName" ||
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
        field === "propertyTransaction" ||
        field === "constructionStatus" ||
        field === "ageOfConstruction" ||
        field === "possessionDate" ||
        field === "bedrooms" ||
        field === "balcony" ||
        field === "totalFloors" ||
        field === "floorNumber" ||
        field === "bathrooms"
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
    const errors = validatePropertyDetails(propertyDetails);

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
    const errors = validateAmenities(amenities);

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
    if (getTotalMediaCount(photosVideos) === 0) {
      setPhotosError("Please add at least one photo");
      return;
    }

    setPhotosError("");
    goToStep(5);
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    const validationErrors = validatePricingOthers(pricingOthers);
    if (hasPricingOthersErrors(validationErrors)) {
      setPricingOthersErrors(validationErrors);
      return;
    }
    setPricingOthersErrors({});

    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    setSubmitErrors([]);
    setIsSubmitting(true);

    try {
      await createProperty(
        buildPropertyFormData({
          listingType,
          propertyType,
          propertySubType,
          addressLocation,
          propertyDetails,
          amenities,
          photosVideos,
          pricingOthers,
        }),
        token,
      );
      router.push("/user/properties/manage-properties");
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        router.push("/login");
        return;
      }

      if (error instanceof ApiError) {
        setSubmitErrors(
          error.errors && error.errors.length > 0 ? error.errors : [error.message],
        );
      } else {
        setSubmitErrors(["Something went wrong. Please try again."]);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePropertyTypeChange = (nextPropertyType: PropertyTypeId) => {
    setPropertyType(nextPropertyType);

    const subTypeOptions = SUB_TYPES_BY_PROPERTY_TYPE[nextPropertyType];
    setPropertySubType(subTypeOptions ? subTypeOptions[0].id : "");
  };

  const goToStep = (step: number) => {
    const nextUrl =
      step <= 1 ? "/post-property" : `/post-property?step=${step}`;
    router.push(nextUrl, { scroll: false });
  };

  const isBasicDetailsStep = currentStep === 1;
  const isPropertyDetailsStep = currentStep === 2;
  const isAmenitiesStep = currentStep === 3;
  const isPhotosVideosStep = currentStep === 4;
  const isPricingOthersStep = currentStep === 5;

  return (
    <div className="mx-auto w-full max-w-360 px-2 py-8 sm:px-4 sm:py-10 lg:px-4">
      <header>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-30">
          <div className="shrink-0">
            <h1 className="font-display text-xl font-bold text-navy-blue sm:text-2xl">
              Add Property Details
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-600">
              Sell or rent your property
            </p>
          </div>
          <ProgressBar percent={getProgressForStep(currentStep)} />
        </div>
      </header>

      <section className="mt-8 sm:mt-10">
        <FormStepper currentStep={currentStep} />
      </section>

      {isBasicDetailsStep ? (
        <section className="post-property-form-card mt-8 p-5 sm:mt-10 sm:p-8">
          <div className={POST_PROPERTY_STEP_HEADER}>
            <span className={POST_PROPERTY_STEP_ACCENT} aria-hidden />
            <div>
              <h2 className={POST_PROPERTY_STEP_TITLE}>Add Basic Details</h2>
              <p className={POST_PROPERTY_STEP_DESC}>
                Step 1 of 5 — Tell us about your listing
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <ListingTypeField value={listingType} onChange={setListingType} />

            <PropertyTypeField
              value={propertyType}
              onChange={handlePropertyTypeChange}
              subType={propertySubType}
              onSubTypeChange={setPropertySubType}
            />

            <AddressLocationField
              values={addressLocation}
              onChange={handleAddressLocationChange}
              errors={addressLocationErrors}
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
        <section className="post-property-form-card mt-8 p-5 sm:mt-10 sm:p-8">
          <div className={POST_PROPERTY_STEP_HEADER}>
            <span className={POST_PROPERTY_STEP_ACCENT} aria-hidden />
            <div>
              <h2 className={POST_PROPERTY_STEP_TITLE}>Add Property Details</h2>
              <p className={POST_PROPERTY_STEP_DESC}>
                Step 2 of 5 — Area, rooms, and floor information
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <PropertyDetailsField
              values={propertyDetails}
              onChange={handlePropertyDetailsChange}
              errors={propertyDetailsErrors}
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
        <section className="post-property-form-card mt-8 p-5 sm:mt-10 sm:p-8">
          <div className={POST_PROPERTY_STEP_HEADER}>
            <span className={POST_PROPERTY_STEP_ACCENT} aria-hidden />
            <div>
              <h2 className={POST_PROPERTY_STEP_TITLE}>Add Amenities</h2>
              <p className={POST_PROPERTY_STEP_DESC}>
                Step 3 of 5 — Furnishing, amenities, and parking
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <AmenitiesField
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
        <section className="post-property-form-card mt-8 p-5 sm:mt-10 sm:p-8">
          <div className={POST_PROPERTY_STEP_HEADER}>
            <span className={POST_PROPERTY_STEP_ACCENT} aria-hidden />
            <div>
              <h2 className={POST_PROPERTY_STEP_TITLE}>Add Photos & Videos</h2>
              <p className={POST_PROPERTY_STEP_DESC}>
                Step 4 of 5 — Upload photos to attract more buyers
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <PhotosVideosField
              values={photosVideos}
              onChange={(next) => {
                setPhotosVideos(next);
                setPhotosError("");
              }}
              error={photosError}
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
        <section className="post-property-form-card mt-8 p-5 sm:mt-10 sm:p-8">
          <div className={POST_PROPERTY_STEP_HEADER}>
            <span className={POST_PROPERTY_STEP_ACCENT} aria-hidden />
            <div>
              <h2 className={POST_PROPERTY_STEP_TITLE}>
                Add Pricing & Other Details
              </h2>
              <p className={POST_PROPERTY_STEP_DESC}>
                Step 5 of 5 — Set your price and finalize the listing
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <PricingOthersField
              values={pricingOthers}
              onChange={handlePricingOthersChange}
              errors={pricingOthersErrors}
            />

            {submitErrors.length > 0 ? (
              <div className="space-y-1 text-center text-sm text-red-500">
                {submitErrors.map((message) => (
                  <p key={message}>{message}</p>
                ))}
              </div>
            ) : null}

            <div className="flex justify-center border-t border-slate-100/90 bg-linear-to-t from-slate-50/50 to-transparent pt-7">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`${POST_PROPERTY_PRIMARY_BTN} disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
