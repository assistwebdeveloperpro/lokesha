import { describe, expect, it } from "vitest";
import { EMPTY_MORE_FILTERS } from "./moreFilters.types";
import type { PropertySearchCriteria } from "./searchUrl.types";
import { toSearchApiQuery } from "./toSearchApiQuery";

const base: PropertySearchCriteria = {
  transaction: "property-for-sale",
  category: "residential-real-estate",
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
  page: 1,
};

const parse = (criteria: PropertySearchCriteria, sort?: "price-asc") =>
  Object.fromEntries(new URLSearchParams(toSearchApiQuery(criteria, sort)));

describe("toSearchApiQuery", () => {
  it("sends only the listing type and category for an empty search", () => {
    expect(parse(base)).toEqual({ listingType: "sale", category: "residential" });
  });

  it("maps rent and lease to rent-lease and the url category to the form id", () => {
    expect(
      parse({ ...base, transaction: "property-for-lease", category: "pg-co-living" }),
    ).toEqual({ listingType: "rent-lease", category: "pg-co-living" });
  });

  it("joins list filters, budget and the page", () => {
    expect(
      parse({
        ...base,
        cityName: "Ahmedabad",
        localities: ["Bopal", "Naroda"],
        bedrooms: [2, 3],
        postedBy: ["agent"],
        budgetMin: 500000,
        budgetMax: 9000000,
        page: 2,
      }),
    ).toEqual({
      listingType: "sale",
      category: "residential",
      city: "Ahmedabad",
      localities: "Bopal,Naroda",
      bedrooms: "2,3",
      postedBy: "agent",
      budgetMin: "500000",
      budgetMax: "9000000",
      page: "2",
    });
  });

  it("maps property types to sub type ids", () => {
    expect(parse({ ...base, propertyTypes: ["Flat-Apartment", "Penthouse"] }).subTypes).toBe(
      "flat-apartment,penthouse",
    );
  });

  it("sends more filters and skips empty ones", () => {
    const query = parse({
      ...base,
      more: { ...EMPTY_MORE_FILTERS, postedSince: "7d", hasPhotos: true, amenities: ["lift", "gym"], hasRera: false },
    });

    expect(query).toMatchObject({ postedSince: "7d", hasPhotos: "true", amenities: "lift,gym" });
    expect(query).not.toHaveProperty("hasRera");
    expect(query).not.toHaveProperty("lifts");
  });

  it("adds the sort only when it is not the default", () => {
    expect(parse(base, "price-asc").sort).toBe("price-asc");
    expect(parse(base)).not.toHaveProperty("sort");
  });
});
