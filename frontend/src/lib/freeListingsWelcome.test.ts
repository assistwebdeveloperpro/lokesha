import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildFreeListingsWelcome, loadFreeListingsWelcome } from "./freeListingsWelcome";

const mocks = vi.hoisted(() => ({ fetchCreditAvailability: vi.fn() }));

vi.mock("@/services/userSubscription.service", () => ({ fetchCreditAvailability: mocks.fetchCreditAvailability }));

describe("buildFreeListingsWelcome", () => {
  it("states how many free listings the user has", () => {
    expect(buildFreeListingsWelcome(2)).toBe("Welcome to Lokesha! You have 2 free listings.");
    expect(buildFreeListingsWelcome(1)).toBe("Welcome to Lokesha! You have 1 free listing.");
  });

  it("says nothing when there are no credits", () => {
    expect(buildFreeListingsWelcome(0)).toBeNull();
  });
});

describe("loadFreeListingsWelcome", () => {
  beforeEach(() => {
    mocks.fetchCreditAvailability.mockReset();
  });

  it("reads the credits of the new account", async () => {
    mocks.fetchCreditAvailability.mockResolvedValue({ available: 2, reserved: 0, submittable: 2 });

    await expect(loadFreeListingsWelcome("token")).resolves.toBe("Welcome to Lokesha! You have 2 free listings.");
    expect(mocks.fetchCreditAvailability).toHaveBeenCalledWith("token");
  });

  it("shows nothing when the lookup fails", async () => {
    mocks.fetchCreditAvailability.mockRejectedValue(new Error("network"));

    await expect(loadFreeListingsWelcome("token")).resolves.toBeNull();
  });
});
