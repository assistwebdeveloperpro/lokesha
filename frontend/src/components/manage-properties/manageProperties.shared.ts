import type { PropertyStatus, PropertySummary } from "@/services/property.service";

export const PROPERTIES_PAGE_SIZE = 12;

export const PROPERTY_GRID_CLASS = "grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 mt-8";

export const LISTING_TYPE_LABELS: Record<string, string> = {
  sale: "For Sale",
  "rent-lease": "For Rent",
};

export const STATUS_META: Record<PropertyStatus, { label: string; className: string }> = {
  published: { label: "Published", className: "bg-emerald-100 text-emerald-700" },
  pending: { label: "Pending", className: "bg-amber-100 text-amber-700" },
  draft: { label: "Draft", className: "bg-slate-100 text-slate-600" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-700" },
};

const priceFormatter = new Intl.NumberFormat("en-IN");

export function formatPrice(value: number | null): string {
  return value === null ? "Price on request" : `₹${priceFormatter.format(value)}`;
}

export function formatPostedDate(value: string): string {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getLocationLabel(property: PropertySummary): string {
  return [property.locality, property.city].filter(Boolean).join(", ");
}

export function getEditPropertyHref(id: string): string {
  return `/post-property?edit=${id}`;
}
