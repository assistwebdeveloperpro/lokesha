import type { PublicSearchListing } from "@/components/landing/property-search/property-list/publicSearchListing.types";
import { buildPropertyDetailsUrl } from "@/lib/property-search-url/propertyDetailsUrl";
import type { PropertyContactRole } from "@/services/propertyContact.service";
import type { ActivityProperty } from "@/services/userPropertyActivity.types";

export const CONTACT_ROLE_LABEL: Record<PropertyContactRole, string> = {
  owner: "Owner",
  agent: "Agent",
  builder: "Builder",
};

const DATE_FORMAT = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });
const TIME_FORMAT = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" });

export function formatActivityDateTime(iso: string): string {
  const date = new Date(iso);
  return `${DATE_FORMAT.format(date)}, ${TIME_FORMAT.format(date)}`;
}

// "flat-apartment" -> "Flat apartment"
export function humanizeSlug(value: string): string {
  const text = value.replace(/[-_]+/g, " ").trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function isSearchListing(property: ActivityProperty): property is PublicSearchListing {
  return "imageUrl" in property;
}

export function getPropertyLocation(property: ActivityProperty): string {
  return [property.locality, property.city].filter(Boolean).join(", ");
}

export function getViewPropertyHref(property: PublicSearchListing): string {
  return buildPropertyDetailsUrl({
    id: property.id,
    bedrooms: property.bedrooms,
    carpetArea: property.carpetAreaMin,
    carpetAreaUnit: property.carpetAreaUnit,
    propertySubType: property.propertySubType,
    propertyType: property.propertyType,
    listingType: property.listingType,
    locality: property.locality,
    city: property.city,
  });
}

export function getListingTypeLabel(listingType: string): string {
  return listingType === "sale" ? "Sale" : "Rent";
}
