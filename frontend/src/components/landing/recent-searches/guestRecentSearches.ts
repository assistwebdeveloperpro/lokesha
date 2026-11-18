import { buildSearchUrl } from "@/lib/property-search-url/buildSearchUrl";
import type { PropertySearchCriteria } from "@/lib/property-search-url/searchUrl.types";
import {
  buildRecentSearchSubtitle,
  buildRecentSearchTitle,
} from "@/lib/recent-searches/buildSearchTitle";
import {
  toRecentSearchCriteria,
  toRecentSearchKey,
} from "@/lib/recent-searches/normalizeRecentSearchCriteria";
import type {
  GuestSearchEntry,
  RecentSearch,
  RecentSearchCriteria,
} from "@/services/recentSearches.service";

export const GUEST_RECENT_SEARCHES_STORAGE_KEY = "lokesha_recent_searches";
export const MAX_GUEST_RECENT_SEARCHES = 20;

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type GuestSearchRecord = {
  key: string;
  searchCriteria: RecentSearchCriteria;
  searchUrl: string;
  title: string;
  subtitle: string | null;
  searchedAt: string;
};

// Storage can be missing or blocked (SSR, private mode)
function getBrowserStorage(): StorageLike | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

function isValidRecord(value: unknown): value is GuestSearchRecord {
  if (typeof value !== "object" || value === null) return false;

  const { key, searchCriteria, searchUrl, title, subtitle, searchedAt } =
    value as Partial<GuestSearchRecord>;
  return (
    typeof key === "string" &&
    typeof searchCriteria === "object" &&
    searchCriteria !== null &&
    typeof searchCriteria.transaction === "string" &&
    typeof searchCriteria.category === "string" &&
    typeof searchUrl === "string" &&
    searchUrl.startsWith("/") &&
    typeof title === "string" &&
    (subtitle === null || typeof subtitle === "string") &&
    typeof searchedAt === "string" &&
    !Number.isNaN(Date.parse(searchedAt))
  );
}

// Latest first, one record per search, capped to the limit
function normalizeRecords(records: GuestSearchRecord[]): GuestSearchRecord[] {
  const newestByKey = records.reduce((acc, record) => {
    const current = acc.get(record.key);
    return current && Date.parse(current.searchedAt) >= Date.parse(record.searchedAt)
      ? acc
      : acc.set(record.key, record);
  }, new Map<string, GuestSearchRecord>());

  return [...newestByKey.values()]
    .sort((a, b) => Date.parse(b.searchedAt) - Date.parse(a.searchedAt))
    .slice(0, MAX_GUEST_RECENT_SEARCHES);
}

function writeRecords(records: GuestSearchRecord[], storage: StorageLike | null): void {
  try {
    storage?.setItem(GUEST_RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(records));
  } catch {
    // Quota or blocked storage: tracking is best effort
  }
}

export function readGuestSearches(
  storage: StorageLike | null = getBrowserStorage(),
): GuestSearchRecord[] {
  if (!storage) return [];

  try {
    const parsed: unknown = JSON.parse(
      storage.getItem(GUEST_RECENT_SEARCHES_STORAGE_KEY) ?? "[]",
    );
    return Array.isArray(parsed) ? normalizeRecords(parsed.filter(isValidRecord)) : [];
  } catch {
    return [];
  }
}

export function addGuestSearch(
  criteria: PropertySearchCriteria,
  now: Date = new Date(),
  storage: StorageLike | null = getBrowserStorage(),
): void {
  if (!storage) return;

  const searchCriteria = toRecentSearchCriteria(criteria);
  const record: GuestSearchRecord = {
    key: toRecentSearchKey(searchCriteria),
    searchCriteria,
    searchUrl: buildSearchUrl({ ...criteria, page: 1 }),
    title: buildRecentSearchTitle(searchCriteria),
    subtitle: buildRecentSearchSubtitle(searchCriteria),
    searchedAt: now.toISOString(),
  };

  writeRecords(normalizeRecords([record, ...readGuestSearches(storage)]), storage);
}

export function removeGuestSearch(
  key: string,
  storage: StorageLike | null = getBrowserStorage(),
): void {
  writeRecords(
    readGuestSearches(storage).filter((record) => record.key !== key),
    storage,
  );
}

export function clearGuestSearches(storage: StorageLike | null = getBrowserStorage()): void {
  try {
    storage?.removeItem(GUEST_RECENT_SEARCHES_STORAGE_KEY);
  } catch {
    // Nothing to clean when storage is blocked
  }
}

// Same shape as a stored search, so the UI renders both alike
export const toRecentSearch = (record: GuestSearchRecord): RecentSearch => ({
  id: record.key,
  title: record.title,
  subtitle: record.subtitle,
  searchCriteria: record.searchCriteria,
  searchUrl: record.searchUrl,
  searchedAt: record.searchedAt,
});

export const toGuestSearchEntry = (record: GuestSearchRecord): GuestSearchEntry => ({
  searchCriteria: record.searchCriteria,
  searchUrl: record.searchUrl,
  searchedAt: record.searchedAt,
});
