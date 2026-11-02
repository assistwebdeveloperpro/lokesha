import type { PublicSearchPostedBy } from "@/components/landing/property-search/property-list/publicSearchListing.types";

export function propertyContactDisplayName(
  postedBy: PublicSearchPostedBy,
  name: string | null | undefined,
): string {
  if (name?.trim()) return name.trim();
  if (postedBy === "owner") return "Property owner";
  if (postedBy === "dealer") return "Real estate agent";
  return "Property developer";
}
