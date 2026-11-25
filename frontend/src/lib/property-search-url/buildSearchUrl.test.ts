import { describe, expect, it } from "vitest";
import { buildSearchUrl } from "./buildSearchUrl";
import { EMPTY_MORE_FILTERS } from "./moreFilters.types";
import type { PropertySearchCriteria } from "./searchUrl.types";

const TYPES = ["Flat-Apartment", "Penthouse", "Studio-Apartment"];
const TYPES_PARAM = "proptype=flat-apartment,penthouse,studio-apartment";

const base: PropertySearchCriteria = {
  transaction: "property-for-sale",
  category: "residential-real-estate",
  propertyTypes: TYPES,
  localities: [],
  projects: [],
  bedrooms: [],
  constructionStatuses: [],
  saleTypes: [],
  occupancies: [],
  genders: [],
  postedBy: [],
  more: { ...EMPTY_MORE_FILTERS },
  page: 1,
};

const PATH = "/property-for-sale/residential-real-estate";

describe("buildSearchUrl (spec url-path-design.md)", () => {
  it("search without any search item beyond the city", () => {
    expect(buildSearchUrl({ ...base, cityName: "Ahmedabad" })).toBe(
      `${PATH}?bedroom=&${TYPES_PARAM}&city-name=ahmedabad`,
    );
  });

  it("project only", () => {
    expect(
      buildSearchUrl({ ...base, cityName: "Ahmedabad", projects: ["Shyam Swastik"] }),
    ).toBe(
      `${PATH}?bedroom=&${TYPES_PARAM}&city-name=ahmedabad&project-socity=shyam-swastik`,
    );
  });

  it("locality only", () => {
    expect(
      buildSearchUrl({ ...base, cityName: "Ahmedabad", localities: ["Bopal"] }),
    ).toBe(`${PATH}?bedroom=&${TYPES_PARAM}&locality=bopal&city-name=ahmedabad`);
  });

  it("project and locality", () => {
    expect(
      buildSearchUrl({
        ...base,
        cityName: "Ahmedabad",
        localities: ["Hathijan"],
        projects: ["Shyam Swastik"],
      }),
    ).toBe(
      `${PATH}?bedroom=&${TYPES_PARAM}&locality=hathijan&city-name=ahmedabad&project-socity=shyam-swastik`,
    );
  });

  it("bhk filter", () => {
    expect(
      buildSearchUrl({ ...base, cityName: "Gandhinagar", bedrooms: [3] }),
    ).toBe(`${PATH}?bedroom=3&${TYPES_PARAM}&city-name=gandhinagar`);
  });

  it("budget", () => {
    expect(
      buildSearchUrl({
        ...base,
        cityName: "Gandhinagar",
        bedrooms: [3],
        budgetMin: 500_000,
        budgetMax: 30_000_000,
      }),
    ).toBe(
      `${PATH}?bedroom=3&${TYPES_PARAM}&city-name=gandhinagar&min-price=500000&max-price=30000000`,
    );
  });

  it("bhk not selected with a property type subset", () => {
    expect(
      buildSearchUrl({
        ...base,
        cityName: "Gandhinagar",
        propertyTypes: ["Flat-Apartment", "Penthouse"],
        budgetMin: 500_000,
        budgetMax: 30_000_000,
      }),
    ).toBe(
      `${PATH}?bedroom=&proptype=flat-apartment,penthouse&city-name=gandhinagar&min-price=500000&max-price=30000000`,
    );
  });
});

describe("buildSearchUrl extras", () => {
  it("omits empty params except the residential bedroom", () => {
    expect(buildSearchUrl({ ...base, propertyTypes: [] })).toBe(
      `${PATH}?bedroom=`,
    );
    expect(
      buildSearchUrl({
        ...base,
        category: "plot",
        propertyTypes: [],
        cityName: "Pune",
      }),
    ).toBe("/plots-for-sale?city-name=pune");
  });

  it("hyphenates multi-word cities and sorts bedrooms", () => {
    expect(
      buildSearchUrl({
        ...base,
        propertyTypes: [],
        cityName: "Navi Mumbai",
        bedrooms: [4, 2, 2],
      }),
    ).toBe(`${PATH}?bedroom=2,4&city-name=navi-mumbai`);
  });

  it("builds commercial lease with area", () => {
    expect(
      buildSearchUrl({
        ...base,
        transaction: "property-for-lease",
        category: "commercial-real-estate",
        cityName: "Pune",
        propertyTypes: ["Shop", "Co-working-Space-Business-Centre"],
        areaMin: 500,
        areaMax: 5000,
      }),
    ).toBe(
      "/property-for-lease/commercial-real-estate?proptype=shop,co-working-space-business-centre&city-name=pune&area-min=500&area-max=5000",
    );
  });

  it("builds pg search with occupancy, gender and budget", () => {
    expect(
      buildSearchUrl({
        ...base,
        transaction: "property-for-rent",
        category: "pg-co-living",
        propertyTypes: [],
        cityName: "Pune",
        occupancies: ["single", "triple-plus"],
        genders: ["female", "both"],
        budgetMin: 5_000,
        budgetMax: 100_000,
      }),
    ).toBe(
      "/pg-for-rent?city-name=pune&min-price=5000&max-price=100000&occupancy=single,triple-plus&gender=female,both",
    );
  });

  it("uses the rent route and page param", () => {
    expect(
      buildSearchUrl({
        ...base,
        transaction: "property-for-rent",
        propertyTypes: [],
        cityName: "Pune",
        page: 3,
      }),
    ).toBe(
      "/property-for-rent/residential-real-estate?bedroom=&city-name=pune&page=3",
    );
  });
});
