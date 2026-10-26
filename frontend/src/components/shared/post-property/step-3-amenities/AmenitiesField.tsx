"use client";

import type { ReactNode } from "react";
import PostPropertyInput from "../components/PostPropertyInput";
import ChipSelectField from "../components/ChipSelectField";
import ExpandableIconTileSelect from "../components/ExpandableIconTileSelect";
import PostPropertyFieldSection from "../components/PostPropertyFieldSection";
import PostPropertyRequiredAsterisk from "../components/PostPropertyRequiredAsterisk";
import { getFormConfig, type AmenitySection } from "../config/postPropertySaleConfig";
import {
  BUSINESS_OPTIONS,
  FACING_OPTIONS,
  FURNISHING_STATUS_OPTIONS,
  ROAD_FACING_OPTIONS,
  numberOptions,
  showsFurnishingField,
  type AmenitiesFieldErrors,
  type AmenitiesValues,
  type FacingOption,
  type FurnishingStatusId,
  type ImageTileOption,
  type PropertyTypeId,
} from "../config/postPropertyForm.shared";
import {
  POST_PROPERTY_CHECKBOX_ROW,
  POST_PROPERTY_INNER_PANEL,
  POST_PROPERTY_SUBSECTION_LABEL,
} from "../config/postPropertyForm.styles";

const checkboxClassName =
  "h-4.5 w-4.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500";

function CheckboxRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className={POST_PROPERTY_CHECKBOX_ROW}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className={checkboxClassName}
      />
      <span className="text-sm font-semibold text-slate-800">{label}</span>
    </label>
  );
}

