"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { DEFAULT_STATE } from "@/data/indianStatesCities";
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
  type AddressLocationValues,
  type AmenitiesValues,
  type ListingTypeId,
  type PhotosVideosValues,
  type PricingOthersValues,
  type PropertyDetailsValues,
  type PropertyTypeId,
} from "./postPropertyForm.shared";
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
  const [amenities, setAmenities] = useState<AmenitiesValues>(initialAmenities);
  const [photosVideos, setPhotosVideos] = useState<PhotosVideosValues>(
    createEmptyPhotosVideosValues(),
  );
  const [pricingOthers, setPricingOthers] =
    useState<PricingOthersValues>(initialPricingOthers);

  const handleAddressLocationChange = <
    K extends keyof AddressLocationValues,
  >(
    field: K,
    value: AddressLocationValues[K],
  ) => {
    setAddressLocation((current) => ({ ...current, [field]: value }));
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
  };

  const handleAmenitiesChange = <K extends keyof AmenitiesValues>(
    field: K,
    value: AmenitiesValues[K],
  ) => {
    setAmenities((current) => ({ ...current, [field]: value }));
  };

  const handlePricingOthersChange = <K extends keyof PricingOthersValues>(
    field: K,
    value: PricingOthersValues[K],
  ) => {
    setPricingOthers((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = () => {
    // TODO: wire up property submission API
    console.log("Submit property listing", {
      listingType,
      propertyType,
      propertySubType,
      addressLocation,
      propertyDetails,
      amenities,
      photosVideos,
      pricingOthers,
    });
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
    <div className="mx-auto w-full max-w-[1440px] px-2 py-8 sm:px-4 sm:py-10 lg:px-4">
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
            />

            <div className="flex justify-center border-t border-slate-100/90 bg-gradient-to-t from-slate-50/50 to-transparent pt-7">
              <button
                type="button"
                onClick={() => goToStep(2)}
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
            />

            <div className="flex justify-center border-t border-slate-100/90 bg-gradient-to-t from-slate-50/50 to-transparent pt-7">
              <button
                type="button"
                onClick={() => goToStep(3)}
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
            />

            <div className="flex justify-center border-t border-slate-100/90 bg-gradient-to-t from-slate-50/50 to-transparent pt-7">
              <button
                type="button"
                onClick={() => goToStep(4)}
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
              onChange={setPhotosVideos}
            />

            <div className="flex justify-center border-t border-slate-100/90 bg-gradient-to-t from-slate-50/50 to-transparent pt-7">
              <button
                type="button"
                onClick={() => goToStep(5)}
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
            />

            <div className="flex justify-center border-t border-slate-100/90 bg-gradient-to-t from-slate-50/50 to-transparent pt-7">
              <button
                type="button"
                onClick={handleSubmit}
                className={POST_PROPERTY_PRIMARY_BTN}
              >
                Submit
              </button>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
