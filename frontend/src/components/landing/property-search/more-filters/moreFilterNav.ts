import {
  AGE_OF_CONSTRUCTION_OPTIONS,
  BUSINESS_OPTIONS,
  CONSTRUCTION_STATUS_OPTIONS,
  FACING_OPTIONS,
  FOOD_OPTIONS,
  FURNISHING_STATUS_OPTIONS,
  PG_PRESENT_IN_OPTIONS,
  numberOptions,
} from "@/components/shared/post-property/config/postPropertyForm.shared";
import type { MoreFilterListKey } from "@/lib/property-search-url/moreFiltersParam";
import type { PropertySearchMoreFilters } from "@/lib/property-search-url/moreFilters.types";
import type {
  CategorySlug,
  TransactionSlug,
} from "@/lib/property-search-url/searchUrl.types";
import { slugify } from "@/lib/property-search-url/slug";

export type MoreFilterChipField = MoreFilterListKey | "constructionStatuses";

export type MoreFilterChipBlock = {
  type: "chips";
  field: MoreFilterChipField;
  options: { value: string; label: string }[];
  extendedOptions?: { value: string; label: string }[];
};

export type MoreFilterSelectBlock = {
  type: "select";
  field: "postedSince" | "availableFrom";
  placeholder: string;
  options: { value: string; label: string }[];
};

export type MoreFilterToggleBlock = {
  type: "toggle";
  field: keyof PropertySearchMoreFilters;
  label: string;
};

export type MoreFilterAreaBlock = {
  type: "area";
};

export type MoreFilterBlock =
  | MoreFilterChipBlock
  | MoreFilterSelectBlock
  | MoreFilterToggleBlock
  | MoreFilterAreaBlock;

export type MoreFilterNavItem = {
  id: string;
  label: string;
  blocks: MoreFilterBlock[];
};

const POSTED_SINCE_OPTIONS = [
  { value: "24h", label: "Last 24 hours" },
  { value: "3d", label: "Last 3 days" },
  { value: "7d", label: "Last 7 days" },
  { value: "15d", label: "Last 15 days" },
  { value: "30d", label: "Last 30 days" },
];

const AVAILABLE_FROM_OPTIONS = [
  { value: "immediate", label: "Immediate" },
  { value: "15d", label: "Within 15 days" },
  { value: "30d", label: "Within 30 days" },
  { value: "60d", label: "Within 60 days" },
  { value: "90d", label: "Within 90 days" },
];

const chip = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value }));

const idChip = <T extends { id: string; label: string }>(options: readonly T[]) =>
  options.map((option) => ({ value: option.id, label: option.label }));

const constructionChips = CONSTRUCTION_STATUS_OPTIONS.map((option) => ({
  value: slugify(option.label),
  label: option.label,
}));

const floorChips = chip(numberOptions(1, 7));
const floorMore = chip(numberOptions(8, 50));
const washroomChips = chip(numberOptions(0, 6));
const washroomMore = chip(numberOptions(7, 20));
const parkingChips = chip(numberOptions(0, 6));
const parkingMore = chip(numberOptions(7, 20));

const pgOperationYearOptions = (() => {
  const year = new Date().getFullYear();
  return Array.from({ length: 25 }, (_, index) => {
    const value = String(year - index);
    return { value, label: value };
  });
})();

type NavKey =
  | "postedSince"
  | "areaSqFt"
  | "totalFloors"
  | "furnishingStatus"
  | "washroom"
  | "constructionStatus"
  | "amenities"
  | "ageOfConstruction"
  | "idealForBusiness"
  | "furnishing"
  | "facing"
  | "rera"
  | "parking"
  | "bathrooms"
  | "availableFrom"
  | "cornerPlot"
  | "photos"
  | "videos"
  | "pgOperationSince"
  | "pgPresentIn"
  | "foodAvailability";

const COMMERCIAL_SALE: NavKey[] = [
  "postedSince",
  "furnishingStatus",
  "totalFloors",
  "washroom",
  "constructionStatus",
  "amenities",
  "ageOfConstruction",
  "idealForBusiness",
  "furnishing",
  "facing",
  "rera",
  "parking",
  "photos",
  "videos",
];

