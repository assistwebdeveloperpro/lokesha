import type { GuestSeenEntry } from "@/services/seenProperties.service";

export const GUEST_SEEN_STORAGE_KEY = "lokesha_recently_viewed_properties";
export const MAX_GUEST_SEEN_PROPERTIES = 50;

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Storage can be missing or blocked (SSR, private mode)
function getBrowserStorage(): StorageLike | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

function isValidEntry(value: unknown): value is GuestSeenEntry {
  if (typeof value !== "object" || value === null) return false;

  const { propertyId, viewedAt } = value as Partial<GuestSeenEntry>;
  return (
    typeof propertyId === "string" &&
    UUID_PATTERN.test(propertyId) &&
    typeof viewedAt === "string" &&
    !Number.isNaN(Date.parse(viewedAt))
  );
}

// Latest first, one entry per property, capped to the limit
function normalizeEntries(entries: GuestSeenEntry[]): GuestSeenEntry[] {
  const newestById = entries.reduce((acc, entry) => {
    const current = acc.get(entry.propertyId);
    return current && Date.parse(current.viewedAt) >= Date.parse(entry.viewedAt)
      ? acc
      : acc.set(entry.propertyId, entry);
  }, new Map<string, GuestSeenEntry>());

  return [...newestById.values()]
    .sort((a, b) => Date.parse(b.viewedAt) - Date.parse(a.viewedAt))
    .slice(0, MAX_GUEST_SEEN_PROPERTIES);
}

export function readGuestHistory(storage: StorageLike | null = getBrowserStorage()): GuestSeenEntry[] {
  if (!storage) return [];

  try {
    const parsed: unknown = JSON.parse(storage.getItem(GUEST_SEEN_STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? normalizeEntries(parsed.filter(isValidEntry)) : [];
  } catch {
    return [];
  }
}

export function addGuestView(
  propertyId: string,
  now: Date = new Date(),
  storage: StorageLike | null = getBrowserStorage(),
): void {
  if (!storage || !UUID_PATTERN.test(propertyId)) return;

  const entries = normalizeEntries([
    { propertyId, viewedAt: now.toISOString() },
    ...readGuestHistory(storage),
  ]);

  try {
    storage.setItem(GUEST_SEEN_STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Quota or blocked storage: tracking is best effort
  }
}

export function clearGuestHistory(storage: StorageLike | null = getBrowserStorage()): void {
  try {
    storage?.removeItem(GUEST_SEEN_STORAGE_KEY);
  } catch {
    // Nothing to clean when storage is blocked
  }
}
