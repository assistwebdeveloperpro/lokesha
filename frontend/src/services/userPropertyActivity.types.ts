import type { PublicSearchListing } from "@/components/landing/property-search/property-list/publicSearchListing.types";

// Summary kept for a property that is no longer published
export type UnavailableProperty = {
  id: string;
  title: string;
  listingNumber: number;
  listingType: string;
  propertyType: string;
  locality: string;
  city: string | null;
};

export type ActivityProperty = PublicSearchListing | UnavailableProperty;
