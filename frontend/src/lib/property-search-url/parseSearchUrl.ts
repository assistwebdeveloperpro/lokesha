import { parseMoreFiltersFromParams } from "./moreFiltersParam";
import { parsePostedByParam } from "./postedByParam";
import { findKnownCity, isAllIndiaSegment, matchCityTemplate } from "./cityTemplate";
import { LANDING_KNOWN_CITIES } from "./landingKnownCities";
import {
  SEARCH_PARAM_ALIASES,
  SEARCH_PARAM_KEYS,
  SEARCH_SLUG_ROUTES,
  type SearchParamKey,
} from "./searchUrl.config";
import type { PropertySearchCriteria, SearchParamRecord } from "./searchUrl.types";
import { fromUrlSegment, fromUrlSegmentTitle } from "./slug";

type ParseSearchUrlInput = {
  slug: string;
  searchParams: SearchParamRecord;
  knownCities?: readonly string[];
};

type ParamMap = Partial<Record<SearchParamKey, string>>;

const CANONICAL_KEYS = new Map<string, SearchParamKey>([
  ...SEARCH_PARAM_KEYS.map((key): [string, SearchParamKey] => [
    key.toLowerCase(),
    key,
  ]),
  ...Object.entries(SEARCH_PARAM_ALIASES),
]);

const splitList = (value: string | undefined) =>
  (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

function flattenSearchParams(
  searchParams: SearchParamRecord,
): Record<string, string | undefined> {
  const flat: Record<string, string | undefined> = {};
  for (const [rawKey, rawValue] of Object.entries(searchParams)) {
    const value = Array.isArray(rawValue) ? rawValue.join(",") : rawValue;
    if (value) flat[rawKey.toLowerCase()] = value;
  }
  return flat;
}

function readParams(searchParams: SearchParamRecord): ParamMap {
  const params: ParamMap = {};

  for (const [rawKey, rawValue] of Object.entries(searchParams)) {
    const key = CANONICAL_KEYS.get(rawKey.toLowerCase());
    const value = Array.isArray(rawValue) ? rawValue.join(",") : rawValue;
    if (key && value && !params[key]) params[key] = value;
  }

  return params;
}

function parseBedrooms(value: string | undefined): number[] {
  const bedrooms = splitList(value)
    .map(Number)
    .filter((count) => Number.isInteger(count) && count > 0);
  return [...new Set(bedrooms)].sort((a, b) => a - b);
}

// Inverted ranges are swapped rather than rejected.
function orderRange(min?: number, max?: number) {
  return min !== undefined && max !== undefined && min > max
    ? { min: max, max: min }
    : { min, max };
}

function parsePositiveInt(value: string | undefined): number | undefined {
  const number = Number.parseInt(value ?? "", 10);
  return number > 0 ? number : undefined;
}

// The path carries transaction, category and city; unknown slugs resolve to null
function parseSearchSlug(slug: string, knownCities: readonly string[]) {
  for (const route of SEARCH_SLUG_ROUTES) {
    const citySegment = matchCityTemplate(route.template, slug);
    if (!citySegment) continue;

    const cityName = isAllIndiaSegment(citySegment)
      ? undefined
      : (findKnownCity(citySegment, knownCities) ??
        fromUrlSegmentTitle(citySegment));
    return { transaction: route.transaction, category: route.category, cityName };
  }
  return null;
}

export function parseSearchUrl({
  slug,
  searchParams,
  knownCities = LANDING_KNOWN_CITIES,
}: ParseSearchUrlInput): PropertySearchCriteria | null {
  const route = parseSearchSlug(slug, knownCities);
  if (!route) return null;

  const params = readParams(searchParams);
  const flatParams = flattenSearchParams(searchParams);
  const page = Number.parseInt(params.page ?? "", 10);
  const budget = orderRange(
    parsePositiveInt(params["min-price"]),
    parsePositiveInt(params["max-price"]),
  );
  const area = orderRange(
    parsePositiveInt(params["area-min"]),
    parsePositiveInt(params["area-max"]),
  );

  return {
    ...route,
    localities: splitList(params.locality).map(fromUrlSegmentTitle),
    projects: splitList(params["project-socity"]).map(fromUrlSegment),
    builders: splitList(params.builder).map(fromUrlSegment),
    bedrooms: parseBedrooms(params.bedroom),
    propertyTypes: splitList(params.proptype),
    constructionStatuses: splitList(params["construction-status"]),
    saleTypes: splitList(params["property-transaction"]),
    occupancies: splitList(params.occupancy),
    genders: splitList(params.gender),
    postedBy: parsePostedByParam(params["posted-by"]),
    budgetMin: budget.min,
    budgetMax: budget.max,
    areaMin: area.min,
    areaMax: area.max,
    more: parseMoreFiltersFromParams(flatParams),
    page: page >= 1 ? page : 1,
  };
}
