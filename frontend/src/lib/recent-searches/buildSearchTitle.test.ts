import { describe, expect, it } from "vitest";
import {
  buildRecentSearchSubtitle,
  buildRecentSearchTitle,
  formatPriceShort,
} from "./buildSearchTitle";

const base = {
  transaction: "property-for-sale" as const,
  category: "residential-real-estate" as const,
  localities: [],
  projects: [],
  bedrooms: [],
  propertyTypes: [],
};

// Same fixtures as backend recent-searches.title.test.js
describe("buildRecentSearchTitle", () => {
  it.each([
    [
      {
        ...base,
        bedrooms: [4],
        propertyTypes: ["flat-apartment"],
        budgetMin: 500000,
        budgetMax: 43000000,
        cityName: "Ahmedabad",
      },
      "Buy 4 BHK Flat/Apartment 5 Lac - 4.3 Cr in Ahmedabad",
    ],
    [
      {
        ...base,
        transaction: "property-for-rent" as const,
        category: "commercial-real-estate" as const,
        propertyTypes: ["shop"],
        budgetMin: 29000,
        budgetMax: 88000,
        localities: ["GIFT City"],
        cityName: "Gandhinagar",
      },
      "Rent Shop 29K - 88K in GIFT City, Gandhinagar",
    ],
    [
      {
        ...base,
        propertyTypes: ["flat-apartment"],
        localities: ["Bopal"],
        cityName: "Ahmedabad",
      },
      "Buy Flat/Apartment in Bopal, Ahmedabad",
    ],
    [
      { ...base, category: "land" as const, cityName: "Gandhinagar" },
      "Buy Land property in Gandhinagar",
    ],
    [
      {
        ...base,
        category: "land" as const,
        transaction: "property-for-rent" as const,
        cityName: "Gandhinagar",
      },
      "Rent Land property in Gandhinagar",
    ],
    [
      { ...base, category: "pg-co-living" as const, cityName: "Gandhinagar" },
      "PG in Gandhinagar",
    ],
    [{ ...base, cityName: "Ahmedabad" }, "Buy Residential property in Ahmedabad"],
  ])("builds the title for %#", (criteria, title) => {
    expect(buildRecentSearchTitle(criteria)).toBe(title);
  });

  it("joins several bedrooms and property types", () => {
    expect(
      buildRecentSearchTitle({
        ...base,
        bedrooms: [3, 2],
        propertyTypes: ["flat-apartment", "bungalow-villa"],
        cityName: "Surat",
      }),
    ).toBe("Buy 2, 3 BHK Flat/Apartment, Bungalow/Villa in Surat");
  });

  it("capitalises lowercase locations and counts projects as localities", () => {
    expect(
      buildRecentSearchTitle({
        ...base,
        projects: ["shyam swastik"],
        localities: ["bopal"],
        cityName: "Ahmedabad",
      }),
    ).toBe("Buy Residential property in Shyam Swastik, Bopal, Ahmedabad");
  });

  it("shows one-sided prices and area", () => {
    expect(buildRecentSearchTitle({ ...base, budgetMin: 500000 })).toBe(
      "Buy Residential property Min 5 Lac",
    );
    expect(
      buildRecentSearchTitle({ ...base, budgetMax: 88000, areaMin: 1000, areaMax: 2000 }),
    ).toBe("Buy Residential property Up to 88K 1,000 - 2,000 sq ft");
  });

  it("omits the location when none is selected", () => {
    expect(buildRecentSearchTitle(base)).toBe("Buy Residential property");
  });

  it("never exceeds the column length", () => {
    const localities = Array.from({ length: 50 }, (_, index) => `Locality number ${index}`);

    expect(buildRecentSearchTitle({ ...base, localities }).length).toBeLessThanOrEqual(255);
  });
});

describe("buildRecentSearchSubtitle", () => {
  it("is the location without the preposition", () => {
    expect(
      buildRecentSearchSubtitle({ ...base, localities: ["Bopal"], cityName: "Ahmedabad" }),
    ).toBe("Bopal, Ahmedabad");
  });

  it("falls back to the city, then null", () => {
    expect(buildRecentSearchSubtitle({ ...base, cityName: "Surat" })).toBe("Surat");
    expect(buildRecentSearchSubtitle(base)).toBeNull();
  });
});

describe("formatPriceShort", () => {
  it.each([
    [999, "999"],
    [29000, "29K"],
    [500000, "5 Lac"],
    [43000000, "4.3 Cr"],
    [10000000, "1 Cr"],
    [150000, "1.5 Lac"],
  ])("formats %p as %p", (amount, expected) => {
    expect(formatPriceShort(amount)).toBe(expected);
  });
});
