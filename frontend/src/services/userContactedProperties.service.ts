import type { PublicSearchListing } from "@/components/landing/property-search/property-list/publicSearchListing.types";
import { apiFetch } from "./apiClient";
import type { PropertyContactRole } from "./propertyContact.service";

export type ContactedAvailability = "all" | "available" | "unavailable";

export type UnavailableContactedProperty = {
  id: string;
  title: string;
  listingNumber: number;
  listingType: string;
  propertyType: string;
  locality: string;
  city: string | null;
};

export type ContactedProperty = {
  id: string;
  contactedAt: string;
  isNew: boolean;
  contactRole: PropertyContactRole;
  phoneRevealed: boolean;
  lister: { name: string | null; mobile: string | null; listedBy: string | null };
  isAvailable: boolean;
  property: PublicSearchListing | UnavailableContactedProperty;
};

export type ContactedPropertiesSummary = {
  total: number;
  available: number;
  phonesRevealed: number;
  thisWeek: number;
};

export type ContactedPropertiesQuery = {
  page: number;
  limit: number;
  availability: ContactedAvailability;
};

export type ContactedPropertiesResponse = {
  items: ContactedProperty[];
  page: number;
  limit: number;
  total: number;
  summary: ContactedPropertiesSummary;
};

export function fetchContactedProperties(query: ContactedPropertiesQuery, token: string) {
  const params = new URLSearchParams({
    page: String(query.page),
    limit: String(query.limit),
    availability: query.availability,
  });

  return apiFetch<ContactedPropertiesResponse>(`/user/contacted-properties?${params.toString()}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}
