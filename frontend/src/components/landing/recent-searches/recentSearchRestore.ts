import { buildLandingUrl } from "@/lib/property-search-url/buildLandingUrl";
import { buildSearchUrl } from "@/lib/property-search-url/buildSearchUrl";
import { normalizeSearchCriteria } from "@/lib/property-search-url/normalizeSearchCriteria";
import {
  CATEGORY_ID_BY_SLUG,
  CATEGORY_TRANSACTIONS,
  isSearchableCombination,
} from "@/lib/property-search-url/searchUrl.config";
import type { RecentSearch } from "@/services/recentSearches.service";

const HOME_HREF = "/";

// Restoring is a normal search url; the results page rebuilds filters and listings from it
export function getRecentSearchHref({ searchCriteria }: Pick<RecentSearch, "searchCriteria">): string {
  const criteria = normalizeSearchCriteria({ ...searchCriteria, page: 1 });

  // Stored data can outlive the taxonomy, so unknown categories go home
  if (!CATEGORY_TRANSACTIONS[criteria.category]) return HOME_HREF;

  if (!isSearchableCombination(criteria.transaction, criteria.category)) {
    return buildLandingUrl({
      category: CATEGORY_ID_BY_SLUG[criteria.category],
      cityName: criteria.cityName ?? null,
      transaction: "buy",
    });
  }

  return buildSearchUrl(criteria);
}
