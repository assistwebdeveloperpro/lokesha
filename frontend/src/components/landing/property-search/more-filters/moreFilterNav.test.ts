import { describe, expect, it } from "vitest";
import type { CategorySlug, TransactionSlug } from "@/lib/property-search-url/searchUrl.types";
import { buildMoreFilterNav } from "./moreFilterNav";

const labelsFor = (
  category: CategorySlug,
  transaction: TransactionSlug,
): string[] =>
  buildMoreFilterNav(category, transaction).map((item) => item.label);

describe("buildMoreFilterNav", () => {
  it("matches addressbox commercial sale nav labels", () => {
    expect(labelsFor("commercial-real-estate", "property-for-sale")).toEqual([
      "Posted Since",
      "Furnishing Status",
      "Total Floors",
      "Washroom",
      "Construction Status",
      "Amenities",
      "Age of Construction",
      "Ideal For Business",
      "Furnishing",
      "Facing",
      "RERA Number",
      "Parking",
      "Photos",
      "Videos",
    ]);
  });

  it("matches addressbox commercial rent nav labels", () => {
    expect(labelsFor("commercial-real-estate", "property-for-rent")).toEqual([
      "Posted Since",
      "Furnishing Status",
      "Total Floors",
      "Washroom",
      "Construction Status",
      "Amenities",
      "Age of Construction",
      "Ideal For Business",
      "Furnishing",
      "Facing",
      "RERA Number",
      "Parking",
      "Available From",
      "Photos",
      "Videos",
    ]);
  });

  it("matches addressbox residential sale nav labels", () => {
    expect(labelsFor("residential-real-estate", "property-for-sale")).toEqual([
      "Posted Since",
      "Area in sq. ft",
      "Total Floors",
      "Furnishing Status",
      "Bathrooms",
      "Age of Construction",
      "Furnishing",
      "Amenities",
      "Facing",
      "Parking",
      "RERA Number",
      "Construction Status",
      "Photos",
      "Videos",
    ]);
  });

  it("matches addressbox residential rent nav labels", () => {
    expect(labelsFor("residential-real-estate", "property-for-rent")).toEqual([
      "Posted Since",
      "Area in sq. ft",
      "Total Floors",
      "Furnishing Status",
      "Bathrooms",
      "Age of Construction",
      "Furnishing",
      "Amenities",
      "Facing",
      "Parking",
      "RERA Number",
      "Available From",
      "Photos",
      "Videos",
    ]);
  });

  it("matches addressbox plot sale nav labels", () => {
    expect(labelsFor("plot", "property-for-sale")).toEqual([
      "Posted Since",
      "Age of Construction",
      "Amenities",
      "Facing",
      "RERA Number",
      "Corner Plot",
      "Photos",
      "Videos",
    ]);
  });

  it("matches addressbox land sale nav labels", () => {
    expect(labelsFor("land", "property-for-sale")).toEqual([
      "Posted Since",
      "Facing",
      "RERA Number",
      "Corner Plot",
      "Photos",
      "Videos",
    ]);
  });

  it("matches addressbox pg nav labels", () => {
    expect(labelsFor("pg-co-living", "property-for-rent")).toEqual([
      "Posted Since",
      "Furnishing",
      "Age of Construction",
      "RERA Number",
      "Available From",
      "PG Operation Since",
      "PG Present in",
      "Food Availablity",
      "Photos",
      "Videos",
    ]);
  });
});
