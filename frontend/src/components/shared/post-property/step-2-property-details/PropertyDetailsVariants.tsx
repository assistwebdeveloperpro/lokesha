import ChipSelectField from "../ChipSelectField";
import ExpandableIconTileSelect from "../ExpandableIconTileSelect";
import PostPropertyFieldSection from "../PostPropertyFieldSection";
import PostPropertyInput from "../PostPropertyInput";
import TenantPreferenceField from "./TenantPreferenceField";
import type { ReactNode } from "react";
import type { SaleDetailsConfig } from "../postPropertySaleConfig";
import {
  AgeOfConstructionChips,
  AreaDetailsSection,
  AreaExtraFields,
  CheckboxRow,
  ConstructionAlwaysSections,
  EntranceAvailableRow,
  landAreaTypeDropdownOptions,
  LeasedOutFields,
  ManagedByField,
  MultiChipSelectField,
  TotalFloorsFields,
  TransactionConstructionSections,
  areaTypeDropdownOptions,
  dropdownMenuClassName,
  type PropertyDetailsPartProps,
} from "./PropertyDetailsParts";
import {
  ENTRY_TILL_OPTIONS,
  FOOD_OPTIONS,
  OCCUPANCY_OPTIONS,
  PG_GENDER_OPTIONS,
  PG_OPERATION_YEAR_OPTIONS,
  PG_PRESENT_IN_OPTIONS,
  PG_RULE_OPTIONS,
  PENTHOUSE_TYPE_OPTIONS,
  PG_TENANT_PREFERENCE_OPTIONS,
  PROPERTY_TRANSACTION_OPTIONS,
  TERRACE_ENTRY_OPTIONS,
  numberOptions,
  type AreaTypeId,
} from "../postPropertyForm.shared";

export function CommercialDetails({
  isRent,
  ...part
}: PropertyDetailsPartProps & { isRent: boolean }) {
  const { values, onChange } = part;

  return (
    <div className="space-y-5 sm:space-y-6">
      <AreaDetailsSection {...part} />

      {isRent ? (
        <AgeOfConstructionChips {...part} />
      ) : (
        <TransactionConstructionSections {...part} />
      )}

      <ChipSelectField
        legend="Cabin"
        options={numberOptions(1, 7)}
        value={values.cabins}
        onChange={(value) => onChange("cabins", value)}
        moreOptions={numberOptions(8, 10)}
      />

      <TotalFloorsFields {...part} />

      <EntranceAvailableRow {...part} />

      <LeasedOutFields {...part} leaseRequired />
    </div>
  );
}

