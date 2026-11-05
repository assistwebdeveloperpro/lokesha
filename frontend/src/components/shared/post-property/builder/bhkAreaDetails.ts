import {
  EMPTY_BHK_AREA_DETAILS,
  getAvailableSizeLabel,
  getVariantLabel,
  type AvailableSizeRow,
  type BhkAreaDetails,
  type BhkCarParking,
  type BhkCharges,
  type ProjectDetailsValues,
} from "@/components/master/post-property/postPropertyProjectDetails";
import {
  SUB_TYPES_BY_PROPERTY_TYPE,
  type PropertyTypeId,
} from "../config/postPropertyForm.shared";

export {
  getAvailableSizeLabel,
  getAvailableSizeLabels,
  getVariantBaseLabel,
  getVariantLabel,
} from "@/components/master/post-property/postPropertyProjectDetails";
import { getBuilderConfig } from "./builderConfig";

export type BhkAreaTab = { key: string; bhk: string; label: string };

export type BhkAreaFieldErrors = Partial<Record<keyof BhkAreaDetails, string>>;

export type BhkAreaErrors = Record<string, BhkAreaFieldErrors>;

const isAvailableSizeLabelRow = (row: AvailableSizeRow) => Boolean(row.bhk || row.unitType);

export function getBhkAreaTabKey(row: AvailableSizeRow, rows: AvailableSizeRow[]): string {
  const eligible = rows.filter(isAvailableSizeLabelRow);
  return getAvailableSizeLabel(row, eligible);
}

// Short tab title; adds size (or an index) when the same BHK is listed more than once
export function getBhkAreaTabDisplayLabel(
  row: AvailableSizeRow,
  rows: AvailableSizeRow[],
): string {
  const eligible = rows.filter(isAvailableSizeLabelRow);
  const base = getVariantLabel(row);
  const sameBase = eligible.filter((item) => getVariantLabel(item) === base);

  if (sameBase.length <= 1) {
    return row.bhk;
  }

  const size = row.size.trim();
  if (size) {
    const unit = row.sizeUnit.trim();
    return unit ? `${row.bhk} (${size} ${unit})` : `${row.bhk} (${size})`;
  }

  const index = sameBase.findIndex((item) => item.id === row.id);
  return `${row.bhk} (${index + 1})`;
}

export function lookupBhkAreaDetails(
  map: Record<string, BhkAreaDetails>,
  row: AvailableSizeRow,
  rows: AvailableSizeRow[],
): BhkAreaDetails | undefined {
  return map[getBhkAreaTabKey(row, rows)] ?? map[getVariantLabel(row)];
}

export function lookupBhkCharges(
  map: Record<string, BhkCharges>,
  row: AvailableSizeRow,
  rows: AvailableSizeRow[],
): BhkCharges | undefined {
  return map[getBhkAreaTabKey(row, rows)] ?? map[getVariantLabel(row)] ?? map[row.bhk];
}

export function lookupBhkCarParking(
  map: Record<string, BhkCarParking>,
  row: AvailableSizeRow,
  rows: AvailableSizeRow[],
): BhkCarParking | undefined {
  return map[getBhkAreaTabKey(row, rows)] ?? map[getVariantLabel(row)] ?? map[row.bhk];
}

function buildBhkAreaTabs(eligible: AvailableSizeRow[]): BhkAreaTab[] {
  const tabs = new Map<string, BhkAreaTab>();

  for (const row of eligible) {
    const key = getBhkAreaTabKey(row, eligible);
    tabs.set(key, {
      key,
      bhk: row.bhk,
      label: getBhkAreaTabDisplayLabel(row, eligible),
    });
  }

  return [...tabs.values()];
}

export function getProjectBhkVariantTabs(project: ProjectDetailsValues): BhkAreaTab[] {
  const eligible = project.availableSizes.filter((row) => row.bhk);
  return buildBhkAreaTabs(eligible);
}

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
  const eligible = project.availableSizes.filter(
    (row) => row.bhk && (!row.unitType || row.unitType === unitType),
  );

  return buildBhkAreaTabs(eligible);
}

export function getBhkParkingTabs(
  project: ProjectDetailsValues,
  propertyType?: PropertyTypeId,
  subType?: string,
): BhkAreaTab[] {
  if (propertyType === "residential" && subType) {
    const tabs = getBhkAreaTabs(project, propertyType, subType);
    if (tabs.length > 0) {
      return tabs;
    }
  }

  return getProjectBhkVariantTabs(project);
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
