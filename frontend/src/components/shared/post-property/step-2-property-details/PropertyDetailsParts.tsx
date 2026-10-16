import type { ReactNode } from "react";
import ChipSelectField from "../ChipSelectField";
import PostPropertyFieldSection from "../PostPropertyFieldSection";
import PostPropertyInput from "../PostPropertyInput";
import type { SaleDetailsConfig } from "../postPropertySaleConfig";
import {
  AGE_OF_CONSTRUCTION_OPTIONS,
  AREA_TYPE_OPTIONS,
  CONSTRUCTION_STATUS_OPTIONS,
  LAND_AREA_TYPE_OPTIONS,
  getCurrentMonthValue,
  PROPERTY_TRANSACTION_OPTIONS,
  getFloorNumberOptionGroups,
  getPossessionDateInputMin,
  numberOptions,
  type AgeOfConstructionId,
  type AreaTypeId,
  type ConstructionStatusId,
  type PropertyDetailsFieldErrors,
  type PropertyDetailsValues,
} from "../postPropertyForm.shared";
import {
  POST_PROPERTY_CHECKBOX_ROW,
  postPropertyChipClass,
} from "../postPropertyForm.styles";

export type PropertyDetailsPartProps = {
  values: PropertyDetailsValues;
  onChange: <K extends keyof PropertyDetailsValues>(
    field: K,
    value: PropertyDetailsValues[K],
  ) => void;
  errors: PropertyDetailsFieldErrors;
};

export const areaTypeDropdownOptions = [
  { value: "", label: "Select unit" },
  ...AREA_TYPE_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
  })),
];

export const dropdownMenuClassName =
  "absolute left-0 z-50 mt-1 max-h-60 w-full min-w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg shadow-slate-900/10";

const checkboxClassName =
  "h-4.5 w-4.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500";

export function CheckboxRow({
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

export function MultiChipSelectField({
  legend,
  required = false,
  options,
  value,
  onChange,
  error,
}: {
  legend: string;
  required?: boolean;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
}) {
  return (
    <PostPropertyFieldSection title={legend} required={required}>
      <div className="flex flex-wrap gap-2.5">
        {options.map((option) => {
          const isSelected = value.includes(option);

          return (
            <button
              key={option}
              type="button"
              aria-pressed={isSelected}
              onClick={() =>
                onChange(
                  isSelected
                    ? value.filter((item) => item !== option)
                    : [...value, option],
                )
              }
              className={`${postPropertyChipClass(isSelected)} min-w-11 px-3.5 py-2.5 text-sm sm:min-w-12 sm:px-4`}
            >
              {option}
            </button>
          );
        })}
      </div>
      {error ? (
        <p className="mt-2 text-sm text-red-500" role="alert">
          {error}
        </p>
      ) : null}
    </PostPropertyFieldSection>
  );
}

function AreaTypeSelect({
  id,
  label,
  value,
  error,
  options = areaTypeDropdownOptions,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  options?: { value: string; label: string }[];
  onChange: (value: AreaTypeId | "") => void;
}) {
  return (
    <PostPropertyInput
      id={id}
      label={label}
      variant="underline"
      staticLabel
      options={options}
      value={value}
      error={error}
      onChange={(next) => onChange(next as AreaTypeId | "")}
      dropdownMenuClassName={dropdownMenuClassName}
    />
  );
}

export const landAreaTypeDropdownOptions = [
  { value: "", label: "Select unit" },
  ...LAND_AREA_TYPE_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
  })),
];

