import { describe, expect, it } from "vitest";
import { buildSearchUrl } from "./buildSearchUrl";
import { parseSearchUrl } from "./parseSearchUrl";
import type { PropertySearchCriteria } from "./searchUrl.types";

const parse = (searchParams: Record<string, string | string[] | undefined>) =>
  parseSearchUrl({
    transaction: "property-for-sale",
    category: "residential-real-estate",
    searchParams,
  });

describe("parseSearchUrl", () => {
  it("rejects unknown transaction or category", () => {
    expect(
      parseSearchUrl({ transaction: "x", category: "residential-real-estate", searchParams: {} }),
    ).toBeNull();
    expect(
      parseSearchUrl({ transaction: "property-for-sale", category: "x", searchParams: {} }),
    ).toBeNull();
  });

  it("returns defaults for an empty query", () => {
    expect(parse({})).toEqual({
      transaction: "property-for-sale",
      category: "residential-real-estate",
      cityName: undefined,
      localities: [],
      projects: [],
      bedrooms: [],
      propertyTypes: [],
      constructionStatuses: [],
      occupancies: [],
      budgetMin: undefined,
      budgetMax: undefined,
      areaMin: undefined,
      areaMax: undefined,
      page: 1,
    });
  });

  it("accepts every category under its allowed transactions", () => {
    const cases: [string, string][] = [
      ["property-for-sale", "commercial-real-estate"],
      ["property-for-lease", "commercial-real-estate"],
      ["property-for-rent", "pg-co-living"],
      ["property-for-sale", "plot"],
      ["property-for-rent", "land"],
    ];
    for (const [transaction, category] of cases) {
      expect(parseSearchUrl({ transaction, category, searchParams: {} })).not.toBeNull();
    }
  });

  it("rejects transactions a category does not support", () => {
    const cases: [string, string][] = [
      ["property-for-lease", "residential-real-estate"],
      ["property-for-rent", "commercial-real-estate"],
      ["property-for-sale", "pg-co-living"],
    ];
    for (const [transaction, category] of cases) {
      expect(parseSearchUrl({ transaction, category, searchParams: {} })).toBeNull();
    }
  });

  it("parses area and occupancy, swapping an inverted area range", () => {
    expect(
      parseSearchUrl({
        transaction: "property-for-rent",
        category: "pg-co-living",
        searchParams: { occupancy: "single,triple-plus", areaMin: "900", areaMax: "100" },
      }),
    ).toMatchObject({
      occupancies: ["single", "triple-plus"],
      areaMin: 100,
      areaMax: 900,
    });
  });

  it("accepts spec and MagicBricks spellings", () => {
    const criteria = parse({
      bedroom: "",
      proptype: "Multistorey-Apartment,Penthouse",
      Locality: "Hathijan",
      cityName: "Ahmedabad",
      projectSocity: "shyam-swastik",
      BudgetMin: "5-Lacs",
      BudgetMax: "3-Crores",
    });

    expect(criteria).toMatchObject({
      cityName: "Ahmedabad",
      localities: ["Hathijan"],
      projects: ["shyam swastik"],
      propertyTypes: ["Multistorey-Apartment", "Penthouse"],
      budgetMin: 500_000,
      budgetMax: 30_000_000,
    });
  });

  it("restores multi-word cities", () => {
    expect(parse({ cityName: "Navi-Mumbai" })?.cityName).toBe("Navi Mumbai");
  });

  it("swaps an inverted budget range", () => {
    expect(parse({ budgetMin: "3-Crores", budgetMax: "5-Lacs" })).toMatchObject({
      budgetMin: 500_000,
      budgetMax: 30_000_000,
    });
  });

  it("drops invalid bedrooms and falls back to page 1", () => {
    expect(parse({ bedroom: "3,abc,-1,3,2", page: "0" })).toMatchObject({
      bedrooms: [2, 3],
      page: 1,
    });
  });

  it("reads repeated params and ignores unknown keys", () => {
    expect(parse({ locality: ["Bopal", "Thaltej"], utm: "x" })?.localities).toEqual([
      "Bopal",
      "Thaltej",
    ]);
  });

  it("is case-insensitive on the path", () => {
    expect(
      parseSearchUrl({
        transaction: "Property-For-Sale",
        category: "Residential-Real-Estate",
        searchParams: {},
      }),
    ).not.toBeNull();
  });

  it("round-trips a built url", () => {
    const criteria: PropertySearchCriteria = {
      transaction: "property-for-rent",
      category: "residential-real-estate",
      cityName: "Navi Mumbai",
      localities: ["South Bopal"],
      projects: ["shyam swastik"],
      bedrooms: [2, 3],
      propertyTypes: ["flat-apartment"],
      constructionStatuses: ["ready-to-move"],
      occupancies: [],
      budgetMin: 1_000_000,
      budgetMax: 15_000_000,
      areaMin: 500,
      areaMax: 3000,
      page: 2,
    };
    const url = new URL(buildSearchUrl(criteria), "http://localhost");
    const [, transaction, category] = url.pathname.split("/");

    expect(
      parseSearchUrl({
        transaction,
        category,
        searchParams: Object.fromEntries(url.searchParams),
      }),
    ).toEqual(criteria);
  });
});
