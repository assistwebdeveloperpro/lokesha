import {
  SUB_TYPES_BY_PROPERTY_TYPE,
  type PropertyTypeId,
} from "../postPropertyForm.shared";
import {
  LAND_SIZE_UNIT_OPTIONS,
  SIZE_UNIT_OPTIONS,
} from "@/components/master/post-property/postPropertyProjectDetails";

export type BuilderExtraFieldId =
  | "distanceFromCity"
  | "storageCapacity"
  | "powerLoad"
  | "loadingBays"
  | "clearHeight"
  | "starCategory"
  | "infrastructure"
  | "naConversionDone"
  | "conversionStatus"
  | "irrigationSources";

export type BuilderConfig = {
  hideUnitFields: boolean;
  projectNameRequired: boolean;
  showProjectType: boolean;
  totalUnitsLabel: string;
  hideTotalBlocks: boolean;
  showBhk: boolean;
  sizeUnits: string[];
  defaultUnitType: string;
  showSpecifications: boolean;
  carParking: "bhk" | "single" | "none";
  hideClubMembership: boolean;
  showFloorPlans: boolean;
  showConstructionProgress: boolean;
  chargesByBhk: boolean;
  showAssuredReturn: boolean;
  plotAreaMax: boolean;
  terraceAreaMax: boolean;
  extras: BuilderExtraFieldId[];
};

const DEFAULT_CONFIG: BuilderConfig = {
  hideUnitFields: true,
  projectNameRequired: true,
  showProjectType: true,
  totalUnitsLabel: "Total Units",
  hideTotalBlocks: false,
  showBhk: true,
  sizeUnits: SIZE_UNIT_OPTIONS,
  defaultUnitType: "",
  showSpecifications: true,
  carParking: "bhk",
  hideClubMembership: false,
  showFloorPlans: true,
  showConstructionProgress: true,
  chargesByBhk: true,
  showAssuredReturn: false,
  plotAreaMax: false,
  terraceAreaMax: false,
  extras: [],
};

const VILLA_LIKE: Partial<BuilderConfig> = {
  totalUnitsLabel: "Total Villas",
  hideTotalBlocks: true,
  plotAreaMax: true,
};

const COMMERCIAL_BASE: Partial<BuilderConfig> = {
  showBhk: false,
  carParking: "single",
  hideClubMembership: true,
  chargesByBhk: false,
  showAssuredReturn: true,
};

const STORAGE_BASE: Partial<BuilderConfig> = {
  ...COMMERCIAL_BASE,
  hideTotalBlocks: true,
};

const ROOMS_BASE: Partial<BuilderConfig> = {
  ...COMMERCIAL_BASE,
  totalUnitsLabel: "Total Rooms",
  hideTotalBlocks: true,
};

const PLOT_BASE: Partial<BuilderConfig> = {
  showBhk: false,
  totalUnitsLabel: "Total Plots",
  hideTotalBlocks: true,
  showSpecifications: false,
  carParking: "none",
  showFloorPlans: false,
  chargesByBhk: false,
  showAssuredReturn: true,
  plotAreaMax: true,
  extras: ["infrastructure", "naConversionDone"],
};

const LAND_BASE: Partial<BuilderConfig> = {
  showBhk: false,
  sizeUnits: LAND_SIZE_UNIT_OPTIONS,
  totalUnitsLabel: "Total Parcels / Plots",
  hideTotalBlocks: true,
  showProjectType: false,
  projectNameRequired: false,
  showSpecifications: false,
  carParking: "none",
  showFloorPlans: false,
  showConstructionProgress: false,
  chargesByBhk: false,
  showAssuredReturn: true,
};

const BUILDER_CONFIGS: Partial<
  Record<PropertyTypeId, Record<string, Partial<BuilderConfig>>>
> = {
  residential: {
    "bungalow-villa": VILLA_LIKE,
    "weekend-homes": { ...VILLA_LIKE, extras: ["distanceFromCity"] },
    "farm-house": { ...VILLA_LIKE, extras: ["distanceFromCity"] },
    "studio-apartment": {
      showBhk: false,
      carParking: "single",
      hideClubMembership: true,
      chargesByBhk: false,
      defaultUnitType: "Studio",
    },
    penthouse: { totalUnitsLabel: "Total Penthouses", terraceAreaMax: true },
  },
  commercial: {
    shop: { ...COMMERCIAL_BASE, totalUnitsLabel: "Total Units (Shops)" },
    office: { ...COMMERCIAL_BASE, totalUnitsLabel: "Total Units (Offices)" },
    showroom: { ...COMMERCIAL_BASE, totalUnitsLabel: "Total Units (Showrooms)" },
    "co-working-space": COMMERCIAL_BASE,
    "cold-storage": { ...STORAGE_BASE, extras: ["storageCapacity", "powerLoad"] },
    "warehouse-godown": {
      ...STORAGE_BASE,
      extras: ["loadingBays", "clearHeight", "powerLoad"],
    },
    "industrial-shed": { ...STORAGE_BASE, extras: ["clearHeight", "powerLoad"] },
    "guest-house": ROOMS_BASE,
    "hotel-resort": { ...ROOMS_BASE, extras: ["starCategory"] },
  },
  plot: {
    "residential-plot": PLOT_BASE,
    "industrial-plot": { ...PLOT_BASE, extras: [...(PLOT_BASE.extras ?? []), "powerLoad"] },
    "commercial-plot": { ...PLOT_BASE, extras: [...(PLOT_BASE.extras ?? []), "powerLoad"] },
  },
  land: {
    "agriculture-land": { ...LAND_BASE, extras: ["conversionStatus", "irrigationSources"] },
    "non-agriculture-land": {
      ...LAND_BASE,
      extras: ["conversionStatus", "naConversionDone"],
    },
    "commercial-land": { ...LAND_BASE, extras: ["conversionStatus", "naConversionDone"] },
    "residential-land": { ...LAND_BASE, extras: ["conversionStatus", "naConversionDone"] },
    "industrial-land": { ...LAND_BASE, extras: ["conversionStatus", "naConversionDone"] },
  },
};

// Residential sub types without an entry (flat, duplex) use the default builder form
export function getBuilderConfig(
  propertyType: PropertyTypeId,
  subType: string,
): BuilderConfig {
  const config = { ...DEFAULT_CONFIG, ...BUILDER_CONFIGS[propertyType]?.[subType] };

  // Non residential rows are named after the selected sub type
  if (propertyType !== "residential" && !config.defaultUnitType) {
    config.defaultUnitType =
      SUB_TYPES_BY_PROPERTY_TYPE[propertyType]?.find(
        (option) => option.id === subType,
      )?.label ?? "";
  }

  return config;
}

// Sample floor plan title for the selected property type and sub type
export function getFloorPlanTitleExample(
  propertyType: PropertyTypeId,
  subType?: string | string[],
): string {
  const subTypeId = (Array.isArray(subType) ? subType.find(Boolean) : subType) ?? "";
  const typeLabel =
    SUB_TYPES_BY_PROPERTY_TYPE[propertyType]?.find((option) => option.id === subTypeId)
      ?.label ?? "";
  const showBhk =
    propertyType === "residential" &&
    getBuilderConfig(propertyType, subTypeId).showBhk;

  if (showBhk) {
    return typeLabel ? `3 BHK ${typeLabel}` : "3 BHK Flat/Apartment";
  }

  if (typeLabel) {
    return typeLabel;
  }

  if (propertyType === "pg-co-living") {
    return "PG/Co-Living";
  }

  return "Floor plan";
}
