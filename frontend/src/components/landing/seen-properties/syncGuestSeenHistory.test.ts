import { describe, expect, it, vi } from "vitest";
import type { GuestSeenEntry } from "@/services/seenProperties.service";
import { syncGuestSeenHistory, type GuestSyncDeps } from "./syncGuestSeenHistory";

const ENTRIES: GuestSeenEntry[] = [
  { propertyId: "00000000-0000-4000-8000-000000000001", viewedAt: "2026-11-17T10:30:00.000Z" },
];

function buildDeps(overrides: Partial<GuestSyncDeps> = {}): GuestSyncDeps {
  return {
    readHistory: vi.fn(() => ENTRIES),
    clearHistory: vi.fn(),
    sync: vi.fn().mockResolvedValue({ success: true }),
    ...overrides,
  };
}

describe("syncGuestSeenHistory", () => {
  it("sends the guest history and clears it after success", async () => {
    const deps = buildDeps();

    await expect(syncGuestSeenHistory("token", deps)).resolves.toBe("synced");

    expect(deps.sync).toHaveBeenCalledWith(ENTRIES, "token");
    expect(deps.clearHistory).toHaveBeenCalledTimes(1);
  });

  it("keeps the guest history when the request fails", async () => {
    const deps = buildDeps({ sync: vi.fn().mockRejectedValue(new Error("network")) });

    await expect(syncGuestSeenHistory("token", deps)).resolves.toBe("failed");

    expect(deps.clearHistory).not.toHaveBeenCalled();
  });

  it("skips the request when there is no guest history", async () => {
    const deps = buildDeps({ readHistory: vi.fn(() => []) });

    await expect(syncGuestSeenHistory("token", deps)).resolves.toBe("skipped");

    expect(deps.sync).not.toHaveBeenCalled();
    expect(deps.clearHistory).not.toHaveBeenCalled();
  });

  it("shares one request between parallel calls", async () => {
    const deps = buildDeps();

    await Promise.all([syncGuestSeenHistory("token", deps), syncGuestSeenHistory("token", deps)]);

    expect(deps.sync).toHaveBeenCalledTimes(1);
  });

  it("retries on a later call after a failure", async () => {
    const sync = vi.fn().mockRejectedValueOnce(new Error("network")).mockResolvedValue({});
    const deps = buildDeps({ sync });

    await syncGuestSeenHistory("token", deps);
    await expect(syncGuestSeenHistory("token", deps)).resolves.toBe("synced");

    expect(sync).toHaveBeenCalledTimes(2);
  });
});
