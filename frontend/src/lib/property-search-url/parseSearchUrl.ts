import { parsePostedByParam } from "./postedByParam";
import {
  CATEGORY_SLUGS,
  SEARCH_PARAM_ALIASES,
  SEARCH_PARAM_KEYS,
  TRANSACTION_SLUGS,
  isSearchableCombination,
  type SearchParamKey,
} from "./searchUrl.config";
import type {
  CategorySlug,
  PropertySearchCriteria,
  SearchParamRecord,
  TransactionSlug,
} from "./searchUrl.types";
import { fromUrlSegment } from "./slug";

type ParseSearchUrlInput = {
  transaction: string;
  category: string;
  searchParams: SearchParamRecord;
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

const matchSlug = <T extends string>(options: readonly T[], value: string) =>
  options.find((option) => option === value.toLowerCase());

export function parseSearchUrl({
  transaction,
  category,
  searchParams,
}: ParseSearchUrlInput): PropertySearchCriteria | null {
  const transactionSlug: TransactionSlug | undefined = matchSlug(
    TRANSACTION_SLUGS,
    transaction,
  );
  const categorySlug: CategorySlug | undefined = matchSlug(
    CATEGORY_SLUGS,
    category,
  );
  if (
    !transactionSlug ||
    !categorySlug ||
    !isSearchableCombination(transactionSlug, categorySlug)
  ) {
    return null;
  }

  const params = readParams(searchParams);
  const cityName = fromUrlSegment(params["city-name"] ?? "");
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
    transaction: transactionSlug,
    category: categorySlug,
    cityName: cityName || undefined,
    localities: splitList(params.locality).map(fromUrlSegment),
    projects: splitList(params["project-socity"]).map(fromUrlSegment),
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
    page: page >= 1 ? page : 1,
  };
}
