import type { PublicSearchListing } from "@/components/landing/property-search/property-list/publicSearchListing.types";
import { apiFetch } from "./apiClient";

export type SavedPropertyListing = PublicSearchListing & { imageUrls: string[] };

export type UnavailableSavedProperty = {
  id: string;
  title: string;
  listingNumber: number;
  listingType: string;
  propertyType: string;
  locality: string;
  city: string | null;
};

export type SavedProperty = {
  id: string;
  propertyId: string;
  savedAt: string;
  isAvailable: boolean;
  property: SavedPropertyListing | UnavailableSavedProperty;
};

export type SavedPropertiesQuery = {
  page: number;
  limit: number;
};

export type SavedPropertiesResponse = {
  items: SavedProperty[];
  page: number;
  limit: number;
  total: number;
};

export type SavedPropertyIdsResponse = {
  propertyIds: string[];
};

export type SavePropertyResponse = {
  saved: boolean;
};

const authHeaders = (token: string) => ({ Authorization: `Bearer ${token}` });

export function fetchSavedProperties(query: SavedPropertiesQuery, token: string) {
  const params = new URLSearchParams({
    page: String(query.page),
    limit: String(query.limit),
  });

  return apiFetch<SavedPropertiesResponse>(`/user/saved-properties?${params.toString()}`, {
    method: "GET",
    headers: authHeaders(token),
  });
}

export function fetchSavedPropertyIds(token: string) {
  return apiFetch<SavedPropertyIdsResponse>("/user/saved-properties/ids", {
    method: "GET",
    headers: authHeaders(token),
  });
}

export function savePropertyRequest(propertyId: string, token: string) {
  return apiFetch<SavePropertyResponse>("/user/saved-properties", {
    method: "POST",
    headers: authHeaders(token),
    body: { propertyId },
  });
}

export function unsavePropertyRequest(propertyId: string, token: string) {
  return apiFetch<SavePropertyResponse>(`/user/saved-properties/${propertyId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}
