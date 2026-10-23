import type { ReactNode } from "react";
import PostPropertyInput from "../PostPropertyInput";
import ChipSelectField from "../ChipSelectField";
import PostPropertyFieldSection from "../PostPropertyFieldSection";
import TenantPreferenceField from "./TenantPreferenceField";
import AvailableSizesField from "./AvailableSizesField";
import type { ProjectDetailsValues } from "../postPropertyProjectDetails";
import {
  CommercialDetails,
  LandDetails,
  PgDetails,
  PlotDetails,
  SaleDetails,
} from "@/components/shared/post-property/step-2-property-details/PropertyDetailsVariants";
import {
  AreaExtraFields,
  TotalFloorsFields,
  type AreaMaxFields,
} from "@/components/shared/post-property/step-2-property-details/PropertyDetailsParts";
import {
  getBuilderSaleFormConfig,
  getSaleFormConfig,
  resolveSubType,
  type CommonDetailSections,
} from "@/components/shared/post-property/config/postPropertySaleConfig";
import { getBuilderConfig } from "@/components/shared/post-property/builder/builderConfig";
import {
  POST_PROPERTY_CHECKBOX_ROW,
  POST_PROPERTY_TWO_COLUMN_GRID,
} from "../postPropertyForm.styles";
import {
  AGE_OF_CONSTRUCTION_OPTIONS,
  AREA_TYPE_OPTIONS,
  CONSTRUCTION_STATUS_OPTIONS,
  PROPERTY_TRANSACTION_OPTIONS,
  getPossessionDateInputMin,
  isRentListing,
  type AgeOfConstructionId,
  type AreaTypeId,
  type ConstructionStatusId,
  type ListingTypeId,
  type PropertyDetailsFieldErrors,
  type PropertyDetailsValues,
  type PropertyTypeId,
} from "../postPropertyForm.shared";

const areaTypeDropdownOptions = [
  { value: "", label: "Select unit" },
  ...AREA_TYPE_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
  })),
];

const dropdownMenuClassName =
  "absolute left-0 z-50 mt-1 max-h-60 w-full min-w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg shadow-slate-900/10";

const checkboxClassName =
  "h-4.5 w-4.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500";

