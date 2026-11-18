import { describe, expect, it } from "vitest";
import {
  normalizeRecentSearchCriteria,
  toRecentSearchKey,
} from "./normalizeRecentSearchCriteria";

const criteria = {
  transaction: "property-for-sale" as const,
  category: "residential-real-estate" as const,
  cityName: "Ahmedabad",
  localities: ["Bopal", "GIFT City"],
  projects: [],
  bedrooms: [3, 2],
  more: { postedSince: "", amenities: [] },
  page: 1,
};

describe("normalizeRecentSearchCriteria", () => {
  it("drops page and empty values and canonicalises the rest", () => {
    expect(normalizeRecentSearchCriteria(criteria)).toEqual({
      transaction: "property-for-sale",
      category: "residential-real-estate",
      cityName: "ahmedabad",
      localities: ["bopal", "gift city"],
      bedrooms: [2, 3],
    });
  });

  it("keeps meaningful booleans and zero", () => {
    expect(
      normalizeRecentSearchCriteria({
        budgetMin: 0,
        more: { hasRera: true, hasPhotos: false },
      } as never),
    ).toEqual({ budgetMin: 0, more: { hasPhotos: false, hasRera: true } });
  });

  it("does not mutate the input", () => {
    normalizeRecentSearchCriteria(criteria);

    expect(criteria.localities).toEqual(["Bopal", "GIFT City"]);
    expect(criteria.page).toBe(1);
  });
});

describe("toRecentSearchKey", () => {
  it("ignores array order, casing, key order and page", () => {
    const reordered = {
      page: 4,
      bedrooms: [2, 3],
      localities: ["gift city", " BOPAL "],
      cityName: "ahmedabad",
      category: "residential-real-estate" as const,
      transaction: "property-for-sale" as const,
    };

    expect(toRecentSearchKey(reordered)).toBe(toRecentSearchKey(criteria));
  });

  it("changes when a filter changes", () => {
    expect(toRecentSearchKey({ ...criteria, bedrooms: [2] })).not.toBe(
      toRecentSearchKey(criteria),
    );
  });
});
