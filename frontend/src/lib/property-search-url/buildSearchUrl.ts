import { formatBudgetParam } from "./budgetParam";
import {
  CATEGORIES_WITH_BEDROOM_PARAM,
  SEARCH_PARAM_KEYS,
  type SearchParamKey,
} from "./searchUrl.config";
import type { PropertySearchCriteria } from "./searchUrl.types";
import { slugify, toUrlSegment } from "./slug";

const joinSegments = (segments: string[]) =>
  segments.map(encodeURIComponent).join(",");

const formatOptional = (
  value: number | undefined,
  format: (value: number) => string,
) => (value === undefined ? undefined : format(value));

function collectParamValues(
  criteria: PropertySearchCriteria,
): Record<SearchParamKey, string | undefined> {
  const { cityName, budgetMin, budgetMax, areaMin, areaMax } = criteria;
  const bedrooms = [...new Set(criteria.bedrooms)].sort((a, b) => a - b);

  return {
    bedroom: bedrooms.join(","),
    proptype: joinSegments(criteria.propertyTypes),
    Locality: joinSegments(criteria.localities.map(toUrlSegment)),
    cityName: cityName ? toUrlSegment(cityName) : undefined,
    projectSocity: joinSegments(criteria.projects.map(slugify)),
    BudgetMin: formatOptional(budgetMin, formatBudgetParam),
    BudgetMax: formatOptional(budgetMax, formatBudgetParam),
    constructionStatus: joinSegments(criteria.constructionStatuses),
    occupancy: joinSegments(criteria.occupancies),
    areaMin: formatOptional(areaMin, String),
    areaMax: formatOptional(areaMax, String),
    page: criteria.page > 1 ? String(criteria.page) : undefined,
  };
}

export function buildSearchQuery(criteria: PropertySearchCriteria): string {
  const values = collectParamValues(criteria);
  const keepEmptyBedroom = CATEGORIES_WITH_BEDROOM_PARAM.includes(
    criteria.category,
  );

  return SEARCH_PARAM_KEYS.filter(
    (key) => values[key] || (key === "bedroom" && keepEmptyBedroom),
  )
    .map((key) => `${key}=${values[key] ?? ""}`)
    .join("&");
}

export function buildSearchUrl(criteria: PropertySearchCriteria): string {
  const path = `/${criteria.transaction}/${criteria.category}`;
  const query = buildSearchQuery(criteria);
  return query ? `${path}?${query}` : path;
}
