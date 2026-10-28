import {
  SUB_TYPES_BY_PROPERTY_TYPE,
  type PropertyTypeId,
} from "./postPropertyForm.shared";

// Unit type choices are the sub types picked in step 1. Residential still collects BHK.
export function getUnitTypeConfig(propertyType: PropertyTypeId, subTypes: string[]) {
  const options = SUB_TYPES_BY_PROPERTY_TYPE[propertyType] ?? [];
  const selected = new Set(subTypes);

  return {
    unitTypes: options
      .filter((option) => selected.has(option.id))
      .map((option) => option.label),
    showBhk: propertyType === "residential" || options.length === 0,
  };
}

export const BHK_OPTIONS =["1 BHK", "2 BHK", "3 BHK", "4 BHK", "5 BHK", "6+ BHK"];

export type ConfigurationRow = { id: string; unitType: string; bhk: string };

export const PAYMENT_PLAN_OPTIONS = [
  "Construction Linked",
  "Down Payment",
  "Flexi Payment",
  "Possession Linked",
];

export const SIZE_UNIT_OPTIONS = ["sq ft", "sq yd", "sq m", "sq km"];

export const LAND_SIZE_UNIT_OPTIONS = [...SIZE_UNIT_OPTIONS, "Acres", "Guntha", "Bigha"];

export const PROJECT_AREA_UNIT_OPTIONS = ["sq yd", "sq ft"];

export const PROJECT_TYPE_OPTIONS = [
  "New Launch",
  "Under Construction",
  "Ready to Move",
  "Completed",
];

export const STAR_CATEGORY_OPTIONS = [
  "1 Star",
  "2 Star",
  "3 Star",
  "4 Star",
  "5 Star",
  "Unrated",
];

export const CONVERSION_STATUS_OPTIONS = ["Converted", "Not Converted", "In Process"];

export const INFRASTRUCTURE_OPTIONS = [
  "Internal Roads",
  "Drainage",
  "Water Supply",
  "Electricity",
  "Street Lights",
  "Sewage",
  "Park / Green Space",
];

export const IRRIGATION_OPTIONS = ["Borewell", "Canal", "Well", "River", "None"];

// Construction Progress photos apply only to these project types
export function showsConstructionProgress(projectType: string): boolean {
  return projectType === "New Launch" || projectType === "Under Construction";
}

export type AvailableSizeRow = {
  id: string;
  bhk: string;
  unitType: string;
  sizeUnit: string;
  size: string;
  price: string;
  unitsAvailable: string;
};

export type SpecificationItem = {
  id: string;
  label: string;
  value: string;
  custom: boolean;
};

export type SpecificationGroup = {
  id: string;
  title: string;
  items: SpecificationItem[];
};

// Fields below the preview belong to the user form, where files are sent to a draft at once
export type RowUploadFields = {
  status?: "uploading" | "uploaded" | "error";
  remote?: { id: string; path: string; kind?: "media" | "floor-plan" | "brochure" };
  errorMessage?: string;
};

export type BrochureImage = {
  id: string;
  file?: File;
  previewUrl: string;
  name?: string;
} & RowUploadFields;

export type HighlightTextRow = { id: string; text: string };

export type FaqRow = { id: string; question: string; answer: string };

export type HighlightRow = { id: string; place: string; distance: string };

export type FloorPlanPlanType = "2d" | "3d";

export type FloorPlanRow = {
  id: string;
  label: string;
  planType: FloorPlanPlanType;
  file: File | null;
  previewUrl: string;
} & RowUploadFields;

export function findFloorPlanRow(
  floorPlans: FloorPlanRow[],
  label: string,
  planType: FloorPlanPlanType,
): FloorPlanRow | undefined {
  return floorPlans.find(
    (item) => item.label === label && item.planType === planType,
  );
}

export type BhkCarParking = {
  available: boolean;
  count: string;
  clubMembership: boolean;
};

export type BhkCharges = {
  transferFee: string;
  bookingAmount: string;
  maintenanceCharges: string;
  benefitsRemarks: string;
};

export const EMPTY_BHK_CHARGES: BhkCharges = {
  transferFee: "",
  bookingAmount: "",
  maintenanceCharges: "",
  benefitsRemarks: "",
};

export const EMPTY_BHK_CAR_PARKING: BhkCarParking = {
  available: false,
  count: "",
  clubMembership: false,
};

export type BhkAreaDetails = {
  carpetAreaMin: string;
  carpetAreaMax: string;
  carpetAreaType: string;
  superBuildUpMin: string;
  superBuildUpMax: string;
  superBuildUpType: string;
};

export const EMPTY_BHK_AREA_DETAILS: BhkAreaDetails = {
  carpetAreaMin: "",
  carpetAreaMax: "",
  carpetAreaType: "",
  superBuildUpMin: "",
  superBuildUpMax: "",
  superBuildUpType: "",
};

