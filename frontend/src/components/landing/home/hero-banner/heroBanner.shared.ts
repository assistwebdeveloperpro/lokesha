export const HERO_DESCRIPTION =
  "A new home, a new office or any other property you need, its all here. Get started.";

export const NEW_PROJECTS_HREF = "/new-projects";

export const TAB_LIST_CLASS =
  "flex w-full min-w-0 flex-nowrap items-stretch overflow-x-auto whitespace-nowrap scroll-smooth pt-3 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden";

export const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400";

export const CHIP_SELECTED =
  "border-navy-blue bg-sky-50 text-navy-blue shadow-sm ring-1 ring-sky-100";

export const CHIP_DEFAULT =
  "border-slate-200 bg-white text-slate-700 hover:border-sky-200 hover:bg-slate-50";

export const MENU_ITEM_ACTIVE = "bg-sky-50 text-navy-blue font-semibold";

export const MENU_ITEM_DEFAULT =
  "text-slate-700 hover:bg-slate-50 hover:text-navy-blue";

export const FILTER_TAB_ACTIVE =
  "-mb-px border-b-2 border-b-navy-blue text-navy-blue";

export const FILTER_TAB_DEFAULT =
  "-mb-px border-b-2 border-b-transparent text-slate-700 hover:text-navy-blue";

export const FILTER_SECTION_EXPANDED =
  "border border-navy-blue bg-navy-blue text-white shadow-sm";

export const FILTER_SECTION_SELECTED =
  "border border-navy-blue bg-sky-50 text-navy-blue shadow-sm";

export const FILTER_SECTION_DEFAULT =
  "border border-slate-300 bg-white text-slate-700 shadow-sm hover:border-slate-400 hover:bg-slate-50";

export const CATEGORY_TAB_DEFAULT =
  "-mb-px border-b-2 border-b-transparent text-slate-600 hover:text-navy-blue";

export const BAR_HEIGHT =
  "h-12 min-h-12 shrink-0 lg:h-full lg:min-h-12";

export const BAR_CONTROL =
  `inline-flex ${BAR_HEIGHT} w-full items-center justify-between gap-2 bg-white px-3.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50/80 hover:cursor-pointer lg:min-w-[5.5rem]`;

export type PropertyCategory =
  | "residential"
  | "commercial"
  | "new-projects"
  | "pg-co-living"
  | "plot"
  | "land";

export type SearchTagKind = "city" | "locality" | "project";

export type SearchTag = {
  kind: SearchTagKind;
  label: string;
};

export type TransactionType = "buy" | "rent" | "lease";

export const TRANSACTION_LABELS: Record<TransactionType, string> = {
  buy: "Buy",
  rent: "Rent",
  lease: "Lease",
};

export const COMMERCIAL_TRANSACTION_OPTIONS: TransactionType[] = ["buy", "lease"];
export const DEFAULT_TRANSACTION_OPTIONS: TransactionType[] = ["buy", "rent"];

export type FilterSection =
  | "bedroom"
  | "budget"
  | "construction"
  | "area"
  | "occupancy";

export type SimpleDropdown = "transaction" | "property-panel";

export const CATEGORIES: {
  id: PropertyCategory;
  label: string;
  title: string;
  navigatesAway?: boolean;
}[] = [
  {
    id: "residential",
    label: "Residential",
    title: "Right Property, Right Now",
  },
  {
    id: "commercial",
    label: "Commercial",
    title: "Find space for every business need.",
  },
  {
    id: "new-projects",
    label: "New Projects",
    title: "New Projects",
    navigatesAway: true,
  },
  {
    id: "pg-co-living",
    label: "PG/Co-living",
    title: "Affordable PG Homes for Everyone.",
  },
  {
    id: "plot",
    label: "Plot",
    title: "Find Plot to Build Your Dream.",
  },
  {
    id: "land",
    label: "Land",
    title: "Find Land for Investment and Development.",
  },
];

export const PROPERTY_TYPES: Record<
  Exclude<PropertyCategory, "new-projects" | "pg-co-living">,
  string[]
