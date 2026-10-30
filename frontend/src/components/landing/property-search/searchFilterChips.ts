import { EMPTY_MORE_FILTERS } from "@/lib/property-search-url/moreFilters.types";
import type { PropertySearchCriteria } from "@/lib/property-search-url/searchUrl.types";
import { formatArea, formatBudget } from "../home/hero-banner/heroBanner.shared";
import {
  AREA_BOUNDS,
  BEDROOM_FILTER_OPTIONS,
  CONSTRUCTION_FILTER_OPTIONS,
  GENDER_FILTER_OPTIONS,
  OCCUPANCY_FILTER_OPTIONS,
  POSTED_BY_FILTER_OPTIONS,
  SALE_TYPE_FILTER_OPTIONS,
  findOptionLabel,
  getCategoryFilters,
  includesValue,
} from "./searchFilterOptions";
import { displayName } from "./searchPageText";

export type FilterChip = {
  id: string;
  label: string;
  clearPatch: Partial<PropertySearchCriteria>;
};

const without = <T>(values: T[], value: T) =>
  values.filter((item) => item !== value);

function rangeLabel(
  min: number | undefined,
  max: number | undefined,
  bounds: { min: number; max: number },
  format: (value: number) => string,
) {
  return `${format(min ?? bounds.min)} - ${format(max ?? bounds.max)}`;
}

export function getActiveFilterChips(
  criteria: PropertySearchCriteria,
): FilterChip[] {
  const { propertyTypeOptions, budgetBounds, isPg } = getCategoryFilters(
    criteria.category,
  );
  const chips: FilterChip[] = [];

  if (criteria.cityName) {
    chips.push({
      id: `city:${criteria.cityName}`,
      label: criteria.cityName,
      clearPatch: { cityName: undefined, localities: [], projects: [] },
    });
  }
  for (const locality of criteria.localities) {
    chips.push({
      id: `locality:${locality}`,
      label: displayName(locality),
      clearPatch: { localities: without(criteria.localities, locality) },
    });
  }
  for (const project of criteria.projects) {
    chips.push({
      id: `project:${project}`,
      label: displayName(project),
      clearPatch: { projects: without(criteria.projects, project) },
    });
  }
  for (const bedroom of criteria.bedrooms) {
    chips.push({
      id: `bedroom:${bedroom}`,
      label: findOptionLabel(BEDROOM_FILTER_OPTIONS, bedroom),
      clearPatch: { bedrooms: without(criteria.bedrooms, bedroom) },
    });
  }
  // Every type selected is the default view, so it gets no chips.
  const allTypesSelected = propertyTypeOptions.every((option) =>
    includesValue(criteria.propertyTypes, option.value),
  );
  for (const type of allTypesSelected ? [] : criteria.propertyTypes) {
    chips.push({
      id: `type:${type}`,
      label: findOptionLabel(propertyTypeOptions, type),
      clearPatch: { propertyTypes: without(criteria.propertyTypes, type) },
    });
  }
  for (const status of criteria.constructionStatuses) {
    chips.push({
      id: `construction:${status}`,
      label: findOptionLabel(CONSTRUCTION_FILTER_OPTIONS, status),
      clearPatch: {
        constructionStatuses: without(criteria.constructionStatuses, status),
      },
    });
  }
  for (const saleType of criteria.saleTypes ?? []) {
    chips.push({
      id: `saleType:${saleType}`,
      label: findOptionLabel(SALE_TYPE_FILTER_OPTIONS, saleType),
      clearPatch: { saleTypes: without(criteria.saleTypes, saleType) },
    });
  }
  for (const role of criteria.postedBy ?? []) {
    chips.push({
      id: `postedBy:${role}`,
      label: findOptionLabel(POSTED_BY_FILTER_OPTIONS, role),
      clearPatch: { postedBy: without(criteria.postedBy, role) },
    });
  }
  for (const occupancy of criteria.occupancies) {
    chips.push({
      id: `occupancy:${occupancy}`,
      label: findOptionLabel(OCCUPANCY_FILTER_OPTIONS, occupancy),
      clearPatch: { occupancies: without(criteria.occupancies, occupancy) },
    });
  }
  for (const gender of criteria.genders) {
    chips.push({
      id: `gender:${gender}`,
      label: findOptionLabel(GENDER_FILTER_OPTIONS, gender),
      clearPatch: { genders: without(criteria.genders, gender) },
    });
  }
  if (criteria.budgetMin !== undefined || criteria.budgetMax !== undefined) {
    chips.push({
      id: "budget",
      label: rangeLabel(
        criteria.budgetMin,
        criteria.budgetMax,
        budgetBounds,
        (value) => formatBudget(value, isPg),
      ),
      clearPatch: { budgetMin: undefined, budgetMax: undefined },
    });
  }
  if (criteria.areaMin !== undefined || criteria.areaMax !== undefined) {
    chips.push({
      id: "area",
      label: rangeLabel(criteria.areaMin, criteria.areaMax, AREA_BOUNDS, formatArea),
      clearPatch: { areaMin: undefined, areaMax: undefined },
    });
  }

  return chips;
}

// Keeps the city; clears everything else.
export const CLEAR_ALL_PATCH: Partial<PropertySearchCriteria> = {
  localities: [],
  projects: [],
  bedrooms: [],
  propertyTypes: [],
  constructionStatuses: [],
  saleTypes: [],
  occupancies: [],
  genders: [],
  postedBy: [],
  budgetMin: undefined,
  budgetMax: undefined,
  areaMin: undefined,
  areaMax: undefined,
  more: { ...EMPTY_MORE_FILTERS },
};