export function PgDetails(part: PropertyDetailsPartProps) {
  const { values, onChange, errors } = part;

  return (
    <div className="space-y-5 sm:space-y-6">
      <AreaDetailsSection {...part} allOptional />

      <ChipSelectField
        legend="Bedrooms"
        required
        options={numberOptions(1, 7)}
        value={values.bedrooms}
        error={errors.bedrooms}
        onChange={(value) => onChange("bedrooms", value)}
        moreOptions={numberOptions(8, 10)}
      />

      <ChipSelectField
        legend="Balcony"
        required
        options={numberOptions(0, 6)}
        value={values.balcony}
        error={errors.balcony}
        onChange={(value) => onChange("balcony", value)}
        moreOptions={numberOptions(7, 10)}
      />

      <TotalFloorsFields {...part} />

      <ChipSelectField
        legend="Bathrooms"
        required
        options={numberOptions(1, 7)}
        value={values.bathrooms}
        error={errors.bathrooms}
        onChange={(value) => onChange("bathrooms", value)}
      />

      <AgeOfConstructionChips {...part} />

      <PostPropertyFieldSection
        title="PG Details"
        description="Add availability and PG information"
      >
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
            <PostPropertyInput
              id="availableFrom"
              label="Available From*"
              placeholder="Available From"
              variant="underline"
              type="date"
              staticLabel
              value={values.availableFrom}
              error={errors.availableFrom}
              onChange={(value) => onChange("availableFrom", value)}
            />
            <PostPropertyInput
              id="pgOperationSince"
              label="PG Operation Since (Month - Year)"
              variant="underline"
              staticLabel
              options={PG_OPERATION_YEAR_OPTIONS}
              value={values.pgOperationSince}
              onChange={(value) => onChange("pgOperationSince", value)}
              dropdownMenuClassName={dropdownMenuClassName}
            />
            <PostPropertyInput
              id="pgName"
              label="Name of PG*"
              placeholder="Name of PG"
              variant="underline"
              staticLabel
              value={values.pgName}
              error={errors.pgName}
              onChange={(value) => onChange("pgName", value)}
            />
            <PostPropertyInput
              id="entryTill"
              label="Entry Till"
              variant="underline"
              staticLabel
              options={ENTRY_TILL_OPTIONS}
              value={values.entryTill}
              onChange={(value) => onChange("entryTill", value)}
              dropdownMenuClassName={dropdownMenuClassName}
            />
          </div>

          <CheckboxRow
            label="Interior Modification Allowed"
            checked={values.interiorModificationAllowed}
            onChange={(checked) =>
              onChange("interiorModificationAllowed", checked)
            }
          />
        </div>
      </PostPropertyFieldSection>

      <TenantPreferenceField
        value={values.tenantPreferences}
        error={errors.tenantPreferences}
        onChange={(next) => onChange("tenantPreferences", next)}
        imageOptions={PG_TENANT_PREFERENCE_OPTIONS}
      />

      <ChipSelectField
        legend="PG Present in"
        options={PG_PRESENT_IN_OPTIONS}
        value={values.pgPresentIn}
        onChange={(value) => onChange("pgPresentIn", value)}
      />

      <MultiChipSelectField
        legend="Occupancies"
        required
        options={OCCUPANCY_OPTIONS}
        value={values.occupancies}
        error={errors.occupancies}
        onChange={(next) => onChange("occupancies", next)}
      />

      <ChipSelectField
        legend="Gender"
        required
        options={PG_GENDER_OPTIONS}
        value={values.pgGender}
        error={errors.pgGender}
        onChange={(value) => onChange("pgGender", value)}
      />

      <ExpandableIconTileSelect
        legend="PG Rules"
        options={PG_RULE_OPTIONS}
        value={values.pgRules}
        onChange={(next) => onChange("pgRules", next)}
        visibleCount={PG_RULE_OPTIONS.length}
      />

      <ExpandableIconTileSelect
        legend="Food"
        options={FOOD_OPTIONS}
        value={values.foods}
        onChange={(next) => onChange("foods", next)}
        visibleCount={FOOD_OPTIONS.length}
      />

      <ManagedByField {...part} />
    </div>
  );
}

function PlotLandAreaSection({
  values,
  onChange,
  errors,
  required,
  landUnits = false,
  showRoadWidth = required,
}: PropertyDetailsPartProps & {
  required: boolean;
  landUnits?: boolean;
  showRoadWidth?: boolean;
}) {
  const star = required ? "*" : "";
  const unitField = (
    id: "carpetAreaType" | "plotLengthType" | "plotBreadthType",
    label: string,
    isRequired = false,
  ) => (
    <PostPropertyInput
      id={id}
      label={`${label}${isRequired ? "*" : ""}`}
      variant="underline"
      staticLabel
      options={
        landUnits && id === "carpetAreaType"
          ? landAreaTypeDropdownOptions
          : areaTypeDropdownOptions
      }
      value={values[id]}
      error={errors[id as "carpetAreaType"]}
      onChange={(value) => onChange(id, value as AreaTypeId | "")}
      dropdownMenuClassName={dropdownMenuClassName}
    />
  );

  return (
    <PostPropertyFieldSection
      title="Area Details"
      description="Enter plot area and dimensions"
    >
      <div className="grid gap-4 md:grid-cols-2 md:gap-6">
        <PostPropertyInput
          id="carpetAreaNumber"
          label={`Plot Area Number${star}`}
          placeholder="Plot Area Number"
          variant="underline"
          type="number"
          staticLabel
          value={values.carpetAreaNumber}
          error={errors.carpetAreaNumber}
          onChange={(value) => onChange("carpetAreaNumber", value)}
        />
        {unitField("carpetAreaType", "Plot Area Type", required)}
        <PostPropertyInput
          id="plotLengthNumber"
          label="Plot Length Number"
          placeholder="Plot Length Number"
          variant="underline"
          type="number"
          staticLabel
          value={values.plotLengthNumber}
          onChange={(value) => onChange("plotLengthNumber", value)}
        />
        {unitField("plotLengthType", "Plot Length Type")}
        <PostPropertyInput
          id="plotBreadthNumber"
          label="Plot Breadth Number"
          placeholder="Plot Breadth Number"
          variant="underline"
          type="number"
          staticLabel
          value={values.plotBreadthNumber}
          onChange={(value) => onChange("plotBreadthNumber", value)}
        />
        {unitField("plotBreadthType", "Plot Breadth Type")}
        {showRoadWidth ? (
          <PostPropertyInput
            id="roadWidth"
            label="Width of Road Facing Plot in Meters"
            placeholder="Width of Road Facing Plot in Meters"
            variant="underline"
            type="number"
            staticLabel
            value={values.roadWidth}
            onChange={(value) => onChange("roadWidth", value)}
          />
        ) : null}
      </div>
    </PostPropertyFieldSection>
  );
}

