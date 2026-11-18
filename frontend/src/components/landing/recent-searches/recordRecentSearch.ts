import { buildSearchUrl } from "@/lib/property-search-url/buildSearchUrl";
import type { PropertySearchCriteria } from "@/lib/property-search-url/searchUrl.types";
import { toRecentSearchCriteria } from "@/lib/recent-searches/normalizeRecentSearchCriteria";
import { ApiError } from "@/services/apiClient";
import { createRecentSearch } from "@/services/recentSearches.service";
import { getToken } from "@/services/session";
import { addGuestSearch } from "./guestRecentSearches";
import { notifyRecentSearchRecorded } from "./recentSearchesStore";

export type RecordRecentSearchDeps = {
  getToken: () => string | null;
  create: typeof createRecentSearch;
  addGuestSearch: (criteria: PropertySearchCriteria) => void;
  notify: () => void;
};

const defaultDeps: RecordRecentSearchDeps = {
  getToken,
  create: createRecentSearch,
  addGuestSearch: (criteria) => addGuestSearch(criteria),
  notify: notifyRecentSearchRecorded,
};

// Single entry point for every submitted search; never throws and never blocks navigation
export async function recordRecentSearch(
  criteria: PropertySearchCriteria,
  deps: RecordRecentSearchDeps = defaultDeps,
): Promise<void> {
  try {
    const token = deps.getToken();

    if (!token) {
      deps.addGuestSearch(criteria);
    } else {
      await deps
        .create(
          {
            searchCriteria: toRecentSearchCriteria(criteria),
            searchUrl: buildSearchUrl({ ...criteria, page: 1 }),
          },
          token,
        )
        .catch((error: unknown) => {
          // An expired session is a guest again; the search is merged on the next login
          if (error instanceof ApiError && error.status === 401) deps.addGuestSearch(criteria);
        });
    }

    deps.notify();
  } catch {
    // History is best effort and must never break a search
  }
}
