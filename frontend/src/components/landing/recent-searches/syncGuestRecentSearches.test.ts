import { describe, expect, it, vi } from "vitest";
import type { GuestSearchEntry } from "@/services/recentSearches.service";
import { syncGuestRecentSearches, type GuestSyncDeps } from "./syncGuestRecentSearches";

const entry = { searchUrl: "/x", searchedAt: "2026-11-18T10:00:00.000Z" } as GuestSearchEntry;

function buildDeps(overrides: Partial<GuestSyncDeps> = {}): GuestSyncDeps {
  return {
    readSearches: () => [entry],
    clearSearches: vi.fn(),
    sync: vi.fn().mockResolvedValue({ success: true }),
    onSynced: vi.fn(),
    ...overrides,
  };
}

describe("syncGuestRecentSearches", () => {
  it("sends the guest searches and clears them after success", async () => {
    const deps = buildDeps();

    await expect(syncGuestRecentSearches("token", deps)).resolves.toBe("synced");

    expect(deps.sync).toHaveBeenCalledWith([entry], "token");
    expect(deps.clearSearches).toHaveBeenCalled();
    expect(deps.onSynced).toHaveBeenCalled();
  });

  it("keeps the guest searches when the request fails", async () => {
    const deps = buildDeps({ sync: vi.fn().mockRejectedValue(new Error("offline")) });

    await expect(syncGuestRecentSearches("token", deps)).resolves.toBe("failed");

    expect(deps.clearSearches).not.toHaveBeenCalled();
    expect(deps.onSynced).not.toHaveBeenCalled();
  });

  it("skips the call when there is nothing to sync", async () => {
    const deps = buildDeps({ readSearches: () => [] });

    await expect(syncGuestRecentSearches("token", deps)).resolves.toBe("skipped");

    expect(deps.sync).not.toHaveBeenCalled();
  });

  it("shares one request between parallel callers", async () => {
    const deps = buildDeps();

    await Promise.all([syncGuestRecentSearches("token", deps), syncGuestRecentSearches("token", deps)]);

    expect(deps.sync).toHaveBeenCalledTimes(1);
  });
});
