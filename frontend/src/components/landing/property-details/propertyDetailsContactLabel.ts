import type { PublicSearchPostedBy } from "@/components/landing/property-search/property-list/publicSearchListing.types";

export function propertyDetailsContactLabel(postedBy: PublicSearchPostedBy): string {
  if (postedBy === "owner") return "Contact Owner";
  if (postedBy === "dealer") return "Contact Agent";
  return "Contact Builder";
}
