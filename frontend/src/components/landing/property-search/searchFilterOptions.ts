import { CATEGORY_ID_BY_SLUG } from "@/lib/property-search-url/searchUrl.config";
import type { CategorySlug } from "@/lib/property-search-url/searchUrl.types";
import { slugify, toUrlSegment } from "@/lib/property-search-url/slug";
import {
  AREA_RANGE,
  BEDROOM_OPTIONS,
  CONSTRUCTION_OPTIONS,
  DEFAULT_BUDGET,
  GENDER_OPTIONS,
  OCCUPANCY_OPTIONS,
  PG_BUDGET,
  PROPERTY_TYPES,
  SALE_TYPE_OPTIONS,
  filterSectionsForCategory,
  type FilterSection,
} from "../home/hero-banner/heroBanner.shared";

export type FilterOption<T extends string | number = string> = {
  value: T;
  label: string;
};

export type RangeBounds = { min: number; max: number };

export type CategoryFilters = {
  sections: FilterSection[];
  propertyTypeOptions: FilterOption[];
  budgetBounds: RangeBounds;
  isPg: boolean;
};

export const AREA_BOUNDS: RangeBounds = AREA_RANGE;

const toOptions = (
  labels: readonly string[],
  toValue: (label: string) => string = slugify,
): FilterOption[] => labels.map((label) => ({ value: toValue(label), label }));

// Url values are matched ignoring case, e.g. "Penthouse" and "penthouse".
export const sameValue = (a: string | number, b: string | number) =>
  String(a).toLowerCase() === String(b).toLowerCase();

export const includesValue = (values: (string | number)[], value: string | number) =>
  values.some((item) => sameValue(item, value));

export const BEDROOM_FILTER_OPTIONS: FilterOption<number>[] =
  BEDROOM_OPTIONS.map((_, index) => ({
    value: index + 1,
    label: `${index + 1} BHK`,
  }));

export const CONSTRUCTION_FILTER_OPTIONS = toOptions(CONSTRUCTION_OPTIONS);

export const SALE_TYPE_FILTER_OPTIONS = toOptions(SALE_TYPE_OPTIONS);

export const OCCUPANCY_FILTER_OPTIONS = toOptions(OCCUPANCY_OPTIONS);

export const GENDER_FILTER_OPTIONS = toOptions(GENDER_OPTIONS);

export const POSTED_BY_FILTER_OPTIONS: FilterOption[] = [
  { value: "buyer_owner_tenant", label: "Owner" },
  { value: "agent", label: "Agent" },
  { value: "builder", label: "Builder" },
];

export function getCategoryFilters(category: CategorySlug): CategoryFilters {
  const categoryId = CATEGORY_ID_BY_SLUG[category];
  const isPg = categoryId === "pg-co-living";

  return {
    sections: filterSectionsForCategory(categoryId),
    propertyTypeOptions: toOptions(
      PROPERTY_TYPES[categoryId as keyof typeof PROPERTY_TYPES] ?? [],
      toUrlSegment,
    ),
    budgetBounds: isPg ? PG_BUDGET : DEFAULT_BUDGET,
    isPg,
  };
}

export function findOptionLabel<T extends string | number>(
  options: FilterOption<T>[],
  value: T,
): string {
  return (
    options.find((option) => sameValue(option.value, value))?.label ??
    String(value).replace(/-/g, " ")
  );
}

export function toggleValue<T>(values: T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

// A missing param means "all types"; never deselect down to nothing.
export function togglePropertyType(
  selected: string[],
  allValues: string[],
  value: string,
): string[] {
  const current = selected.length > 0 ? selected : allValues;
  const next = includesValue(current, value)
    ? current.filter((item) => !sameValue(item, value))
    : [...current, value];

  if (next.length === 0) return selected;
  return allValues.filter((item) => includesValue(next, item));
}
