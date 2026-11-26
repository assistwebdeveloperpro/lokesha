import { buildSearchPath, buildSearchQuery, buildSearchUrl } from "./buildSearchUrl";
import { parseSearchUrl } from "./parseSearchUrl";
import { SEARCH_PATH_PREFIX } from "./searchUrl.config";
import type { SearchParamRecord } from "./searchUrl.types";

type CanonicalSearchUrlInput = {
  slug: string;
  searchParams: SearchParamRecord;
};

const toEntries = (record: Record<string, string>) =>
  JSON.stringify(Object.entries(record).sort(([a], [b]) => a.localeCompare(b)));

function normalizeParams(searchParams: SearchParamRecord) {
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(searchParams)) {
    const text = Array.isArray(value) ? value.join(",") : value;
    if (text) normalized[key] = text;
  }
  return normalized;
}

// Returns the canonical url when the request differs from it, else null.
export function getCanonicalSearchRedirect(
  input: CanonicalSearchUrlInput,
): string | null {
  const criteria = parseSearchUrl(input);
  if (!criteria) return null;

  const samePath =
    `${SEARCH_PATH_PREFIX}/${input.slug}` === buildSearchPath(criteria);
  const canonicalParams = normalizeParams(
    Object.fromEntries(new URLSearchParams(buildSearchQuery(criteria))),
  );
  const sameQuery =
    toEntries(normalizeParams(input.searchParams)) ===
    toEntries(canonicalParams);

  return samePath && sameQuery ? null : buildSearchUrl(criteria);
}