// Plot area / length / breadth and terrace area rows shown inside Area Details
export function AreaExtraFields({
  values,
  onChange,
  errors,
  cfg,
}: PropertyDetailsPartProps & { cfg: SaleDetailsConfig }) {
  const plotStar = cfg.plotArea === "required" ? "*" : "";

  return (
    <>
      {cfg.plotArea !== "hidden" ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
            <PostPropertyInput
              id="plotAreaNumber"
              label={`Plot Area Number${plotStar}`}
              placeholder="Enter plot area"
              variant="underline"
              type="number"
              staticLabel
              value={values.plotAreaNumber}
              error={errors.plotAreaNumber}
              onChange={(value) => onChange("plotAreaNumber", value)}
            />
            <AreaTypeSelect
              id="plotAreaType"
              label={`Plot Area Type${plotStar}`}
              value={values.plotAreaType}
              error={errors.plotAreaType}
              onChange={(value) => onChange("plotAreaType", value)}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
            <PostPropertyInput
              id="plotLengthNumber"
              label="Plot Length Number"
              placeholder="Enter plot length"
              variant="underline"
              type="number"
              staticLabel
              value={values.plotLengthNumber}
              onChange={(value) => onChange("plotLengthNumber", value)}
            />
            <AreaTypeSelect
              id="plotLengthType"
              label="Plot Length Type"
              value={values.plotLengthType}
              onChange={(value) => onChange("plotLengthType", value)}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
            <PostPropertyInput
              id="plotBreadthNumber"
              label="Plot Breadth Number"
              placeholder="Enter plot breadth"
              variant="underline"
              type="number"
              staticLabel
              value={values.plotBreadthNumber}
              onChange={(value) => onChange("plotBreadthNumber", value)}
            />
            <AreaTypeSelect
              id="plotBreadthType"
              label="Plot Breadth Type"
              value={values.plotBreadthType}
              onChange={(value) => onChange("plotBreadthType", value)}
            />
          </div>
        </>
      ) : null}

      {cfg.terraceArea ? (
        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          <PostPropertyInput
            id="terraceAreaNumber"
            label="Terrace Area*"
            placeholder="Enter terrace area"
            variant="underline"
            type="number"
            staticLabel
            value={values.terraceAreaNumber}
            error={errors.terraceAreaNumber}
            onChange={(value) => onChange("terraceAreaNumber", value)}
          />
          <AreaTypeSelect
            id="terraceAreaType"
            label="Terrace Area Type*"
            value={values.terraceAreaType}
            error={errors.terraceAreaType}
            onChange={(value) => onChange("terraceAreaType", value)}
          />
        </div>
      ) : null}
    </>
  );
}

export function AreaDetailsSection({
  values,
  onChange,
  errors,
  allOptional = false,
  children,
}: PropertyDetailsPartProps & {
  allOptional?: boolean;
  children?: ReactNode;
}) {
  const star = allOptional ? "" : "*";

  return (
    <PostPropertyFieldSection
      title="Area Details"
      description="Enter carpet area and super build-up measurements"
    >
      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          <PostPropertyInput
            id="carpetAreaNumber"
            label={`Carpet Area Number${star}`}
            placeholder="Enter carpet area"
            variant="underline"
            type="number"
            staticLabel
            value={values.carpetAreaNumber}
            error={errors.carpetAreaNumber}
            onChange={(value) => onChange("carpetAreaNumber", value)}
          />
          <PostPropertyInput
            id="carpetAreaType"
            label={`Carpet Area Type${star}`}
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

        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          <PostPropertyInput
            id="superBuildUpNumber"
            label={`Super Build up Number${star}`}
            placeholder="Enter super build up area"
            variant="underline"
            staticLabel
            value={values.superBuildUpNumber}
            type="number"
            error={errors.superBuildUpNumber}
            onChange={(value) => onChange("superBuildUpNumber", value)}
          />
          <PostPropertyInput
            id="superBuildUpType"
            label={`Super Build up Type${star}`}
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
        {children}
      </div>
    </PostPropertyFieldSection>
  );
}

// Construction status, age and possession date shown without a transaction choice
export function ConstructionAlwaysSections({
  values,
  onChange,
  errors,
}: PropertyDetailsPartProps) {
  return (
    <>
      <PostPropertyFieldSection
        title="Construction Status"
        description="Select construction details"
      >
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
        <div className="mt-5">
          <AgeOfConstructionChips
            values={values}
            onChange={onChange}
            errors={errors}
            bare
          />
        </div>
      </PostPropertyFieldSection>

      <PostPropertyFieldSection title="Possession Date" required>
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
      </PostPropertyFieldSection>
    </>
  );
}

export function TransactionConstructionSections({
  values,
  onChange,
  errors,
}: PropertyDetailsPartProps) {
  return (
    <>
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
          <div className="mt-5">
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
          </div>
        ) : null}

        {values.propertyTransaction === "resale" ? (
          <div className="mt-5">
            <AgeOfConstructionChips
              values={values}
              onChange={onChange}
              errors={errors}
              bare
            />
          </div>
        ) : null}
      </PostPropertyFieldSection>

      {values.propertyTransaction === "new" ? (
        <PostPropertyFieldSection title="Possession Date" required>
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
        </PostPropertyFieldSection>
      ) : null}
    </>
  );
}

