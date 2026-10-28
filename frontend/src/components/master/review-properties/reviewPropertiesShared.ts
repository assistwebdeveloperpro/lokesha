import type { ReviewStatus } from "@/services/propertyReview.service";

export const PAGE_SIZE = 12;

export const REVIEW_EMPTY_STATES: Record<
  ReviewStatus,
  { title: string; description: string }
> = {
  pending: {
    title: "Nothing in the queue",
    description: "No properties are waiting for review. New submissions will appear here.",
  },
  published: {
    title: "No published listings",
    description: "Properties you approve will show up in this list.",
  },
  rejected: {
    title: "No rejected listings",
    description: "Properties declined during review will be listed here.",
  },
  closed: {
    title: "No closed listings",
    description: "Closed properties will appear here when owners mark them inactive.",
  },
};

// "carpetAreaUnit" -> "Carpet area unit"
export function humanizeKey(key: string): string {
  const words = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function formatValue(value: unknown): string {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

// Entries worth showing: empty values and false flags say nothing to a reviewer
export function toDisplayEntries(fields: Record<string, unknown> | undefined): { label: string; value: string }[] {
  return Object.entries(fields ?? {})
    .filter(([, value]) => value !== "" && value !== null && value !== undefined && value !== false)
    .filter(([, value]) => !Array.isArray(value) || value.length > 0)
    .filter(([, value]) => typeof value !== "object" || Array.isArray(value))
    .map(([key, value]) => ({ label: humanizeKey(key), value: formatValue(value) }));
}
