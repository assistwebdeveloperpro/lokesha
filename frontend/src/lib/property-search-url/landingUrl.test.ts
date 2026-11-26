import { describe, expect, it } from "vitest";
import { buildLandingUrl } from "./buildLandingUrl";
import { LANDING_ROUTES } from "./landingUrl.config";
import { parseLandingUrl } from "./parseLandingUrl";

const knownCities = ["Ahmedabad", "Navi Mumbai"];

describe("buildLandingUrl", () => {
  it("builds the residential buy and rent urls", () => {
    expect(
      buildLandingUrl({ category: "residential", cityName: "Ahmedabad", transaction: "buy" }),
    ).toBe("/buy/residential-property-for-sale-in-ahmedabad");
    expect(
      buildLandingUrl({ category: "residential", cityName: "Gandhinagar", transaction: "rent" }),
    ).toBe("/rent/residential-property-for-rent-in-gandhinagar");
  });

  it("uses one commercial url for buy and lease", () => {
    for (const transaction of ["buy", "lease"] as const) {
      expect(
        buildLandingUrl({ category: "commercial", cityName: "Navi Mumbai", transaction }),
      ).toBe("/commercial/commercial-property-for-sale-lease-rent-in-navi-mumbai");
    }
  });

  it("follows the transaction for plots and lands", () => {
    expect(
      buildLandingUrl({ category: "plot", cityName: "Pune", transaction: "buy" }),
    ).toBe("/plots/plots-for-sale-in-pune");
    expect(
      buildLandingUrl({ category: "plot", cityName: "Pune", transaction: "rent" }),
    ).toBe("/plots/plots-for-rent-in-pune");
    expect(
      buildLandingUrl({ category: "land", cityName: "Pune", transaction: "buy" }),
    ).toBe("/lands/lands-for-sale-in-pune");
    expect(
      buildLandingUrl({ category: "land", cityName: "Pune", transaction: "rent" }),
    ).toBe("/lands/lands-for-rent-in-pune");
  });

  it("ignores the transaction for pg and maps All India to india", () => {
    expect(
      buildLandingUrl({ category: "pg-co-living", cityName: null, transaction: "buy" }),
    ).toBe("/pg-and-hostel/pg-hostels-for-rent-in-india");
  });
});

describe("parseLandingUrl", () => {
  it("parses the residential urls", () => {
    expect(
      parseLandingUrl({
        group: "rent",
        slug: "residential-property-for-rent-in-Ahmedabad",
        knownCities,
      }),
    ).toEqual({ category: "residential", cityName: "Ahmedabad", transaction: "rent" });
  });

  it("round-trips every route", () => {
    for (const route of LANDING_ROUTES) {
      const transaction = route.transactions[0];
      const [, group, slug] = buildLandingUrl({
        category: route.category,
        cityName: "Navi Mumbai",
        transaction,
      }).split("/");

      expect(parseLandingUrl({ group, slug, knownCities })).toEqual({
        category: route.category,
        cityName: "Navi Mumbai",
        transaction,
      });
    }
  });

  it("maps india to All India", () => {
    expect(
      parseLandingUrl({
        group: "pg-and-hostel",
        slug: "pg-hostels-for-rent-in-india",
        knownCities,
      }),
    ).toEqual({ category: "pg-co-living", cityName: null, transaction: "rent" });
  });

  it("rejects a slug under the wrong group, an unknown city or unrelated paths", () => {
    const cases: [string, string][] = [
      ["buy", "residential-property-for-rent-in-ahmedabad"],
      ["rent", "residential-property-for-rent-in-nowhere"],
      ["plots", "lands-for-sale-in-ahmedabad"],
      ["buy", "residential-property-for-sale-in-"],
      ["about-us", "team"],
    ];
    for (const [group, slug] of cases) {
      expect(parseLandingUrl({ group, slug, knownCities })).toBeNull();
    }
  });
});
