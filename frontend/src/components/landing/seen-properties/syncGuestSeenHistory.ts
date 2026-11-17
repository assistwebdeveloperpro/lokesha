import { syncSeenProperties, type GuestSeenEntry } from "@/services/seenProperties.service";
import { clearGuestHistory, readGuestHistory } from "./guestSeenHistory";

export type GuestSyncResult = "synced" | "skipped" | "failed";

export type GuestSyncDeps = {
  readHistory: () => GuestSeenEntry[];
  clearHistory: () => void;
  sync: (entries: GuestSeenEntry[], token: string) => Promise<unknown>;
};

const defaultDeps: GuestSyncDeps = {
  readHistory: () => readGuestHistory(),
  clearHistory: () => clearGuestHistory(),
  sync: syncSeenProperties,
};

let inFlight: Promise<GuestSyncResult> | null = null;

// Guest history is cleared only after the server confirmed the merge
async function run(token: string, deps: GuestSyncDeps): Promise<GuestSyncResult> {
  const entries = deps.readHistory();
  if (entries.length === 0) return "skipped";

  try {
    await deps.sync(entries, token);
  } catch {
    return "failed";
  }

  deps.clearHistory();
  return "synced";
}

// Parallel callers share one request, so a history is never sent twice
export function syncGuestSeenHistory(
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