function PlotLandCheckboxes({ values, onChange }: PropertyDetailsPartProps) {
  return (
    <div className="space-y-4">
      <CheckboxRow
        label="Any Construction"
        checked={values.anyConstruction}
        onChange={(checked) => onChange("anyConstruction", checked)}
      />
      <CheckboxRow
        label="Boundary Wall Made"
        checked={values.boundaryWallMade}
        onChange={(checked) => onChange("boundaryWallMade", checked)}
      />
      <CheckboxRow
        label="Corner Plot"
        checked={values.cornerPlot}
        onChange={(checked) => onChange("cornerPlot", checked)}
      />
    </div>
  );
}

export function TransactionChips({
  values,
  onChange,
  errors,
  required,
}: PropertyDetailsPartProps & { required: boolean }) {
  return (
    <ChipSelectField
      legend="Property Transaction"
      required={required}
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
  );
}

export function PlotDetails(part: PropertyDetailsPartProps) {
  return (
    <div className="space-y-5 sm:space-y-6">
      <PlotLandAreaSection {...part} required />
      <PlotLandCheckboxes {...part} />
      <EntranceAvailableRow {...part} availableRequired />
      <ManagedByField {...part} />
      <TransactionChips {...part} required />
    </div>
  );
}

export function LandDetails(part: PropertyDetailsPartProps) {
  const { values, onChange } = part;

  return (
    <div className="space-y-5 sm:space-y-6">
      <PlotLandAreaSection {...part} required={false} />

      <TransactionChips {...part} required={false} />

      <ChipSelectField
        legend="Floor Allowed for Construction"
        options={numberOptions(1, 7)}
        value={values.floorsAllowed}
        onChange={(value) => onChange("floorsAllowed", value)}
        moreOptions={numberOptions(8, 50)}
      />

      <PostPropertyFieldSection title="Road Width">
        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          <PostPropertyInput
            id="roadWidth"
            label="Width of Road Facing Plot in Meters"
            placeholder="Width of Road Facing Plot in Meters"
            variant="underline"
            type="number"
            staticLabel
            value={values.roadWidth}
            onChange={(value) => onChange("roadWidth", value)}
          />
        </div>
      </PostPropertyFieldSection>

      <PlotLandCheckboxes {...part} />
      <EntranceAvailableRow {...part} />
      <ManagedByField {...part} />
      <LeasedOutFields {...part} />
    </div>
  );
}

