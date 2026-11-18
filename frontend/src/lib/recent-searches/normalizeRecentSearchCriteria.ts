import type { PropertySearchCriteria } from "@/lib/property-search-url/searchUrl.types";
import type { RecentSearchCriteria } from "@/services/recentSearches.service";

type Plain = Record<string, unknown>;

const isEmpty = (value: unknown): boolean => {
  if (value === undefined || value === null || value === "") return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value as Plain).length === 0;
  return false;
};

const compareValues = (a: unknown, b: unknown) =>
  typeof a === "number" && typeof b === "number"
    ? a - b
    : String(a).localeCompare(String(b));

// Canonical form: lowercase strings, sorted arrays and keys, no empty values
function normalizeValue(value: unknown): unknown {
  if (typeof value === "string") return value.trim().toLowerCase();

  if (Array.isArray(value)) {
    return value
      .map(normalizeValue)
      .filter((item) => !isEmpty(item))
      .sort(compareValues);
  }

  if (value && typeof value === "object") {
    return Object.keys(value as Plain)
      .sort()
      .reduce<Plain>((acc, key) => {
        const normalized = normalizeValue((value as Plain)[key]);
        return isEmpty(normalized) ? acc : { ...acc, [key]: normalized };
      }, {});
  }

  return value;
}

// Any criteria-like object, so partial test and legacy shapes normalise too
type CriteriaInput = object;

// Page is never part of a search identity
export function toRecentSearchCriteria(criteria: PropertySearchCriteria): RecentSearchCriteria {
  return Object.fromEntries(
    Object.entries(criteria).filter(([key]) => key !== "page"),
  ) as RecentSearchCriteria;
}

// Same rules as the backend hash, so guest and stored searches dedupe alike
export function normalizeRecentSearchCriteria(criteria: CriteriaInput): Plain {
  const withoutPage = Object.fromEntries(
    Object.entries(criteria).filter(([key]) => key !== "page"),
  );
  return normalizeValue(withoutPage) as Plain;
}

export function toRecentSearchKey(criteria: CriteriaInput): string {
  return JSON.stringify(normalizeRecentSearchCriteria(criteria));
}
