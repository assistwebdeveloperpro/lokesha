import { describe, expect, it, vi } from "vitest";
import { ApiError } from "@/services/apiClient";
import { trackPropertyView, type TrackViewDeps } from "./trackPropertyView";

const PROPERTY_ID = "00000000-0000-4000-8000-000000000001";

function buildDeps(overrides: Partial<TrackViewDeps> = {}): TrackViewDeps {
  return {
    getToken: vi.fn(() => null),
    record: vi.fn().mockResolvedValue({ recorded: true }),
    addGuestView: vi.fn(),
    ...overrides,
  };
}

describe("trackPropertyView", () => {
  it("stores a guest view in the browser without calling the API", async () => {
    const deps = buildDeps();

    await trackPropertyView(PROPERTY_ID, deps);

    expect(deps.addGuestView).toHaveBeenCalledWith(PROPERTY_ID);
    expect(deps.record).not.toHaveBeenCalled();
  });

  it("sends a logged-in view to the backend", async () => {
    const deps = buildDeps({ getToken: vi.fn(() => "token") });

    await trackPropertyView(PROPERTY_ID, deps);

    expect(deps.record).toHaveBeenCalledWith(PROPERTY_ID, "token");
    expect(deps.addGuestView).not.toHaveBeenCalled();
  });

  it("falls back to the guest history when the session has expired", async () => {
    const deps = buildDeps({
      getToken: vi.fn(() => "stale"),
      record: vi.fn().mockRejectedValue(new ApiError("Invalid or expired token", 401)),
    });

    await trackPropertyView(PROPERTY_ID, deps);

    expect(deps.addGuestView).toHaveBeenCalledWith(PROPERTY_ID);
  });

  it("swallows other failures without touching the guest history", async () => {
    const deps = buildDeps({
      getToken: vi.fn(() => "token"),
      record: vi.fn().mockRejectedValue(new ApiError("Server error", 500)),
    });

    await expect(trackPropertyView(PROPERTY_ID, deps)).resolves.toBeUndefined();
    expect(deps.addGuestView).not.toHaveBeenCalled();
  });
});
