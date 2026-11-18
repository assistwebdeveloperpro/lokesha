import type { PropertySearchCriteria } from "@/lib/property-search-url/searchUrl.types";
import { apiFetch } from "./apiClient";

// Page is never part of a search identity
export type RecentSearchCriteria = Omit<PropertySearchCriteria, "page">;

export type RecentSearch = {
  id: string;
  title: string;
  subtitle: string | null;
  searchCriteria: RecentSearchCriteria;
  searchUrl: string;
  searchedAt: string;
};

export type GuestSearchEntry = {
  searchCriteria: RecentSearchCriteria;
  searchUrl: string;
  searchedAt: string;
};

export type RecentSearchesQuery = {
  limit: number;
};

export type RecentSearchesResponse = {
  items: RecentSearch[];
  total: number;
};

export type CreateRecentSearchResponse = {
  item: RecentSearch;
};

export type RecentSearchesActionResponse = {
  success: boolean;
  message?: string;
};

const BASE_PATH = "/user/recent-searches";

const authHeaders = (token: string) => ({ Authorization: `Bearer ${token}` });

export function createRecentSearch(
  entry: Pick<GuestSearchEntry, "searchCriteria" | "searchUrl">,
  token: string,
) {
  return apiFetch<CreateRecentSearchResponse>(BASE_PATH, {
    method: "POST",
    headers: authHeaders(token),
    body: entry,
  });
}

export function fetchRecentSearches(query: RecentSearchesQuery, token: string) {
  const params = new URLSearchParams({ limit: String(query.limit) });

  return apiFetch<RecentSearchesResponse>(`${BASE_PATH}?${params.toString()}`, {
    method: "GET",
    headers: authHeaders(token),
  });
}

export function deleteRecentSearch(id: string, token: string) {
  return apiFetch<RecentSearchesActionResponse>(`${BASE_PATH}/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export function clearRecentSearches(token: string) {
  return apiFetch<RecentSearchesActionResponse>(BASE_PATH, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export function syncRecentSearches(searches: GuestSearchEntry[], token: string) {
  return apiFetch<RecentSearchesActionResponse>(`${BASE_PATH}/sync`, {
    method: "POST",
    headers: authHeaders(token),
    body: { searches },
  });
}
