import { syncRecentSearches, type GuestSearchEntry } from "@/services/recentSearches.service";
import { clearGuestSearches, readGuestSearches, toGuestSearchEntry } from "./guestRecentSearches";
import { refreshRecentSearches } from "./recentSearchesStore";

export type GuestSyncResult = "synced" | "skipped" | "failed";

export type GuestSyncDeps = {
  readSearches: () => GuestSearchEntry[];
  clearSearches: () => void;
  sync: (entries: GuestSearchEntry[], token: string) => Promise<unknown>;
  onSynced: () => void;
};

const defaultDeps: GuestSyncDeps = {
  readSearches: () => readGuestSearches().map(toGuestSearchEntry),
  clearSearches: () => clearGuestSearches(),
  sync: syncRecentSearches,
  onSynced: () => void refreshRecentSearches(),
};

let inFlight: Promise<GuestSyncResult> | null = null;

// Guest searches are cleared only after the server confirmed the merge
async function run(token: string, deps: GuestSyncDeps): Promise<GuestSyncResult> {
  const entries = deps.readSearches();
  if (entries.length === 0) return "skipped";

  try {
    await deps.sync(entries, token);
  } catch {
    return "failed";
  }

  deps.clearSearches();
  deps.onSynced();
  return "synced";
}

// Parallel callers share one request, so a history is never sent twice
export function syncGuestRecentSearches(
  token: string,
  deps: GuestSyncDeps = defaultDeps,
): Promise<GuestSyncResult> {
  if (!inFlight) {
    inFlight = run(token, deps).finally(() => {
      inFlight = null;
    });
  }

  return inFlight;
}