// Sale form driven by the per sub type config (see postPropertySaleConfig)
export function SaleDetails({
  cfg,
  areaSlot,
  afterAreaSlot,
  ...part
}: PropertyDetailsPartProps & {
  cfg: SaleDetailsConfig;
  areaSlot?: ReactNode;
  afterAreaSlot?: ReactNode;
}) {
  const { values, onChange, errors } = part;

  const levelChips = (
    level: SaleDetailsConfig["bedrooms"],
    legend: string,
    field: "bedrooms" | "balcony" | "bathrooms",
    options: string[],
    moreOptions?: string[],
  ) =>
    level === "hidden" ? null : (
      <ChipSelectField
        legend={legend}
        required={level === "required"}
        options={options}
        value={values[field]}
        error={errors[field]}
        onChange={(value) => onChange(field, value)}
        moreOptions={moreOptions}
      />
    );

  return (
    <div className="space-y-5 sm:space-y-6">
      {cfg.area === "plot-only" ? (
        <PlotLandAreaSection
          {...part}
          required={cfg.plotArea === "required"}
          landUnits={cfg.landUnits}
          showRoadWidth={cfg.roadWidth === "area"}
        />
      ) : (
        (areaSlot ?? (
          <AreaDetailsSection {...part}>
            <AreaExtraFields {...part} cfg={cfg} />
          </AreaDetailsSection>
        ))
      )}

      {afterAreaSlot}

      {cfg.transaction === "full" ? (
        <TransactionConstructionSections {...part} />
      ) : null}
      {cfg.transaction === "chips" ? (
        <TransactionChips {...part} required={cfg.transactionRequired} />
      ) : null}
      {cfg.constructionAlways ? <ConstructionAlwaysSections {...part} /> : null}
      {cfg.ageOfConstruction ? <AgeOfConstructionChips {...part} /> : null}

      {levelChips(cfg.bedrooms, "Bedrooms", "bedrooms", numberOptions(1, 7), numberOptions(8, 10))}
      {levelChips(cfg.balcony, "Balcony", "balcony", numberOptions(0, 6), numberOptions(7, 10))}

      {cfg.totalFloors ? (
        <TotalFloorsFields {...part} showFloorNumber={cfg.floorNumber} />
      ) : null}

      {levelChips(cfg.bathrooms, "Bathrooms", "bathrooms", numberOptions(1, 7))}

      {cfg.lift ? (
        <ChipSelectField
          legend="Lift"
          options={numberOptions(0, 6)}
          value={values.lift}
          onChange={(value) => onChange("lift", value)}
          moreOptions={numberOptions(7, 10)}
        />
      ) : null}

      {cfg.cabin ? (
        <ChipSelectField
          legend="Cabin"
          options={numberOptions(1, 7)}
          value={values.cabins}
          onChange={(value) => onChange("cabins", value)}
          moreOptions={numberOptions(8, 10)}
        />
      ) : null}

      {cfg.floorsAllowed !== "hidden" ? (
        <ChipSelectField
          legend="Floor Allowed for Construction"
          required={cfg.floorsAllowed === "required"}
          options={numberOptions(0, 7)}
          value={values.floorsAllowed}
          error={errors.floorsAllowed}
          onChange={(value) => onChange("floorsAllowed", value)}
          moreOptions={numberOptions(8, 50)}
        />
      ) : null}

      {cfg.roadWidth === "section" ? (
        <PostPropertyFieldSection title="Road Width">
          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
            <PostPropertyInput
              id="roadWidth"
              label="Width of Road Facing Plot in Meters"
              placeholder="Width of Road Facing Plot in Meters"
              variant="underline"
              type="number"
              staticLabel
              value={values.roadWidth}
              onChange={(value) => onChange("roadWidth", value)}
            />
          </div>
        </PostPropertyFieldSection>
      ) : null}

      {cfg.penthouse ? (
        <>
          <ChipSelectField
            legend="Type of Penthouse"
            required
            options={PENTHOUSE_TYPE_OPTIONS}
            value={values.penthouseType}
            error={errors.penthouseType}
            onChange={(value) => onChange("penthouseType", value)}
          />
          <MultiChipSelectField
            legend="Terrace Entry"
            options={TERRACE_ENTRY_OPTIONS}
            value={values.terraceEntry}
            onChange={(next) => onChange("terraceEntry", next)}
          />
        </>
      ) : null}

      {cfg.plotChecks ? <PlotLandCheckboxes {...part} /> : null}

      {cfg.rentalSection ? (
        <>
          <PostPropertyFieldSection
            title="Rental Details"
            description="Add availability and rental preferences"
          >
            <div className="space-y-4">
              <CheckboxRow
                label="Full House"
                checked={values.fullHouse}
                onChange={(checked) => onChange("fullHouse", checked)}
              />
              <CheckboxRow
                label="Sharing Basis"
                checked={values.sharingBasis}
                onChange={(checked) => onChange("sharingBasis", checked)}
              />
              <EntranceAvailableRow
                {...part}
                bare
                showEntrance={false}
                availableRequired
              />
              <CheckboxRow
                label="Interior Modification Allowed"
                checked={values.interiorModificationAllowed}
                onChange={(checked) =>
                  onChange("interiorModificationAllowed", checked)
                }
              />
            </div>
          </PostPropertyFieldSection>

          <TenantPreferenceField
            value={values.tenantPreferences}
            error={errors.tenantPreferences}
            onChange={(next) => onChange("tenantPreferences", next)}
          />
        </>
      ) : null}

      {!cfg.rentalSection && (cfg.entrance || cfg.availableFrom !== "hidden") ? (
        <EntranceAvailableRow
          {...part}
          showEntrance={cfg.entrance}
          availableRequired={cfg.availableFrom === "required"}
        />
      ) : null}

      {cfg.managedBy ? <ManagedByField {...part} /> : null}

      {cfg.leasedOut !== "hidden" ? (
        <LeasedOutFields
          {...part}
          leaseRequired={cfg.leaseContractRequired}
          mustAnswer={cfg.leasedOut === "must-answer"}
          futureOnly
        />
      ) : null}

      {cfg.food ? (
        <ExpandableIconTileSelect
          legend="Food"
          options={FOOD_OPTIONS}
          value={values.foods}
          onChange={(next) => onChange("foods", next)}
          visibleCount={FOOD_OPTIONS.length}
        />
      ) : null}
    </div>
  );
}