export default function PropertyDetailsField({
  listingType,
  propertyType,
  subType,
  values,
  onChange,
  errors = {},
  projectDetails,
  onProjectDetailsChange,
  builderLayout = false,
  hideAvailableSizes = false,
  hideCommon,
}: {
  builderLayout?: boolean;
  hideAvailableSizes?: boolean;
  hideCommon?: Partial<CommonDetailSections>;
  listingType: ListingTypeId;
  propertyType: PropertyTypeId;
  subType: string[];
  values: PropertyDetailsValues;
  onChange: <K extends keyof PropertyDetailsValues>(
    field: K,
    value: PropertyDetailsValues[K],
  ) => void;
  errors?: PropertyDetailsFieldErrors;
  projectDetails: ProjectDetailsValues;
  onProjectDetailsChange: <K extends keyof ProjectDetailsValues>(
    field: K,
    value: ProjectDetailsValues[K],
  ) => void;
}) {
  const isRent = isRentListing(listingType);
  const part = { values, onChange, errors };
  const resolvedSubType = resolveSubType(subType);
  const saleConfig = builderLayout
    ? getBuilderSaleFormConfig(propertyType, resolvedSubType)
    : getSaleFormConfig(listingType, propertyType, resolvedSubType);
  const builderConfig =
    builderLayout && resolvedSubType
      ? getBuilderConfig(propertyType, resolvedSubType)
      : null;
  const maxFields: AreaMaxFields | undefined = builderConfig
    ? {
        plot: builderConfig.plotAreaMax
          ? {
              value: projectDetails.plotAreaMax,
              onChange: (value) => onProjectDetailsChange("plotAreaMax", value),
            }
          : undefined,
        terrace: builderConfig.terraceAreaMax
          ? {
              value: projectDetails.terraceAreaMax,
              onChange: (value) => onProjectDetailsChange("terraceAreaMax", value),
            }
          : undefined,
      }
    : undefined;
  const availableSizes =
    !hideAvailableSizes && (builderLayout || !isRent) ? (
      <AvailableSizesField
        values={projectDetails}
        onChange={onProjectDetailsChange}
        propertyType={propertyType}
        subType={subType}
        hideBhk={builderConfig ? !builderConfig.showBhk : false}
        sizeUnits={builderConfig?.sizeUnits}
        showUnitsAvailable={builderLayout}
      />
    ) : null;
  const withBuilderSizes = (node: ReactNode) =>
    builderLayout && availableSizes ? (
      <div className="space-y-5 sm:space-y-6">
        {node}
        {availableSizes}
      </div>
    ) : (
      node
    );

  if (saleConfig && propertyType !== "residential" && !builderLayout) {
    return <SaleDetails {...part} cfg={saleConfig.details} />;
  }

  if (!saleConfig) {
    if (propertyType === "commercial") {
      return withBuilderSizes(<CommercialDetails {...part} isRent={isRent} />);
    }
    if (propertyType === "pg-co-living") {
      return withBuilderSizes(<PgDetails {...part} />);
    }
    if (propertyType === "plot") {
      return withBuilderSizes(<PlotDetails {...part} />);
    }
    if (propertyType === "land") {
      return withBuilderSizes(<LandDetails {...part} />);
    }
  }

  const areaSection = (
      <PostPropertyFieldSection
        title="Area Details"
        description="Enter carpet area and super built-up range"
      >
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-3 md:gap-6">
            <PostPropertyInput
              id="carpetAreaNumber"
              label="Carpet Area Min*"
              placeholder="e.g. 800"
              variant="underline"
              type="number"
              staticLabel
              value={values.carpetAreaNumber}
              error={errors.carpetAreaNumber}
              onChange={(value) => onChange("carpetAreaNumber", value)}
            />
            <PostPropertyInput
              id="carpetAreaMax"
              label="Carpet Area Max"
              placeholder="e.g. 1000"
              variant="underline"
              type="number"
              staticLabel
              value={projectDetails.carpetAreaMax}
              onChange={(value) => onProjectDetailsChange("carpetAreaMax", value)}
            />
            <PostPropertyInput
              id="carpetAreaType"
              label="Carpet Area Type*"
              variant="underline"
              staticLabel
              options={areaTypeDropdownOptions}
              value={values.carpetAreaType}
              error={errors.carpetAreaType}
              onChange={(value) =>
                onChange("carpetAreaType", value as AreaTypeId | "")
              }
              dropdownMenuClassName={dropdownMenuClassName}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3 md:gap-6">
            <PostPropertyInput
              id="superBuildUpNumber"
              label="Super Built-up Min*"
              placeholder="e.g. 1100"
              variant="underline"
              staticLabel
              value={values.superBuildUpNumber}
              type="number"
              error={errors.superBuildUpNumber}
              onChange={(value) => onChange("superBuildUpNumber", value)}
            />
            <PostPropertyInput
              id="superBuildUpMax"
              label="Super Built-up Max"
              placeholder="e.g. 1300"
              variant="underline"
              type="number"
              staticLabel
              value={projectDetails.superBuildUpMax}
              onChange={(value) =>
                onProjectDetailsChange("superBuildUpMax", value)
              }
            />
            <PostPropertyInput
              id="superBuildUpType"
              label="Super Built-up Type*"
              variant="underline"
              staticLabel
              options={areaTypeDropdownOptions}
              value={values.superBuildUpType}
              error={errors.superBuildUpType}
              onChange={(value) =>
                onChange("superBuildUpType", value as AreaTypeId | "")
              }
              dropdownMenuClassName={dropdownMenuClassName}
            />
          </div>

          {saleConfig ? (
            <AreaExtraFields
              {...part}
              cfg={saleConfig.details}
              maxFields={maxFields}
            />
          ) : null}
        </div>
      </PostPropertyFieldSection>
  );

  if (saleConfig) {
    return (
      <SaleDetails
        {...part}
        cfg={saleConfig.details}
        areaSlot={areaSection}
        afterAreaSlot={availableSizes}
        maxFields={maxFields}
        hide={hideCommon}
      />
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {areaSection}

      {availableSizes}

      {isRent || hideCommon?.transaction ? null : (
      <PostPropertyFieldSection
        title="Property Transaction & Construction Status"
        description="Select transaction type and related construction details"
      >
        <ChipSelectField
          legend="Property Transaction"
          required
          bare
          options={PROPERTY_TRANSACTION_OPTIONS.map((option) => option.label)}
          value={
            PROPERTY_TRANSACTION_OPTIONS.find(
              (option) => option.id === values.propertyTransaction,
            )?.label ?? ""
          }
          error={errors.propertyTransaction}
          onChange={(label) => {
            const match = PROPERTY_TRANSACTION_OPTIONS.find(
              (option) => option.label === label,
            );
            onChange("propertyTransaction", match?.id ?? "");
          }}
        />

        {values.propertyTransaction === "new" ? (
          <div className="mt-5 space-y-5">
            <ChipSelectField
              legend="Construction Status"
              required
              bare
              options={CONSTRUCTION_STATUS_OPTIONS.map((option) => option.label)}
              value={
                CONSTRUCTION_STATUS_OPTIONS.find(
                  (option) => option.id === values.constructionStatus,
                )?.label ?? ""
              }
              error={errors.constructionStatus}
              onChange={(label) => {
                const match = CONSTRUCTION_STATUS_OPTIONS.find(
                  (option) => option.label === label,
                );
                onChange(
                  "constructionStatus",
                  (match?.id ?? "") as ConstructionStatusId | "",
                );
              }}
            />
            <div className="grid gap-4 md:grid-cols-2 md:gap-6">
              <PostPropertyInput
                id="possessionDate"
                label="Possession Date*"
                placeholder="Possession Date"
                variant="underline"
                type="date"
                staticLabel
                min={getPossessionDateInputMin(values.possessionDate)}
                value={values.possessionDate}
                error={errors.possessionDate}
                onChange={(value) => onChange("possessionDate", value)}
              />
            </div>
          </div>
        ) : null}

        {values.propertyTransaction === "resale" ? (
          <div className="mt-5">
            <ChipSelectField
              legend="Age of Construction"
              required
              bare
              options={AGE_OF_CONSTRUCTION_OPTIONS.map((option) => option.label)}
              value={
                AGE_OF_CONSTRUCTION_OPTIONS.find(
                  (option) => option.id === values.ageOfConstruction,
                )?.label ?? ""
              }
              error={errors.ageOfConstruction}
              onChange={(label) => {
                const match = AGE_OF_CONSTRUCTION_OPTIONS.find(
                  (option) => option.label === label,
                );
                onChange(
                  "ageOfConstruction",
                  (match?.id ?? "") as AgeOfConstructionId | "",
                );
              }}
            />
          </div>
        ) : null}
      </PostPropertyFieldSection>
      )}

      {builderLayout ? null : (
        <>
          <ChipSelectField
            legend="Bedrooms"
            required
            options={["1", "2", "3", "4", "5", "6", "7"]}
            value={values.bedrooms}
            error={errors.bedrooms}
            onChange={(value) => onChange("bedrooms", value)}
            moreOptions={["8", "9", "10"]}
          />

          <ChipSelectField
            legend="Balcony"
            required
            options={["0", "1", "2", "3", "4", "5", "6"]}
            value={values.balcony}
            error={errors.balcony}
            onChange={(value) => onChange("balcony", value)}
            moreOptions={["7", "8", "9", "10"]}
          />
        </>
      )}

      {hideCommon?.floors ? null : (
        <TotalFloorsFields
          values={values}
          onChange={onChange}
          errors={errors}
          showFloorNumber={!builderLayout}
        />
      )}

      {builderLayout ? null : (
        <ChipSelectField
          legend="Bathrooms"
          required
          options={["1", "2", "3", "4", "5", "6", "7"]}
          value={values.bathrooms}
          error={errors.bathrooms}
          onChange={(value) => onChange("bathrooms", value)}
        />
      )}

      {isRent ? (
        <>
          <ChipSelectField
            legend="Age of Construction"
            required
            options={AGE_OF_CONSTRUCTION_OPTIONS.map((option) => option.label)}
            value={
              AGE_OF_CONSTRUCTION_OPTIONS.find(
                (option) => option.id === values.ageOfConstruction,
              )?.label ?? ""
            }
            error={errors.ageOfConstruction}
            onChange={(label) => {
              const match = AGE_OF_CONSTRUCTION_OPTIONS.find(
                (option) => option.label === label,
              );
              onChange(
                "ageOfConstruction",
                (match?.id ?? "") as AgeOfConstructionId | "",
              );
            }}
          />

          <PostPropertyFieldSection
            title="Rental Details"
            description="Add availability and rental preferences"
          >
            <div className="space-y-4">
              <label className={POST_PROPERTY_CHECKBOX_ROW}>
                <input
                  type="checkbox"
                  checked={values.fullHouse}
                  onChange={(event) => onChange("fullHouse", event.target.checked)}
                  className={checkboxClassName}
                />
                <span className="text-sm font-semibold text-slate-800">
                  Full House
                </span>
              </label>

              <label className={POST_PROPERTY_CHECKBOX_ROW}>
                <input
                  type="checkbox"
                  checked={values.sharingBasis}
                  onChange={(event) =>
                    onChange("sharingBasis", event.target.checked)
                  }
                  className={checkboxClassName}
                />
                <span className="text-sm font-semibold text-slate-800">
                  Sharing Basis
                </span>
              </label>

              <div className={POST_PROPERTY_TWO_COLUMN_GRID}>
                <div className="min-w-0">
                  <PostPropertyInput
                    id="availableFrom"
                    label="Available From*"
                    placeholder="Available From"
                    variant="underline"
                    type="date"
                    staticLabel
                    min={getPossessionDateInputMin(values.availableFrom)}
                    value={values.availableFrom}
                    error={errors.availableFrom}
                    onChange={(value) => onChange("availableFrom", value)}
                  />
                </div>
              </div>

              <label className={POST_PROPERTY_CHECKBOX_ROW}>
                <input
                  type="checkbox"
                  checked={values.interiorModificationAllowed}
                  onChange={(event) =>
                    onChange("interiorModificationAllowed", event.target.checked)
                  }
                  className={checkboxClassName}
                />
                <span className="text-sm font-semibold text-slate-800">
                  Interior Modification Allowed
                </span>
              </label>
            </div>
          </PostPropertyFieldSection>

          <TenantPreferenceField
            value={values.tenantPreferences}
            error={errors.tenantPreferences}
            onChange={(next) => onChange("tenantPreferences", next)}
          />
        </>
      ) : null}

      {builderLayout ? null : (
        <ChipSelectField
          legend="Lift"
          options={["0", "1", "2", "3", "4", "5", "6"]}
          value={values.lift}
          onChange={(value) => onChange("lift", value)}
          moreOptions={["7", "8", "9", "10"]}
        />
      )}
    </div>
  );
}