> = {
  residential: [
    "Flat/Apartment",
    "Bungalow/Villa",
    "Studio Apartment",
    "Weekend Homes",
    "Farm House",
    "Penthouse",
    "Duplex",
  ],
  commercial: [
    "Shop",
    "Office",
    "Showroom",
    "Cold Storage",
    "Industrial Shed",
    "Guest House",
    "Hotel/Resort",
    "Warehouse/Godown",
    "Co-working Space/Business Centre",
  ],
  plot: ["Residential Plot", "Industrial Plot", "Commercial Plot"],
  land: [
    "Agriculture Land",
    "Non-Agriculture Land",
    "Commercial Land",
    "Residential Land",
    "Industrial Land",
  ],
};

export const BEDROOM_OPTIONS = [
  "+1BHK",
  "+2BHK",
  "+3BHK",
  "+4BHK",
  "+5BHK",
  "+6BHK",
  "+7BHK",
  "+8BHK",
  "+9BHK",
  "+10BHK",
];

export const CONSTRUCTION_OPTIONS = [
  "Ready to Move",
  "Under Construction",
  "Pre Launch",
] as const;

export const OCCUPANCY_OPTIONS = ["Single", "Double", "Triple", "Triple+"] as const;

export const TRUST_ITEMS = [
  "Personal Property Manager",
  "Easy Property Discovery",
  "Verified Property Listing",
] as const;

export const RESIDENTIAL_BUDGET = { min: 500_000, max: 100_000_000 };
export const DEFAULT_BUDGET = RESIDENTIAL_BUDGET;
export const PG_BUDGET = { min: 1_000, max: 100_000 };
export const AREA_RANGE = { min: 100, max: 50_000 };

export function formatBudget(value: number, isPg: boolean): string {
  if (isPg) {
    return `₹${value.toLocaleString("en-IN")}`;
  }
  if (value >= 10_000_000) {
    return `₹${(value / 10_000_000).toFixed(2)} Cr`;
  }
  return `₹${(value / 100_000).toFixed(2)} Lac`;
}

export function formatArea(value: number): string {
  return `${value.toLocaleString("en-IN")} sq ft`;
}

export function categoryPropertyLabel(category: PropertyCategory): string {
  switch (category) {
    case "residential":
      return "Residential";
    case "commercial":
      return "Commercial";
    case "plot":
      return "Plot";
    case "land":
      return "Land";
    case "pg-co-living":
      return "PG";
    default:
      return "Property";
  }
}

export function filterSectionsForCategory(
  category: PropertyCategory,
): FilterSection[] {
  switch (category) {
    case "residential":
      return ["bedroom", "budget", "construction"];
    case "pg-co-living":
      return ["budget", "occupancy"];
    case "commercial":
    case "plot":
    case "land":
      return ["budget", "area"];
    default:
      return [];
  }
}

export function filterSectionLabel(section: FilterSection): string {
  switch (section) {
    case "bedroom":
      return "Bedroom";
    case "budget":
      return "Budget";
    case "construction":
      return "Construction Status";
    case "area":
      return "Area (sq ft)";
    case "occupancy":
      return "Occupancy";
  }
}

export type FilterSelectionState = {
  isPg: boolean;
  selectedBedrooms: string[];
  selectedConstruction: string[];
  selectedOccupancy: string[];
  budgetMin: number;
  budgetMax: number;
  pgBudgetMin: number;
  pgBudgetMax: number;
  areaMin: number;
  areaMax: number;
};

export function filterSectionHasSelection(
  section: FilterSection,
  state: FilterSelectionState,
): boolean {
  switch (section) {
    case "bedroom":
      return state.selectedBedrooms.length > 0;
    case "construction":
      return state.selectedConstruction.length > 0;
    case "occupancy":
      return state.selectedOccupancy.length > 0;
    case "budget":
      if (state.isPg) {
        return (
          state.pgBudgetMin !== PG_BUDGET.min ||
          state.pgBudgetMax !== PG_BUDGET.max
        );
      }
      return (
        state.budgetMin !== DEFAULT_BUDGET.min ||
        state.budgetMax !== DEFAULT_BUDGET.max
      );
    case "area":
      return (
        state.areaMin !== AREA_RANGE.min || state.areaMax !== AREA_RANGE.max
      );
  }
}
