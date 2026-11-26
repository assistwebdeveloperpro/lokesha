import type { PropertyCategory, TransactionType } from "./heroBanner.shared";

export const HERO_FILTERS_STORAGE_KEY = "lokesha_hero_filters";

export type StoredHeroFilters = {
  category: PropertyCategory;
  transaction: TransactionType;
  propertyTypes: string[];
};

function isStoredHeroFilters(value: unknown): value is StoredHeroFilters {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.category === "string" &&
    typeof v.transaction === "string" &&
    Array.isArray(v.propertyTypes) &&
    v.propertyTypes.every((item) => typeof item === "string")
  );
}

export function readStoredHeroFilters(): StoredHeroFilters | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(HERO_FILTERS_STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return isStoredHeroFilters(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function storeHeroFilters(filters: StoredHeroFilters): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      HERO_FILTERS_STORAGE_KEY,
      JSON.stringify(filters),
    );
  } catch {
    // Storage can be unavailable or full; the selection then resets
  }
}
