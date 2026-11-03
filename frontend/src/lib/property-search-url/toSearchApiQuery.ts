import { urlPropertyTypeToSubTypeId } from "@/components/landing/property-search/more-filters/moreFilterContext";
import type { PropertyTypeId } from "@/components/shared/post-property/config/postPropertyForm.shared";
import { normalizeSearchCriteria } from "./normalizeSearchCriteria";
import { CATEGORY_ID_BY_SLUG } from "./searchUrl.config";
import type { PropertySearchCriteria } from "./searchUrl.types";

export type SearchSort = "recent" | "price-asc" | "price-desc";

type ApiQueryValue = string | number | boolean | string[] | number[] | undefined;

function isFilled(value: ApiQueryValue): boolean {
  if (Array.isArray(value)) return value.length > 0;
  return value !== undefined && value !== "" && value !== false;
}

function appendValue(params: URLSearchParams, key: string, value: ApiQueryValue) {
  if (!isFilled(value)) return;
  params.set(key, Array.isArray(value) ? value.join(",") : String(value));
}

// Query string of GET /property-search for the filters of the page
export function toSearchApiQuery(
  rawCriteria: PropertySearchCriteria,
  sort: SearchSort = "recent",
): string {
  const criteria = normalizeSearchCriteria(rawCriteria);
  const category = CATEGORY_ID_BY_SLUG[criteria.category];
  const subTypes = criteria.propertyTypes.map(
    (value) =>
      urlPropertyTypeToSubTypeId(category as PropertyTypeId, value) ??
      value.toLowerCase(),
  );

  const values: Record<string, ApiQueryValue> = {
    listingType: criteria.transaction === "property-for-sale" ? "sale" : "rent-lease",
    category,
    city: criteria.cityName,
    localities: criteria.localities,
    projects: criteria.projects,
    bedrooms: criteria.bedrooms,
    subTypes,
    constructionStatuses: criteria.constructionStatuses,
    saleTypes: criteria.saleTypes,
    occupancies: criteria.occupancies,
    genders: criteria.genders,
    postedBy: criteria.postedBy,
    budgetMin: criteria.budgetMin,
    budgetMax: criteria.budgetMax,
    areaMin: criteria.areaMin,
    areaMax: criteria.areaMax,
    ...criteria.more,
    page: criteria.page > 1 ? criteria.page : undefined,
    sort: sort === "recent" ? undefined : sort,
  };

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) appendValue(params, key, value);
  return params.toString();
}
