import {
  MORE_FILTER_PARAM_KEYS,
  formatMoreFiltersToParams,
} from "./moreFiltersParam";
import { formatPostedByParam } from "./postedByParam";
import { fillCityTemplate } from "./cityTemplate";
import {
  CATEGORIES_WITH_BEDROOM_PARAM,
  SEARCH_PARAM_KEYS,
  SEARCH_PATH_PREFIX,
  SEARCH_SLUG_ROUTES,
} from "./searchUrl.config";
import { normalizeSearchCriteria } from "./normalizeSearchCriteria";
import { buildTypesSegment } from "./propertyTypePath";
import type { PropertySearchCriteria } from "./searchUrl.types";
import { slugify, toUrlSegment } from "./slug";

const joinSegments = (segments: string[] | undefined) =>
  (segments ?? [])
    .map((segment) => encodeURIComponent(segment.toLowerCase()))
    .join(",");

const formatOptional = (
  value: number | undefined,
  format: (value: number) => string,
) => (value === undefined ? undefined : format(value));

function collectParamValues(
  criteria: PropertySearchCriteria,
): Record<string, string | undefined> {
  const normalized = normalizeSearchCriteria(criteria);
  const { budgetMin, budgetMax, areaMin, areaMax } = normalized;
  const bedrooms = [...new Set(normalized.bedrooms)].sort((a, b) => a - b);

  return {
    bedroom: bedrooms.join(","),
    proptype: joinSegments(normalized.propertyTypes),
    locality: joinSegments(normalized.localities.map(toUrlSegment)),
    "project-socity": joinSegments(normalized.projects.map(slugify)),
    builder: joinSegments((normalized.builders ?? []).map(slugify)),
    "min-price": formatOptional(budgetMin, String),
    "max-price": formatOptional(budgetMax, String),
    "construction-status": joinSegments(normalized.constructionStatuses),
    occupancy: joinSegments(normalized.occupancies),
    gender: joinSegments(normalized.genders),
    "posted-by": joinSegments(normalized.postedBy.map(formatPostedByParam)),
    "area-min": formatOptional(areaMin, String),
    "area-max": formatOptional(areaMax, String),
    "property-transaction": joinSegments(normalized.saleTypes),
    page: normalized.page > 1 ? String(normalized.page) : undefined,
    ...formatMoreFiltersToParams(normalized.more),
  };
}

export function buildSearchQuery(criteria: PropertySearchCriteria): string {
  const values = collectParamValues(criteria);
  const keepEmptyBedroom = CATEGORIES_WITH_BEDROOM_PARAM.includes(
    criteria.category,
  );
  const orderedKeys = [
    ...SEARCH_PARAM_KEYS,
    ...MORE_FILTER_PARAM_KEYS.filter((key) => values[key]),
  ];

  return orderedKeys
    .filter(
      (key) => values[key] || (key === "bedroom" && keepEmptyBedroom),
    )
    .map((key) => `${key}=${values[key] ?? ""}`)
    .join("&");
}

export function buildSearchPath({
  transaction,
  category,
  cityName,
  propertyTypes,
}: Pick<
  PropertySearchCriteria,
  "transaction" | "category" | "cityName" | "propertyTypes"
>): string {
  const categoryRoutes = SEARCH_SLUG_ROUTES.filter(
    (candidate) => candidate.category === category,
  );
  // An unsearchable pair, e.g. pg for sale, falls back to the category's first route
  const route =
    categoryRoutes.find((candidate) => candidate.transaction === transaction) ??
    categoryRoutes[0];

  const typesSegment = buildTypesSegment(propertyTypes ?? []);
  return `${SEARCH_PATH_PREFIX}/${fillCityTemplate(route.template, cityName, typesSegment)}`;
}

export function buildSearchUrl(criteria: PropertySearchCriteria): string {
  const path = buildSearchPath(criteria);
  const query = buildSearchQuery(criteria);
  return query ? `${path}?${query}` : path;
}
