"use client";

import ChipSelectField from "../components/ChipSelectField";
import PostPropertyFieldSection from "../components/PostPropertyFieldSection";
import PostPropertyInput from "../components/PostPropertyInput";
import {
  CheckboxRow,
  MultiChipSelectField,
} from "../step-2-property-details/PropertyDetailsParts";
import type { BuilderExtraFieldId } from "./builderConfig";
import {
  CONVERSION_STATUS_OPTIONS,
  INFRASTRUCTURE_OPTIONS,
  IRRIGATION_OPTIONS,
  STAR_CATEGORY_OPTIONS,
  type ProjectDetailsValues,
} from "@/components/master/post-property/postPropertyProjectDetails";

type OnChange = <K extends keyof ProjectDetailsValues>(
  field: K,
  value: ProjectDetailsValues[K],
) => void;

const NUMBER_FIELDS: {
  id: BuilderExtraFieldId;
  field: "distanceFromCity" | "storageCapacity" | "powerLoad" | "loadingBays" | "clearHeight";
  label: string;
}[] = [
  { id: "distanceFromCity", field: "distanceFromCity", label: "Distance from City in Km" },
  { id: "storageCapacity", field: "storageCapacity", label: "Storage Capacity in Tons" },
  { id: "loadingBays", field: "loadingBays", label: "Number of Loading Bays" },
  { id: "clearHeight", field: "clearHeight", label: "Clear Height in Feet" },
  { id: "powerLoad", field: "powerLoad", label: "Power Load in kVA" },
];

export default function BuilderExtraDetailsField({
  extras,
  values,
  onChange,
}: {
  extras: BuilderExtraFieldId[];
  values: ProjectDetailsValues;
  onChange: OnChange;
}) {
  const numberFields = NUMBER_FIELDS.filter((item) => extras.includes(item.id));

  if (extras.length === 0) {
    return null;
  }

  return (
    <>
      {numberFields.length > 0 ? (
        <PostPropertyFieldSection
          title="Additional Project Details"
          description="Add the details that apply to this project"
        >
          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
            {numberFields.map((item) => (
              <PostPropertyInput
                key={item.id}
                id={item.field}
                label={item.label}
                type="number"
                variant="underline"
                staticLabel
                value={values[item.field]}
                onChange={(value) => onChange(item.field, value)}
              />
            ))}
          </div>
        </PostPropertyFieldSection>
      ) : null}

      {extras.includes("starCategory") ? (
        <ChipSelectField
          legend="Star Category"
          options={STAR_CATEGORY_OPTIONS}
          value={values.starCategory}
          onChange={(value) => onChange("starCategory", value)}
        />
      ) : null}

      {extras.includes("conversionStatus") ? (
        <ChipSelectField
          legend="Conversion Status"
          options={CONVERSION_STATUS_OPTIONS}
          value={values.conversionStatus}
          onChange={(value) => onChange("conversionStatus", value)}
        />
      ) : null}

      {extras.includes("infrastructure") ? (
        <MultiChipSelectField
          legend="Infrastructure Provided"
          options={INFRASTRUCTURE_OPTIONS}
          value={values.infrastructure}
          onChange={(next) => onChange("infrastructure", next)}
        />
      ) : null}

      {extras.includes("irrigationSources") ? (
        <MultiChipSelectField
          legend="Irrigation / Water Source"
          options={IRRIGATION_OPTIONS}
          value={values.irrigationSources}
          onChange={(next) => onChange("irrigationSources", next)}
        />
      ) : null}

      {extras.includes("naConversionDone") ? (
        <CheckboxRow
          label="NA / Land Conversion Done"
          checked={values.naConversionDone}
          onChange={(checked) => onChange("naConversionDone", checked)}
        />
      ) : null}
    </>
  );
}
