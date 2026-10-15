import {
  SUB_TYPES_BY_PROPERTY_TYPE,
  type PropertyTypeId,
} from "./postPropertyForm.shared";

export const UNIT_TYPE_OPTIONS = [
  "Flat/Apartment",
  "Duplex",
  "Villa",
  "Penthouse",
  "Studio",
  "Builder Floor",
  "Independent House",
];

// Residential uses unit types with BHK; others use the selected sub types
export function getUnitTypeConfig(propertyType: PropertyTypeId, subTypes: string[]) {
  const options = SUB_TYPES_BY_PROPERTY_TYPE[propertyType] ?? [];
  if (propertyType === "residential" || options.length === 0) {
    return { unitTypes: UNIT_TYPE_OPTIONS, showBhk: true };
  }

  return {
    unitTypes: options
      .filter((option) => subTypes.includes(option.id))
      .map((option) => option.label),
    showBhk: false,
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

export type AvailableSizeRow = {
  id: string;
  bhk: string;
  unitType: string;
  size: string;
  price: string;
};

export type HighlightTextRow = { id: string; text: string };

export type FaqRow = { id: string; question: string; answer: string };

export type HighlightRow = { id: string; place: string; distance: string };

export type FloorPlanRow = {
  id: string;
  label: string;
  file: File | null;
  previewUrl: string;
};

export type ProjectDetailsValues = {
  carpetAreaMax: string;
  superBuildUpMax: string;
  developerName: string;
  launchDate: string;
  totalUnits: string;
  totalBlocks: string;
  projectArea: string;
  openSpacePercent: string;
  configurations: ConfigurationRow[];
  availableSizes: AvailableSizeRow[];
  primeLocationHighlights: HighlightRow[];
  floorPlans: FloorPlanRow[];
  projectHighlights: HighlightTextRow[];
  priceMin: string;
  priceMax: string;
  pricePerSqft: string;
  paymentPlan: string;
  approvedBanks: string;
  videoLink: string;
  faqs: FaqRow[];
};

export function createRowId() {
  return Math.random().toString(36).slice(2, 10);
}

export function createInitialProjectDetails(): ProjectDetailsValues {
  return {
    carpetAreaMax: "",
    superBuildUpMax: "",
    developerName: "",
    launchDate: "",
    totalUnits: "",
    totalBlocks: "",
    projectArea: "",
    openSpacePercent: "",
    configurations: [{ id: createRowId(), unitType: "", bhk: "" }],
    availableSizes: [
      { id: createRowId(), bhk: "", unitType: "", size: "", price: "" },
    ],
    primeLocationHighlights: [{ id: createRowId(), place: "", distance: "" }],
    floorPlans: [{ id: createRowId(), label: "", file: null, previewUrl: "" }],
    projectHighlights: [{ id: createRowId(), text: "" }],
    priceMin: "",
    priceMax: "",
    pricePerSqft: "",
    paymentPlan: "",
    approvedBanks: "",
    videoLink: "",
    faqs: [{ id: createRowId(), question: "", answer: "" }],
  };
}
