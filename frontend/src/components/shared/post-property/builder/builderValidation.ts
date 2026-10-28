import {
  SUB_TYPES_BY_PROPERTY_TYPE,
  type PricingOthersValues,
  type PropertyTypeId,
} from "../config/postPropertyForm.shared";
import type {
  AvailableSizeRow,
  ProjectDetailsValues,
} from "@/components/master/post-property/postPropertyProjectDetails";
import type { BuilderConfig } from "./builderConfig";

export type BuilderFieldErrors = Partial<
  Record<"projectType" | "assuredReturn" | "bhkAreas" | "availableSizes", string>
>;

export function validateBuilderProjectType(
  project: ProjectDetailsValues,
  config: BuilderConfig,
): BuilderFieldErrors {
  if (config.showProjectType && !project.projectType) {
    return { projectType: "Please select project type" };
  }
  return {};
}

export function validateBuilderPricing(
  pricing: PricingOthersValues,
  config: BuilderConfig,
): BuilderFieldErrors {
  if (!config.showAssuredReturn || !pricing.assuredReturn.trim()) {
    return {};
  }

  const percent = Number(pricing.assuredReturn);
  if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
    return { assuredReturn: "Assured return must be between 0 and 100" };
  }
  return {};
}

// Rows with nothing filled in are not sent, so they do not count as a size
export const isAvailableSizeFilled = (row: AvailableSizeRow) =>
  Boolean(row.bhk || row.size.trim() || row.price.trim());

// Every sub type needs at least one size; a row without unit type belongs to the first sub type
export function validateAvailableSizes(
  project: ProjectDetailsValues,
  propertyType: PropertyTypeId,
  subTypes: string[],
): BuilderFieldErrors {
  const missing = subTypes.flatMap((subType, index) => {
    const unitType =
      SUB_TYPES_BY_PROPERTY_TYPE[propertyType]?.find((option) => option.id === subType)?.label ?? "";
    const hasSize = project.availableSizes.some(
      (row) =>
        isAvailableSizeFilled(row) && (row.unitType === unitType || (!row.unitType && index === 0)),
    );

    return hasSize ? [] : [unitType || subType];
  });

  return missing.length > 0
    ? { availableSizes: `Please add at least one size for: ${missing.join(", ")}` }
    : {};
}