export function AgeOfConstructionChips({
  values,
  onChange,
  errors,
  bare = false,
}: PropertyDetailsPartProps & { bare?: boolean }) {
  return (
    <ChipSelectField
      legend="Age of Construction"
      required
      bare={bare}
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
  );
}

export function TotalFloorsFields({
  values,
  onChange,
  errors,
  showFloorNumber = true,
}: PropertyDetailsPartProps & { showFloorNumber?: boolean }) {
  const { options: floorNumberOptions, moreOptions: floorNumberMoreOptions } =
    getFloorNumberOptionGroups(values.totalFloors);

  return (
    <>
      <ChipSelectField
        legend="Total Floors"
        required
        options={numberOptions(1, 7)}
        value={values.totalFloors}
        error={errors.totalFloors}
        onChange={(value) => onChange("totalFloors", value)}
        moreOptions={numberOptions(8, 100)}
      />

      {showFloorNumber && floorNumberOptions.length > 0 ? (
        <ChipSelectField
          legend="Floor number"
          required
          options={floorNumberOptions}
          value={values.floorNumber}
          error={errors.floorNumber}
          onChange={(value) => onChange("floorNumber", value)}
          moreOptions={floorNumberMoreOptions}
        />
      ) : null}
    </>
  );
}

export function EntranceAvailableRow({
  values,
  onChange,
  errors,
  availableRequired = false,
  showEntrance = true,
}: PropertyDetailsPartProps & {
  availableRequired?: boolean;
  showEntrance?: boolean;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-6">
      {showEntrance ? (
        <PostPropertyInput
          id="entranceWidth"
          label="Entrance in Meter"
          placeholder="Entrance in Meter"
          variant="underline"
          type="number"
          staticLabel
          value={values.entranceWidth}
          onChange={(value) => onChange("entranceWidth", value)}
        />
      ) : null}
      <PostPropertyInput
        id="availableFrom"
        label={`Available From${availableRequired ? "*" : ""}`}
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
  );
}

export function LeasedOutFields({
  values,
  onChange,
  errors,
  leaseRequired = false,
  mustAnswer = false,
  futureOnly = false,
}: PropertyDetailsPartProps & {
  leaseRequired?: boolean;
  mustAnswer?: boolean;
  futureOnly?: boolean;
}) {
  return (
    <div className="space-y-4">
      {mustAnswer ? (
        <ChipSelectField
          legend="Currently Leased Out"
          required
          options={["Yes", "No"]}
          value={
            values.leasedOutAnswered
              ? values.currentlyLeasedOut
                ? "Yes"
                : "No"
              : ""
          }
          error={errors.currentlyLeasedOut}
          onChange={(label) => {
            const isLeased = label === "Yes";
            onChange("leasedOutAnswered", true);
            onChange("currentlyLeasedOut", isLeased);
            if (!isLeased) {
              onChange("leaseContractTill", "");
            }
          }}
        />
      ) : (
        <CheckboxRow
          label="Currently Leased Out"
          checked={values.currentlyLeasedOut}
          onChange={(checked) => {
            onChange("currentlyLeasedOut", checked);
            if (!checked) {
              onChange("leaseContractTill", "");
            }
          }}
        />
      )}

      {values.currentlyLeasedOut ? (
        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          <PostPropertyInput
            id="leaseContractTill"
            label={`Lease Contract Till (Month - Year)${leaseRequired ? "*" : ""}`}
            placeholder="Lease Contract Till"
            variant="underline"
            type="month"
            staticLabel
            min={futureOnly ? getCurrentMonthValue() : undefined}
            value={values.leaseContractTill}
            error={errors.leaseContractTill}
            onChange={(value) => onChange("leaseContractTill", value)}
          />
        </div>
      ) : null}
    </div>
  );
}

export function ManagedByField({
  values,
  onChange,
}: Pick<PropertyDetailsPartProps, "values" | "onChange">) {
  return (
    <ChipSelectField
      legend="Managed By"
      options={["Landlord", "Professional", "Care Taker"]}
      value={values.managedBy}
      onChange={(value) => onChange("managedBy", value)}
    />
  );
}
