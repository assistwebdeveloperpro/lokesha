import { describe, expect, it } from "vitest";
import { buildSearchUrl } from "./buildSearchUrl";
import { parseSearchUrl } from "./parseSearchUrl";
import { EMPTY_MORE_FILTERS } from "./moreFilters.types";
import type { PropertySearchCriteria } from "./searchUrl.types";

const SLUG = "buy-flats-in-ahmedabad";

const parse = (searchParams: Record<string, string | string[] | undefined>) =>
  parseSearchUrl({ slug: SLUG, searchParams });

describe("parseSearchUrl", () => {
  it("rejects unknown or incomplete slugs", () => {
    for (const slug of [
      "x",
      "buy-flats-in-",
      "buy-in-ahmedabad",
      "buy-flats-ahmedabad",
      "sell-flats-in-pune",
    ]) {
      expect(parseSearchUrl({ slug, searchParams: {} })).toBeNull();
    }
  });

  it("returns defaults for an empty query", () => {
    expect(parse({})).toEqual({
      transaction: "property-for-sale",
      category: "residential-real-estate",
      cityName: "Ahmedabad",
      localities: [],
      projects: [],
      builders: [],
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

  it("resolves every slug to its transaction and category", () => {
    const cases: [string, string, string][] = [
      ["rent-flats-in-pune","property-for-rent", "residential-real-estate"],
      ["commercial-properties-for-sale-in-pune", "property-for-sale", "commercial-real-estate"],
      ["commercial-properties-for-lease-in-pune", "property-for-lease", "commercial-real-estate"],
      ["pg-in-pune", "property-for-rent", "pg-co-living"],
      ["plots-for-sale-in-pune", "property-for-sale", "plot"],
      ["plots-for-rent-in-pune", "property-for-rent", "plot"],
      ["lands-for-sale-in-pune", "property-for-sale", "land"],
      ["lands-for-rent-in-pune", "property-for-rent", "land"],
    ];
    for (const [slug, transaction, category] of cases) {
      expect(parseSearchUrl({ slug, searchParams: {} })).toMatchObject({
        transaction,
        category,
        cityName: "Pune",
      });
    }
  });

  it("reads the city after the property type words", () => {
    expect(
      parseSearchUrl({
        slug: "buy-flats-bungalows-penthouse-in-navi-mumbai",
        searchParams: {},
      })?.cityName,
    ).toBe("Navi Mumbai");
  });

  it("maps india to no city", () => {
    expect(
      parseSearchUrl({ slug: "pg-in-india", searchParams: {} })?.cityName,
    ).toBeUndefined();
  });

  it("restores multi-word cities and falls back to title case for unknown ones", () => {
    expect(
      parseSearchUrl({ slug: "pg-in-navi-mumbai", searchParams: {} })?.cityName,
    ).toBe("Navi Mumbai");
    expect(
      parseSearchUrl({ slug: "pg-in-some-town", searchParams: {} })?.cityName,
    ).toBe("Some Town");
  });

  it("parses area, occupancy and gender, swapping an inverted area range", () => {
    expect(
      parseSearchUrl({
        slug: "pg-in-pune",
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
      parseSearchUrl({ slug: "Buy-Flats-In-Ahmedabad-For-Sale", searchParams: {} }),
    ).not.toBeNull();
  });

  it("round-trips a built url", () => {
    const criteria: PropertySearchCriteria = {
      transaction: "property-for-rent",
      category: "residential-real-estate",
      cityName: "Navi Mumbai",
      localities: ["South Bopal"],
      projects: ["shyam swastik"],
      builders: [],
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
    const [, , slug] = url.pathname.split("/");

    expect(
      parseSearchUrl({
        slug,
        searchParams: Object.fromEntries(url.searchParams),
      }),
    ).toEqual(criteria);
  });
});
