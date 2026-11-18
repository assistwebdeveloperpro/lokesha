import { describe, expect, it, vi } from "vitest";
import { EMPTY_MORE_FILTERS } from "@/lib/property-search-url/moreFilters.types";
import type { PropertySearchCriteria } from "@/lib/property-search-url/searchUrl.types";
import { ApiError } from "@/services/apiClient";
import { recordRecentSearch, type RecordRecentSearchDeps } from "./recordRecentSearch";

const criteria: PropertySearchCriteria = {
  transaction: "property-for-sale",
  category: "residential-real-estate",
  cityName: "Ahmedabad",
  localities: [],
  projects: [],
  bedrooms: [],
  propertyTypes: [],
  constructionStatuses: [],
  saleTypes: [],
  occupancies: [],
  genders: [],
  postedBy: [],
  more: { ...EMPTY_MORE_FILTERS },
  page: 3,
};

function buildDeps(overrides: Partial<RecordRecentSearchDeps> = {}): RecordRecentSearchDeps {
  return {
    getToken: () => "token",
    create: vi.fn().mockResolvedValue({}),
    addGuestSearch: vi.fn(),
    notify: vi.fn(),
    ...overrides,
  };
}

describe("recordRecentSearch", () => {
  it("sends the search without page to the api for a logged-in user", async () => {
    const deps = buildDeps();

    await recordRecentSearch(criteria, deps);

    expect(deps.create).toHaveBeenCalledTimes(1);
    const [entry, token] = vi.mocked(deps.create).mock.calls[0];
    expect(token).toBe("token");
    expect(entry.searchCriteria).not.toHaveProperty("page");
    expect(entry.searchUrl.startsWith("/")).toBe(true);
    expect(deps.addGuestSearch).not.toHaveBeenCalled();
    expect(deps.notify).toHaveBeenCalled();
  });

  it("stores the search in the browser for a guest", async () => {
    const deps = buildDeps({ getToken: () => null });

    await recordRecentSearch(criteria, deps);

    expect(deps.addGuestSearch).toHaveBeenCalledWith(criteria);
    expect(deps.create).not.toHaveBeenCalled();
    expect(deps.notify).toHaveBeenCalled();
  });

  it("falls back to the browser when the session expired", async () => {
    const deps = buildDeps({ create: vi.fn().mockRejectedValue(new ApiError("Unauthorized", 401)) });

    await recordRecentSearch(criteria, deps);

    expect(deps.addGuestSearch).toHaveBeenCalledWith(criteria);
  });

  it("swallows other api failures", async () => {
    const deps = buildDeps({ create: vi.fn().mockRejectedValue(new ApiError("Boom", 500)) });

    await expect(recordRecentSearch(criteria, deps)).resolves.toBeUndefined();
    expect(deps.addGuestSearch).not.toHaveBeenCalled();
  });

  it("never throws, even when storage or the session fails", async () => {
    const deps = buildDeps({
      getToken: () => {
        throw new Error("storage blocked");
      },
    });

    await expect(recordRecentSearch(criteria, deps)).resolves.toBeUndefined();
  });
});
