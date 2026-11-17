import type { PublicSearchListing } from "@/components/landing/property-search/property-list/publicSearchListing.types";
import { buildPropertyDetailsUrl } from "@/lib/property-search-url/propertyDetailsUrl";
import type { PropertyContactRole } from "@/services/propertyContact.service";
import type { ContactedAvailability, ContactedProperty } from "@/services/userContactedProperties.service";

export const CONTACTED_PAGE_SIZE = 10;

export const CONTACTED_TABS: { value: ContactedAvailability; label: string }[] = [
  { value: "all", label: "All" },
  { value: "available", label: "Available" },
  { value: "unavailable", label: "No longer available" },
];

export const CONTACTED_TABLE_COLUMNS = [
  "Property",
  "Price & Area",
  "Contact Person",
  "Contacted",
  "Status",
  "Action",
] as const;

// Shared by header, rows and skeleton so the columns always line up
export const CONTACTED_GRID_CLASS =
  "grid grid-cols-[1.5fr_1.5fr_1.1fr_0.9fr_0.7fr_0.9fr] text-nowrap items-center gap-4";

export const CONTACTED_TABLE_MIN_WIDTH_CLASS = "min-w-[1100px]";

export const CONTACT_ROLE_LABEL: Record<PropertyContactRole, string> = {
  owner: "Owner",
  agent: "Agent",
  builder: "Builder",
};

export const CONTACTED_EMPTY_STATES: Record<"all" | "filtered", { title: string; description: string }> = {
  all: {
    title: "No contacted properties yet",
    description: "Properties you contact will appear here so you can follow up on them anytime.",
  },
  filtered: {
    title: "Nothing in this view",
    description: "No contacted properties match this filter. Try another tab.",
  },
};

const DATE_FORMAT = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });
const TIME_FORMAT = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" });

export function formatContactedAt(iso: string): string {
  const date = new Date(iso);
  return `${DATE_FORMAT.format(date)}, ${TIME_FORMAT.format(date)}`;
}

// "flat-apartment" -> "Flat apartment"
export function humanizeSlug(value: string): string {
  const text = value.replace(/[-_]+/g, " ").trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function isSearchListing(
  property: ContactedProperty["property"],
): property is PublicSearchListing {
  return "imageUrl" in property;
}

export function getPropertyLocation(property: ContactedProperty["property"]): string {
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