export type ProjectDetailsValues = {
  carpetAreaMax: string;
  superBuildUpMax: string;
  plotAreaMax: string;
  terraceAreaMax: string;
  projectType: string;
  approvedBy: string;
  reraLink: string;
  virtualTourLink: string;
  distanceFromCity: string;
  storageCapacity: string;
  powerLoad: string;
  loadingBays: string;
  clearHeight: string;
  starCategory: string;
  infrastructure: string[];
  naConversionDone: boolean;
  conversionStatus: string;
  irrigationSources: string[];
  developerName: string;
  launchDate: string;
  totalUnits: string;
  totalBlocks: string;
  projectArea: string;
  openSpacePercent: string;
  areaUnit: string;
  projectSize: string;
  avgPrice: string;
  specifications: SpecificationGroup[];
  brochureImages: BrochureImage[];
  configurations: ConfigurationRow[];
  availableSizes: AvailableSizeRow[];
  bhkCarParking: Record<string, BhkCarParking>;
  bhkCharges: Record<string, BhkCharges>;
  bhkAreaDetails: Record<string, BhkAreaDetails>;
  chargeBhks: string[];
  primeLocationHighlights: HighlightRow[];
  floorPlans: FloorPlanRow[];
  projectHighlights: HighlightTextRow[];
  priceMin: string;
  priceMax: string;
  pricePerSqft: string;
  paymentPlan: string;
  videoLink: string;
  faqs: FaqRow[];
};

export function createRowId() {
  return Math.random().toString(36).slice(2, 10);
}

export function createAvailableSizeRow(unitType = ""): AvailableSizeRow {
  return {
    id: createRowId(),
    bhk: "",
    unitType,
    sizeUnit: SIZE_UNIT_OPTIONS[0],
    size: "",
    price: "",
    unitsAvailable: "",
  };
}

// Lowest and highest price typed in Available Sizes (raw numbers as strings)
export function getAvailableSizesPriceRange(values: ProjectDetailsValues): {
  min: string;
  max: string;
} {
  const prices = values.availableSizes
    .map((row) => Number(row.price))
    .filter((price) => Number.isFinite(price) && price > 0);

  if (prices.length === 0) {
    return { min: "", max: "" };
  }

  return { min: String(Math.min(...prices)), max: String(Math.max(...prices)) };
}

// Unique BHKs picked in Available Sizes, in the order they were added
export function getSelectedBhks(values: ProjectDetailsValues): string[] {
  const bhks = values.availableSizes.map((row) => row.bhk).filter(Boolean);
  return [...new Set(bhks)];
}

// BHKs from Available Sizes plus any picked in step 5
export function getChargeBhks(values: ProjectDetailsValues): string[] {
  return [...new Set([...getSelectedBhks(values), ...values.chargeBhks])];
}

// One floor plan title per BHK + unit type combination in Available Sizes
export function getFloorPlanTitles(values: ProjectDetailsValues): string[] {
  const titles = values.availableSizes
    .filter((row) => row.bhk || row.unitType)
    .map((row) => [row.bhk, row.unitType].filter(Boolean).join(" "));
  return [...new Set(titles)];
}

export const SPECIFICATION_FIELD_LABELS = [
  "Electrification",
  "Doors and Windows",
  "Flooring",
  "Colour",
  "Structure",
  "Interior & Exterior Plaster",
  "Plumbing",
  "Water Supply",
  "Parking",
  "Security System",
  "Foyer Area",
  "Kitchen",
  "Wall Finish",
  "Toilets",
  "Fire and Safety",
  "Bedrooms",
  "Balcony",
  "Elevators",
  "Terrace",
  "Water Proofing",
  "Wash Area",
  "Bathrooms",
  "Internet Telephone Point",
  "Air Conditioner",
];

export function createInitialSpecifications(): SpecificationGroup[] {
  return [
    {
      id: createRowId(),
      title: "",
      items: SPECIFICATION_FIELD_LABELS.map((label) => ({
        id: createRowId(),
        label,
        value: "",
        custom: false,
      })),
    },
  ];
}

export function createInitialProjectDetails(
  defaultUnitType = "",
): ProjectDetailsValues {
  return {
    carpetAreaMax: "",
    superBuildUpMax: "",
    plotAreaMax: "",
    terraceAreaMax: "",
    projectType: "",
    approvedBy: "",
    reraLink: "",
    virtualTourLink: "",
    distanceFromCity: "",
    storageCapacity: "",
    powerLoad: "",
    loadingBays: "",
    clearHeight: "",
    starCategory: "",
    infrastructure: [],
    naConversionDone: false,
    conversionStatus: "",
    irrigationSources: [],
    developerName: "",
    launchDate: "",
    totalUnits: "",
    totalBlocks: "",
    projectArea: "",
    openSpacePercent: "",
    areaUnit: PROJECT_AREA_UNIT_OPTIONS[0],
    projectSize: "",
    avgPrice: "",
    specifications: createInitialSpecifications(),
    brochureImages: [],
    configurations: [{ id: createRowId(), unitType: "", bhk: "" }],
    availableSizes: [createAvailableSizeRow(defaultUnitType)],
    bhkCarParking: {},
    bhkCharges: {},
    bhkAreaDetails: {},
    chargeBhks: [],
    primeLocationHighlights: [{ id: createRowId(), place: "", distance: "" }],
    floorPlans: [
      { id: createRowId(), label: "", planType: "2d", file: null, previewUrl: "" },
    ],
    projectHighlights: [{ id: createRowId(), text: "" }],
    priceMin: "",
    priceMax: "",
    pricePerSqft: "",
    paymentPlan: "",
    videoLink: "",
    faqs: [{ id: createRowId(), question: "", answer: "" }],
  };
}
