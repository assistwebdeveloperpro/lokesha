import { describe, expect, it } from "vitest";
import { buildLandingUrl } from "./buildLandingUrl";
import { parseLandingUrl } from "./parseLandingUrl";

const knownCities = ["Ahmedabad", "Navi Mumbai"];

describe("buildLandingUrl", () => {
  it("builds the default city landing url for buy", () => {
    expect(
      buildLandingUrl({
        category: "residential",
        cityName: "Ahmedabad",
        transaction: "buy",
      }),
    ).toBe(
      "/property-for-sale-rent-in-ahmedabad/residential-real-estate-ahmedabad?category=s",
    );
  });

  it("uses category=r for rent", () => {
    expect(
      buildLandingUrl({
        category: "residential",
        cityName: "Gandhinagar",
        transaction: "rent",
      }),
    ).toBe(
      "/property-for-sale-rent-in-gandhinagar/residential-real-estate-gandhinagar?category=r",
    );
  });

  it("hyphenates multi-word cities and handles All India", () => {
    expect(
      buildLandingUrl({
        category: "commercial",
        cityName: "Navi Mumbai",
        transaction: "lease",
      }),
    ).toBe(
      "/property-for-sale-rent-in-navi-mumbai/commercial-real-estate-navi-mumbai?category=l",
    );
    expect(
      buildLandingUrl({ category: "plot", cityName: null, transaction: "buy" }),
    ).toBe("/property-for-sale-rent-in-india/plot-india?category=s");
  });

  it("omits the param when there is no transaction", () => {
    expect(
      buildLandingUrl({
        category: "pg-co-living",
        cityName: "Pune",
        transaction: null,
      }),
    ).toBe("/property-for-sale-rent-in-pune/pg-co-living-pune");
  });
});

describe("parseLandingUrl", () => {
  it("parses the spec url", () => {
    expect(
      parseLandingUrl({
        locationSlug: "property-for-sale-rent-in-Ahmedabad",
        categorySlug: "residential-real-estate-Ahmedabad",
        transactionCode: "R",
        knownCities,
      }),
    ).toEqual({
      category: "residential",
      cityName: "Ahmedabad",
      transaction: "rent",
    });
  });

  it("defaults to buy for a missing or unknown code", () => {
    for (const transactionCode of [undefined, "X"]) {
      expect(
        parseLandingUrl({
          locationSlug: "property-for-sale-rent-in-Ahmedabad",
          categorySlug: "residential-real-estate-Ahmedabad",
          transactionCode,
          knownCities,
        })?.transaction,
      ).toBe("buy");
    }
  });

  it("round-trips built urls and still accepts legacy mixed case", () => {
    const [path] = buildLandingUrl({
      category: "land",
      cityName: "Navi Mumbai",
      transaction: "buy",
    }).split("?");
    const [, locationSlug, categorySlug] = path.split("/");

    expect(
      parseLandingUrl({
        locationSlug,
        categorySlug,
        knownCities,
      }),
    ).toEqual({ category: "land", cityName: "Navi Mumbai", transaction: "buy" });
  });

  it("maps India to All India", () => {
    expect(
      parseLandingUrl({
        locationSlug: "property-for-sale-rent-in-India",
        categorySlug: "pg-co-living-India",
        knownCities,
      }),
    ).toEqual({ category: "pg-co-living", cityName: null, transaction: "buy" });
  });

  it("rejects mismatched, unknown or unrelated slugs", () => {
    const cases: [string, string][] = [
      ["property-for-sale-rent-in-Ahmedabad", "residential-real-estate-Pune"],
      ["property-for-sale-rent-in-Nowhere", "residential-real-estate-Nowhere"],
      ["property-for-sale-rent-in-Ahmedabad", "villas-Ahmedabad"],
      ["about-us", "team"],
    ];
    for (const [locationSlug, categorySlug] of cases) {
      expect(parseLandingUrl({ locationSlug, categorySlug, knownCities })).toBeNull();
    }
  });
});
