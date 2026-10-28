import {
  EMPTY_BHK_AREA_DETAILS,
  type AvailableSizeRow,
  type BhkAreaDetails,
  type ProjectDetailsValues,
} from "@/components/master/post-property/postPropertyProjectDetails";
import {
  SUB_TYPES_BY_PROPERTY_TYPE,
  type PropertyTypeId,
} from "../config/postPropertyForm.shared";
import { getBuilderConfig } from "./builderConfig";

export type BhkAreaTab = { key: string; bhk: string };

export type BhkAreaFieldErrors = Partial<Record<keyof BhkAreaDetails, string>>;

export type BhkAreaErrors = Record<string, BhkAreaFieldErrors>;

export const getVariantLabel = (row: Pick<AvailableSizeRow, "bhk" | "unitType">) =>
  [row.bhk, row.unitType].filter(Boolean).join(" ");

// One tab per BHK picked in Available Sizes for this sub type
export function getBhkAreaTabs(
  project: ProjectDetailsValues,
  propertyType: PropertyTypeId,
  subType: string,
): BhkAreaTab[] {
  if (propertyType !== "residential" || !getBuilderConfig(propertyType, subType).showBhk) {
    return [];
  }

  const unitType =
    SUB_TYPES_BY_PROPERTY_TYPE[propertyType]?.find((option) => option.id === subType)?.label ?? "";
  const tabs = new Map<string, BhkAreaTab>();

  for (const row of project.availableSizes) {
    if (!row.bhk || (row.unitType && row.unitType !== unitType)) {
      continue;
    }
    tabs.set(getVariantLabel(row), { key: getVariantLabel(row), bhk: row.bhk });
  }

  return [...tabs.values()];
}

const isPositive = (value: string) => Number(value) > 0;

function validateRange(
  min: string,
  max: string,
  label: string,
  fields: { min: keyof BhkAreaDetails; max: keyof BhkAreaDetails },
  errors: BhkAreaFieldErrors,
) {
  if (!min.trim()) {
    errors[fields.min] = `Please enter ${label}`;
  } else if (!isPositive(min)) {
    errors[fields.min] = `Please enter a valid ${label}`;
  }

  if (!max.trim()) {
    return;
  }

  if (!isPositive(max)) {
    errors[fields.max] = `Please enter a valid ${label} max`;
  } else if (isPositive(min) && Number(max) < Number(min)) {
    errors[fields.max] = "Max cannot be less than min";
  }
}

export function validateBhkAreaTab(details: BhkAreaDetails): BhkAreaFieldErrors {
  const errors: BhkAreaFieldErrors = {};

  validateRange(details.carpetAreaMin, details.carpetAreaMax, "carpet area", {
    min: "carpetAreaMin",
    max: "carpetAreaMax",
  }, errors);
  if (!details.carpetAreaType) {
    errors.carpetAreaType = "Please select carpet area type";
  }

  validateRange(details.superBuildUpMin, details.superBuildUpMax, "super built-up area", {
    min: "superBuildUpMin",
    max: "superBuildUpMax",
  }, errors);
  if (!details.superBuildUpType) {
    errors.superBuildUpType = "Please select super build up type";
  }

  return errors;
}

// Only tabs that still have a problem are returned
export function validateBhkAreaDetails(
  project: ProjectDetailsValues,
  tabs: BhkAreaTab[],
): BhkAreaErrors {
  return Object.fromEntries(
    tabs.flatMap(({ key }) => {
      const errors = validateBhkAreaTab(project.bhkAreaDetails[key] ?? EMPTY_BHK_AREA_DETAILS);
      return Object.keys(errors).length > 0 ? [[key, errors]] : [];
    }),
  );
}

// Sub types whose BHK area tabs are incomplete
export function getBhkAreaErrorSubTypes(
  project: ProjectDetailsValues,
  propertyType: PropertyTypeId,
  subTypes: string[],
): string[] {
  return subTypes.filter(
    (subType) =>
      Object.keys(
        validateBhkAreaDetails(project, getBhkAreaTabs(project, propertyType, subType)),
      ).length > 0,
  );
}
