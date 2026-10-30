import { EMPTY_MORE_FILTERS } from "@/lib/property-search-url/moreFilters.types";
import { LANDING_CATEGORY_SLUGS } from "@/lib/property-search-url/landingUrl.config";
import { isSearchableCombination } from "@/lib/property-search-url/searchUrl.config";
import type {
  PropertySearchCriteria,
  TransactionSlug,
} from "@/lib/property-search-url/searchUrl.types";
import { slugify, toUrlSegment } from "@/lib/property-search-url/slug";
import {
  AREA_RANGE,
  CONSTRUCTION_OPTIONS,
  DEFAULT_BUDGET,
  GENDER_OPTIONS,
  OCCUPANCY_OPTIONS,
  PG_BUDGET,
  SALE_TYPE_OPTIONS,
  filterSectionsForCategory,
  type PropertyCategory,
  type SearchTag,
  type TransactionType,
} from "./heroBanner.shared";

const TRANSACTION_SLUGS: Record<TransactionType, TransactionSlug> = {
  buy: "property-for-sale",
  rent: "property-for-rent",
  lease: "property-for-lease",
};

export type HeroSearchInput = {
  category: PropertyCategory;
  transaction: TransactionType;
  searchTags: SearchTag[];
  propertyTypeOptions: string[];
  selectedPropertyTypes: string[];
  selectedBedrooms: string[];
  selectedConstruction: string[];
  selectedSaleTypes: string[];
  selectedOccupancy: string[];
  selectedGender: string[];
  budgetMin: number;
  budgetMax: number;
  pgBudgetMin: number;
  pgBudgetMax: number;
  areaMin: number;
  areaMax: number;
};

const tagLabels = (tags: SearchTag[], kind: SearchTag["kind"]) =>
  tags.filter((tag) => tag.kind === kind).map((tag) => tag.label);

// Keeps option order; every selected value is listed, even when it is all of them.
const selectedInOrder = (options: readonly string[], selected: string[]) =>
  options.filter((option) => selected.includes(option));

// Values equal to the slider bounds are the default, so they are omitted.
function rangeOverrides(
  min: number,
  max: number,
  bounds: { min: number; max: number },
) {
  return {
    min: min === bounds.min ? undefined : min,
    max: max === bounds.max ? undefined : max,
  };
}

// "+3BHK" -> 3
const bedroomCount = (label: string) => Number.parseInt(/\d+/.exec(label)?.[0] ?? "", 10);

const isLandingCategory = (
  category: PropertyCategory,
): category is keyof typeof LANDING_CATEGORY_SLUGS =>
  category in LANDING_CATEGORY_SLUGS;

export function buildHeroSearchCriteria(
  input: HeroSearchInput,
): PropertySearchCriteria | null {
  if (!isLandingCategory(input.category)) return null;

  const isPg = input.category === "pg-co-living";
  const category = LANDING_CATEGORY_SLUGS[input.category];
  const transaction = isPg
    ? "property-for-rent"
    : TRANSACTION_SLUGS[input.transaction];
  if (!isSearchableCombination(transaction, category)) return null;

  const sections = filterSectionsForCategory(input.category);
  const budget = isPg
    ? rangeOverrides(input.pgBudgetMin, input.pgBudgetMax, PG_BUDGET)
    : rangeOverrides(input.budgetMin, input.budgetMax, DEFAULT_BUDGET);
  const area = sections.includes("area")
    ? rangeOverrides(input.areaMin, input.areaMax, AREA_RANGE)
    : { min: undefined, max: undefined };

  return {
    transaction,
    category,
    cityName: tagLabels(input.searchTags, "city")[0],
    localities: tagLabels(input.searchTags, "locality"),
    projects: tagLabels(input.searchTags, "project"),
    bedrooms: sections.includes("bedroom")
      ? input.selectedBedrooms.map(bedroomCount).filter(Number.isInteger)
      : [],
    propertyTypes: selectedInOrder(
      input.propertyTypeOptions,
      input.selectedPropertyTypes,
    ).map(toUrlSegment),
    constructionStatuses: sections.includes("construction")
      ? selectedInOrder(CONSTRUCTION_OPTIONS, input.selectedConstruction).map(slugify)
      : [],
    saleTypes: sections.includes("saleType")
      ? selectedInOrder(SALE_TYPE_OPTIONS, input.selectedSaleTypes).map(slugify)
      : [],
    occupancies: sections.includes("occupancy")
      ? selectedInOrder(OCCUPANCY_OPTIONS, input.selectedOccupancy).map(slugify)
      : [],
    genders: sections.includes("gender")
      ? selectedInOrder(GENDER_OPTIONS, input.selectedGender).map(slugify)
      : [],
    postedBy: [],
    budgetMin: budget.min,
    budgetMax: budget.max,
    areaMin: area.min,
    areaMax: area.max,
    more: { ...EMPTY_MORE_FILTERS },
    page: 1,
  };
}