const COMMERCIAL_RENT: NavKey[] = [
  "postedSince",
  "furnishingStatus",
  "totalFloors",
  "washroom",
  "constructionStatus",
  "amenities",
  "ageOfConstruction",
  "idealForBusiness",
  "furnishing",
  "facing",
  "rera",
  "parking",
  "availableFrom",
  "photos",
  "videos",
];

const RESIDENTIAL_SALE: NavKey[] = [
  "postedSince",
  "areaSqFt",
  "totalFloors",
  "furnishingStatus",
  "bathrooms",
  "ageOfConstruction",
  "furnishing",
  "amenities",
  "facing",
  "parking",
  "rera",
  "constructionStatus",
  "photos",
  "videos",
];

const RESIDENTIAL_RENT: NavKey[] = [
  "postedSince",
  "areaSqFt",
  "totalFloors",
  "furnishingStatus",
  "bathrooms",
  "ageOfConstruction",
  "furnishing",
  "amenities",
  "facing",
  "parking",
  "rera",
  "availableFrom",
  "photos",
  "videos",
];

const PLOT: NavKey[] = [
  "postedSince",
  "ageOfConstruction",
  "amenities",
  "facing",
  "rera",
  "cornerPlot",
  "photos",
  "videos",
];

const LAND: NavKey[] = [
  "postedSince",
  "facing",
  "rera",
  "cornerPlot",
  "photos",
  "videos",
];

const PG: NavKey[] = [
  "postedSince",
  "furnishing",
  "ageOfConstruction",
  "rera",
  "availableFrom",
  "pgOperationSince",
  "pgPresentIn",
  "foodAvailability",
  "photos",
  "videos",
];

function isRentTransaction(transaction: TransactionSlug): boolean {
  return transaction !== "property-for-sale";
}

function catalogFor(
  category: CategorySlug,
  transaction: TransactionSlug,
): NavKey[] {
  const rent = isRentTransaction(transaction);

  switch (category) {
    case "commercial-real-estate":
      return rent ? COMMERCIAL_RENT : COMMERCIAL_SALE;
    case "residential-real-estate":
      return rent ? RESIDENTIAL_RENT : RESIDENTIAL_SALE;
    case "plot":
      return PLOT;
    case "land":
      return LAND;
    case "pg-co-living":
      return PG;
    default:
      return [];
  }
}

