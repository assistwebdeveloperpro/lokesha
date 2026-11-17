import type { SavedPropertyListing } from "./savedProperties.service";
import { apiFetch } from "./apiClient";

export type GuestSeenEntry = {
  propertyId: string;
  viewedAt: string;
};

export type SeenProperty = {
  id: string;
  propertyId: string;
  viewedAt: string;
  isAvailable: boolean;
  property: SavedPropertyListing;
};

export type SeenPropertiesQuery = {
  page: number;
  limit: number;
};

export type SeenPropertiesResponse = {
  items: SeenProperty[];
  page: number;
  limit: number;
  total: number;
};

export type RecordViewResponse = {
  recorded: boolean;
};

export type SyncSeenPropertiesResponse = {
  success: boolean;
  message: string;
};

const authHeaders = (token: string) => ({ Authorization: `Bearer ${token}` });

export function recordPropertyView(propertyId: string, token: string) {
  return apiFetch<RecordViewResponse>(`/property-search/${propertyId}/view`, {
    method: "POST",
    headers: authHeaders(token),
  });
}

export function syncSeenProperties(properties: GuestSeenEntry[], token: string) {
  return apiFetch<SyncSeenPropertiesResponse>("/user/seen-properties/sync", {
    method: "POST",
    headers: authHeaders(token),
    body: { properties },
  });
}

export function fetchSeenProperties(query: SeenPropertiesQuery, token: string) {
  const params = new URLSearchParams({
    page: String(query.page),
    limit: String(query.limit),
  });

  return apiFetch<SeenPropertiesResponse>(`/user/seen-properties?${params.toString()}`, {
    method: "GET",
    headers: authHeaders(token),
  });
}
