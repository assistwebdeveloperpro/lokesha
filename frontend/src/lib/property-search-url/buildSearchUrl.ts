import {
  MORE_FILTER_PARAM_KEYS,
  formatMoreFiltersToParams,
} from "./moreFiltersParam";
import { formatPostedByParam } from "./postedByParam";
import {
  CATEGORIES_WITH_BEDROOM_PARAM,
  KEYWORD_SEARCH_PATHS,
  SEARCH_PARAM_KEYS,
  type KeywordSearchSlug,
  type SearchParamKey,
} from "./searchUrl.config";
import { normalizeSearchCriteria } from "./normalizeSearchCriteria";
import type { PropertySearchCriteria } from "./searchUrl.types";
import { slugify, toUrlSegment } from "./slug";

const joinSegments = (segments: string[] | undefined) =>
  (segments ?? []).map(encodeURIComponent).join(",");

const formatOptional = (
  value: number | undefined,
  format: (value: number) => string,
) => (value === undefined ? undefined : format(value));

function collectParamValues(
  criteria: PropertySearchCriteria,
): Record<string, string | undefined> {
  const normalized = normalizeSearchCriteria(criteria);
  const { cityName, budgetMin, budgetMax, areaMin, areaMax } = normalized;
  const bedrooms = [...new Set(normalized.bedrooms)].sort((a, b) => a - b);

  return {
    bedroom: bedrooms.join(","),
    proptype: joinSegments(normalized.propertyTypes),
    locality: joinSegments(normalized.localities.map(toUrlSegment)),
    "city-name": cityName ? toUrlSegment(cityName) : undefined,
    "project-socity": joinSegments(normalized.projects.map(slugify)),
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
}: Pick<PropertySearchCriteria, "transaction" | "category">): string {
  const keywordSlug = (
    Object.keys(KEYWORD_SEARCH_PATHS) as KeywordSearchSlug[]
  ).find(
    (slug) =>
      KEYWORD_SEARCH_PATHS[slug].transaction === transaction &&
      KEYWORD_SEARCH_PATHS[slug].category === category,
  );
  return keywordSlug ? `/${keywordSlug}` : `/${transaction}/${category}`;
}

export function buildSearchUrl(criteria: PropertySearchCriteria): string {
  const path = buildSearchPath(criteria);
  const query = buildSearchQuery(criteria);
  return query ? `${path}?${query}` : path;
}
