import { describe, expect, it } from "vitest";
import { buildSearchUrl } from "./buildSearchUrl";
import { parseSearchUrl } from "./parseSearchUrl";
import { EMPTY_MORE_FILTERS } from "./moreFilters.types";
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
      saleTypes: [],
      occupancies: [],
      genders: [],
      postedBy: [],
      budgetMin: undefined,
      budgetMax: undefined,
      areaMin: undefined,
      areaMax: undefined,
      more: { ...EMPTY_MORE_FILTERS },
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

  it("parses area, occupancy and gender, swapping an inverted area range", () => {
    expect(
      parseSearchUrl({
        transaction: "property-for-rent",
        category: "pg-co-living",
        searchParams: {
          occupancy: "single,triple-plus",
          gender: "male,both",
          "area-min": "900",
          "area-max": "100",
        },
      }),
    ).toMatchObject({
      occupancies: ["single", "triple-plus"],
      genders: ["male", "both"],
      areaMin: 100,
      areaMax: 900,
    });
  });

  it("accepts spec and MagicBricks spellings", () => {
    const criteria = parse({
      bedroom: "",
      proptype: "Multistorey-Apartment,Penthouse",
      locality: "Hathijan",
      "city-name": "Ahmedabad",
      "project-socity": "shyam-swastik",
      "min-price": "500000",
      "max-price": "30000000",
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
    expect(parse({ "city-name": "Navi-Mumbai" })?.cityName).toBe("Navi Mumbai");
  });

  it("swaps an inverted budget range", () => {
    expect(parse({ "min-price": "30000000", "max-price": "500000" })).toMatchObject({
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

  it("parses more filter params with hyphenated keys", () => {
    expect(
      parse({
        "posted-since": "7d",
        amenity: "lift,gym",
        "has-rera": "1",
        "corner-plot": "true",
      }),
    ).toMatchObject({
      more: {
        postedSince: "7d",
        amenities: ["lift", "gym"],
        hasRera: true,
        cornerPlot: true,
      },
    });
  });

  it("parses PostedBy roles and owner alias", () => {
    expect(parse({ "posted-by": "agent,builder" })?.postedBy).toEqual([
      "agent",
      "builder",
    ]);
    expect(parse({ "posted-by": "owner" })?.postedBy).toEqual([
      "buyer_owner_tenant",
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
      saleTypes: [],
      occupancies: [],
      genders: [],
      postedBy: ["agent", "builder"],
      budgetMin: 1_000_000,
      budgetMax: 15_000_000,
      areaMin: 500,
      areaMax: 3000,
      more: { ...EMPTY_MORE_FILTERS },
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