const NAV_BY_KEY: Record<NavKey, MoreFilterNavItem> = {
  postedSince: {
    id: "posted-since",
    label: "Posted Since",
    blocks: [
      {
        type: "select",
        field: "postedSince",
        placeholder: "Select",
        options: POSTED_SINCE_OPTIONS,
      },
    ],
  },
  areaSqFt: {
    id: "area-sq-ft",
    label: "Area in sq. ft",
    blocks: [{ type: "area" }],
  },
  totalFloors: {
    id: "total-floors",
    label: "Total Floors",
    blocks: [
      {
        type: "chips",
        field: "totalFloors",
        options: floorChips,
        extendedOptions: floorMore,
      },
    ],
  },
  furnishingStatus: {
    id: "furnishing-status",
    label: "Furnishing Status",
    blocks: [
      {
        type: "chips",
        field: "furnishingStatuses",
        options: idChip(FURNISHING_STATUS_OPTIONS),
      },
    ],
  },
  washroom: {
    id: "washroom",
    label: "Washroom",
    blocks: [
      {
        type: "chips",
        field: "washrooms",
        options: washroomChips,
        extendedOptions: washroomMore,
      },
    ],
  },
  constructionStatus: {
    id: "construction-status",
    label: "Construction Status",
    blocks: [
      {
        type: "chips",
        field: "constructionStatuses",
        options: constructionChips,
      },
    ],
  },
  amenities: {
    id: "amenities",
    label: "Amenities",
    blocks: [{ type: "chips", field: "amenities", options: [] }],
  },
  ageOfConstruction: {
    id: "age-of-construction",
    label: "Age of Construction",
    blocks: [
      {
        type: "chips",
        field: "ageOfConstruction",
        options: idChip(AGE_OF_CONSTRUCTION_OPTIONS),
      },
    ],
  },
  idealForBusiness: {
    id: "ideal-for-business",
    label: "Ideal For Business",
    blocks: [
      {
        type: "chips",
        field: "businessTypes",
        options: BUSINESS_OPTIONS.map((option) => ({
          value: option.id,
          label: option.label,
        })),
      },
    ],
  },
  furnishing: {
    id: "furnishing",
    label: "Furnishing",
    blocks: [{ type: "chips", field: "furnishingItems", options: [] }],
  },
  facing: {
    id: "facing",
    label: "Facing",
    blocks: [
      {
        type: "chips",
        field: "facings",
        options: chip(FACING_OPTIONS),
      },
    ],
  },
  rera: {
    id: "rera-number",
    label: "RERA Number",
    blocks: [
      { type: "toggle", field: "hasRera", label: "RERA registered only" },
    ],
  },
  parking: {
    id: "parking",
    label: "Parking",
    blocks: [
      {
        type: "chips",
        field: "carParkings",
        options: parkingChips,
        extendedOptions: parkingMore,
      },
    ],
  },
  bathrooms: {
    id: "bathrooms",
    label: "Bathrooms",
    blocks: [
      {
        type: "chips",
        field: "bathroomCounts",
        options: chip(numberOptions(1, 7)),
      },
    ],
  },
  availableFrom: {
    id: "available-from",
    label: "Available From",
    blocks: [
      {
        type: "select",
        field: "availableFrom",
        placeholder: "Select",
        options: AVAILABLE_FROM_OPTIONS,
      },
    ],
  },
  cornerPlot: {
    id: "corner-plot",
    label: "Corner Plot",
    blocks: [{ type: "toggle", field: "cornerPlot", label: "Corner plot only" }],
  },
  photos: {
    id: "photos",
    label: "Photos",
    blocks: [{ type: "toggle", field: "hasPhotos", label: "With photos" }],
  },
  videos: {
    id: "videos",
    label: "Videos",
    blocks: [{ type: "toggle", field: "hasVideos", label: "With videos" }],
  },
  pgOperationSince: {
    id: "pg-operation-since",
    label: "PG Operation Since",
    blocks: [
      {
        type: "chips",
        field: "pgOperationSince",
        options: pgOperationYearOptions,
      },
    ],
  },
  pgPresentIn: {
    id: "pg-present-in",
    label: "PG Present in",
    blocks: [
      {
        type: "chips",
        field: "pgPresentIn",
        options: chip(PG_PRESENT_IN_OPTIONS),
      },
    ],
  },
  foodAvailability: {
    id: "food-availability",
    label: "Food Availablity",
    blocks: [
      {
        type: "chips",
        field: "foods",
        options: idChip(FOOD_OPTIONS),
      },
    ],
  },
};

export function buildMoreFilterNav(
  category: CategorySlug,
  transaction: TransactionSlug,
): MoreFilterNavItem[] {
  return catalogFor(category, transaction).map((key) => NAV_BY_KEY[key]);
}

export type MoreFiltersDraft = {
  more: PropertySearchMoreFilters;
  constructionStatuses: string[];
  areaMin?: number;
  areaMax?: number;
};

export function countNavSelections(draft: MoreFiltersDraft): number {
  let count = 0;
  for (const value of Object.values(draft.more)) {
    if (Array.isArray(value)) count += value.length;
    else if (value === true) count += 1;
    else if (typeof value === "string" && value) count += 1;
  }
  count += draft.constructionStatuses.length;
  if (draft.areaMin !== undefined || draft.areaMax !== undefined) count += 1;
  return count;
}

export function readChipValues(
  draft: MoreFiltersDraft,
  field: MoreFilterChipField,
): string[] {
  if (field === "constructionStatuses") {
    return draft.constructionStatuses;
  }
  return draft.more[field];
}

export function patchChipValues(
  draft: MoreFiltersDraft,
  field: MoreFilterChipField,
  values: string[],
): MoreFiltersDraft {
  if (field === "constructionStatuses") {
    return { ...draft, constructionStatuses: values };
  }
  return { ...draft, more: { ...draft.more, [field]: values } };
}