export default function AmenitiesField({
  isRent = false,
  propertyType = "residential",
  subType,
  values,
  onChange,
  errors = {},
  hideCarParking = false,
  builder = false,
  builderExtras,
  sections,
}: {
  // Renders only (or all but) the given sections, used to ask shared sections once above the tabs
  sections?: { only?: AmenitySection[]; except?: AmenitySection[] };
  hideCarParking?: boolean;
  builder?: boolean;
  builderExtras?: ReactNode;
  isRent?: boolean;
  propertyType?: PropertyTypeId;
  subType?: string;
  values: AmenitiesValues;
  errors?: AmenitiesFieldErrors;
  onChange: <K extends keyof AmenitiesValues>(
    field: K,
    value: AmenitiesValues[K],
  ) => void;
}) {
  const showFurnishing = showsFurnishingField(values.status);
  const saleConfig = getFormConfig(
    isRent ? "rent-lease" : "sale",
    propertyType,
    subType,
    builder,
  )?.amenities;
  const isCommercial = propertyType === "commercial";
  const isPg = propertyType === "pg-co-living";
  const isPlot = propertyType === "plot";
  const isLand = propertyType === "land";
  const isResidentialType = propertyType === "residential";
  const isResidentialLike = !isPlot && !isLand;

  const inScope = (section: AmenitySection) =>
    (!sections?.only || sections.only.includes(section)) &&
    !sections?.except?.includes(section);

  const showStatus =
    inScope("status") && (saleConfig ? saleConfig.status : !isPlot && !isLand);
  const showAmenities =
    inScope("amenities") &&
    (saleConfig ? saleConfig.amenities !== "hidden" : !isPg && !isLand);
  const amenitiesRequired = saleConfig
    ? saleConfig.amenities === "required"
    : isResidentialLike;
  const amenityOptions: ImageTileOption[] = [];
  const furnishingOptions: ImageTileOption[] = [];

  const showClubMembership =
    !hideCarParking &&
    (saleConfig ? saleConfig.clubMembership : !isRent && !isCommercial && !isPg);
  const showCarParking = !hideCarParking && (saleConfig ? saleConfig.carParking : true);
  const showParking = saleConfig
    ? showCarParking || showClubMembership
    : !isPlot && !isLand && (showCarParking || showClubMembership);
  const showRera =
    inScope("additional") &&
    (saleConfig ? saleConfig.rera : !isPlot && !isPg && (isLand || !isRent));
  const showOpenSides =
    inScope("additional") && (saleConfig ? saleConfig.openSides : !isCommercial);
  const showFacing =
    inScope("facing") && (saleConfig ? saleConfig.facing !== "hidden" : true);
  const facingRequired = saleConfig ? saleConfig.facing === "required" : isPlot;
  const showWashrooms =
    inScope("washrooms") &&
    (saleConfig ? saleConfig.washrooms !== "hidden" : isCommercial);
  const washroomsRequired = saleConfig ? saleConfig.washrooms === "required" : true;
  const showRoadFacing =
    inScope("roadFacing") && (saleConfig ? saleConfig.roadFacing : !isResidentialType);
  const showBusinessTypes =
    inScope("businessTypes") && (saleConfig ? saleConfig.businessTypes : isCommercial);
  const showPantry =
    inScope("pantry") && (saleConfig ? saleConfig.pantry : isCommercial || isPg);
  const showCafeteria =
    inScope("cafeteria") && (saleConfig ? saleConfig.cafeteria : isPg && !isCommercial);
  const showCornerShop =
    inScope("cornerShop") && (saleConfig ? saleConfig.cornerShop : isCommercial);

  const handleStatusChange = (label: string) => {
    const match = FURNISHING_STATUS_OPTIONS.find(
      (option) => option.label === label,
    );
    const nextStatus = (match?.id ?? "") as FurnishingStatusId | "";
    onChange("status", nextStatus);

    if (!showsFurnishingField(nextStatus)) {
      onChange("furnishing", []);
    }
  };

  const roadFacing = (
    <ChipSelectField
      legend="Road Facing"
      options={ROAD_FACING_OPTIONS}
      value={values.roadFacing}
      onChange={(value) => onChange("roadFacing", value)}
    />
  );

  const facing = (
    <ChipSelectField
      legend="Facing"
      required={facingRequired}
      options={[...FACING_OPTIONS]}
      value={values.facing}
      error={errors.facing}
      onChange={(label) => onChange("facing", label as FacingOption | "")}
    />
  );

  return (
    <div className="space-y-5 sm:space-y-6">
      {showStatus ? (
        <PostPropertyFieldSection
          title="Status & Furnishing"
          required
          description="Choose furnished status and select available items"
        >
          <ChipSelectField
            legend="Status"
            required
            bare
            options={FURNISHING_STATUS_OPTIONS.map((option) => option.label)}
            value={
              FURNISHING_STATUS_OPTIONS.find(
                (option) => option.id === values.status,
              )?.label ?? ""
            }
            onChange={handleStatusChange}
            error={errors.status}
          />

          {showFurnishing ? (
            <div className="mt-5">
              <ExpandableIconTileSelect
                legend="Furnishing"
                required
                bare
                options={furnishingOptions}
                value={values.furnishing}
                onChange={(nextValue) => onChange("furnishing", nextValue)}
                error={errors.furnishing}
              />
            </div>
          ) : null}
        </PostPropertyFieldSection>
      ) : null}

      {showAmenities ? (
        <ExpandableIconTileSelect
          legend="Amenities"
          required={amenitiesRequired}
          options={amenityOptions}
          value={values.amenities}
          onChange={(nextValue) => onChange("amenities", nextValue)}
          error={errors.amenities}
        />
      ) : null}

      {showFacing ? facing : null}

      {showWashrooms ? (
        <ChipSelectField
          legend="Washroom"
          required={washroomsRequired}
          options={numberOptions(1, 7)}
          value={values.washrooms}
          error={errors.washrooms}
          onChange={(value) => onChange("washrooms", value)}
          moreOptions={["8"]}
        />
      ) : null}

      {showRoadFacing ? roadFacing : null}

      {showBusinessTypes ? (
        <ExpandableIconTileSelect
          legend="Ideal for business"
          options={BUSINESS_OPTIONS}
          value={values.businessTypes}
          onChange={(nextValue) => onChange("businessTypes", nextValue)}
        />
      ) : null}

      {showRera || showOpenSides || (inScope("additional") && builderExtras) ? (
        <PostPropertyFieldSection title="Additional Details">
          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
            {showRera ? (
              <PostPropertyInput
                id="reraNumber"
                label="RERA Number"
                placeholder="RERA Number"
                variant="underline"
                staticLabel
                value={values.reraNumber}
                onChange={(nextValue) => onChange("reraNumber", nextValue)}
              />
            ) : null}
            {inScope("additional") ? builderExtras : null}
            {showOpenSides ? (
              <PostPropertyInput
                id="openSides"
                label="No. of open sides"
                placeholder="No. of open sides"
                variant="underline"
                staticLabel
                type="number"
                value={values.openSides}
                onChange={(nextValue) => onChange("openSides", nextValue)}
              />
            ) : null}
          </div>
        </PostPropertyFieldSection>
      ) : null}

      {showParking ? (
        <PostPropertyFieldSection
          title={showClubMembership ? "Parking & Membership" : "Parking"}
          description={
            showClubMembership
              ? "Tell buyers about parking slots and club membership"
              : "Tell buyers about available parking"
          }
        >
          <div className="space-y-4">
            {showCarParking ? (
              <div className={`${POST_PROPERTY_INNER_PANEL} space-y-4`}>
                <p className={POST_PROPERTY_SUBSECTION_LABEL}>Car parking</p>
                <label className={POST_PROPERTY_CHECKBOX_ROW}>
                  <input
                    type="checkbox"
                    checked={values.carParkingAvailable}
                    onChange={(event) => {
                      const isChecked = event.target.checked;
                      onChange("carParkingAvailable", isChecked);
                      if (!isChecked) {
                        onChange("carParking", "");
                      }
                    }}
                    className={checkboxClassName}
                  />
                  <span className="text-sm font-semibold text-slate-800">
                    Car Parking Available
                    <PostPropertyRequiredAsterisk />
                  </span>
                </label>

                {values.carParkingAvailable ? (
                  <ChipSelectField
                    legend="Number of slots"
                    required
                    bare
                    options={["1", "2", "3", "4", "5", "6", "7"]}
                    value={values.carParking}
                    onChange={(nextValue) => onChange("carParking", nextValue)}
                    moreOptions={["8", "9", "10"]}
                    error={errors.carParking}
                  />
                ) : null}
              </div>
            ) : null}

            {showClubMembership ? (
              <div className={POST_PROPERTY_INNER_PANEL}>
                <p className={`${POST_PROPERTY_SUBSECTION_LABEL} mb-3`}>
                  Club membership
                </p>
                <CheckboxRow
                  label="Club Membership included"
                  checked={values.clubMembership}
                  onChange={(checked) => onChange("clubMembership", checked)}
                />
              </div>
            ) : null}
          </div>
        </PostPropertyFieldSection>
      ) : null}

      {showPantry ? (
        <CheckboxRow
          label="Pantry"
          checked={values.pantry}
          onChange={(checked) => onChange("pantry", checked)}
        />
      ) : null}

      {showCornerShop ? (
        <CheckboxRow
          label="Corner shop/Showroom"
          checked={values.cornerShop}
          onChange={(checked) => onChange("cornerShop", checked)}
        />
      ) : null}

      {showCafeteria ? (
        <CheckboxRow
          label="Cafeteria"
          checked={values.cafeteria}
          onChange={(checked) => onChange("cafeteria", checked)}
        />
      ) : null}
    </div>
  );
}
