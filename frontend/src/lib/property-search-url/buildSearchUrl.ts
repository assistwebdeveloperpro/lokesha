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
): Record<SearchParamKey, string | undefined> {
  const { cityName, budgetMin, budgetMax, areaMin, areaMax } = criteria;
  const bedrooms = [...new Set(criteria.bedrooms)].sort((a, b) => a - b);

  return {
    bedroom: bedrooms.join(","),
    proptype: joinSegments(criteria.propertyTypes),
    locality: joinSegments(criteria.localities.map(toUrlSegment)),
    "city-name": cityName ? toUrlSegment(cityName) : undefined,
    "project-socity": joinSegments(criteria.projects.map(slugify)),
    "min-price": formatOptional(budgetMin, String),
    "max-price": formatOptional(budgetMax, String),
    "construction-status": joinSegments(criteria.constructionStatuses),
    occupancy: joinSegments(criteria.occupancies),
    gender: joinSegments(criteria.genders),
    "posted-by": joinSegments(criteria.postedBy.map(formatPostedByParam)),
    "area-min": formatOptional(areaMin, String),
    "area-max": formatOptional(areaMax, String),
    "property-transaction": joinSegments(criteria.saleTypes),
    page: criteria.page > 1 ? String(criteria.page) : undefined,
  };
}

export function buildSearchQuery(criteria: PropertySearchCriteria): string {
  const values = collectParamValues(normalizeSearchCriteria(criteria));
  const keepEmptyBedroom = CATEGORIES_WITH_BEDROOM_PARAM.includes(
    criteria.category,
  );

  return SEARCH_PARAM_KEYS.filter(
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
