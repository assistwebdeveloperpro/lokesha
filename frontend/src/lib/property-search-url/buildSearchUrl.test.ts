import { describe, expect, it } from "vitest";
import { buildSearchUrl } from "./buildSearchUrl";
import type { PropertySearchCriteria } from "./searchUrl.types";

const TYPES = ["Flat-Apartment", "Penthouse", "Studio-Apartment"];
const TYPES_PARAM = "proptype=Flat-Apartment,Penthouse,Studio-Apartment";

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
  page: 1,
};

const PATH = "/property-for-sale/residential-real-estate";

describe("buildSearchUrl (spec url-path-design.md)", () => {
  it("search without any search item beyond the city", () => {
    expect(buildSearchUrl({ ...base, cityName: "Ahmedabad" })).toBe(
      `${PATH}?bedroom=&${TYPES_PARAM}&city-name=Ahmedabad`,
    );
  });

  it("project only", () => {
    expect(
      buildSearchUrl({ ...base, cityName: "Ahmedabad", projects: ["Shyam Swastik"] }),
    ).toBe(
      `${PATH}?bedroom=&${TYPES_PARAM}&city-name=Ahmedabad&project-socity=shyam-swastik`,
    );
  });

  it("locality only", () => {
    expect(
      buildSearchUrl({ ...base, cityName: "Ahmedabad", localities: ["Bopal"] }),
    ).toBe(`${PATH}?bedroom=&${TYPES_PARAM}&locality=Bopal&city-name=Ahmedabad`);
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
      `${PATH}?bedroom=&${TYPES_PARAM}&locality=Hathijan&city-name=Ahmedabad&project-socity=shyam-swastik`,
    );
  });

  it("bhk filter", () => {
    expect(
      buildSearchUrl({ ...base, cityName: "Gandhinagar", bedrooms: [3] }),
    ).toBe(`${PATH}?bedroom=3&${TYPES_PARAM}&city-name=Gandhinagar`);
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
      `${PATH}?bedroom=3&${TYPES_PARAM}&city-name=Gandhinagar&min-price=500000&max-price=30000000`,
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
      `${PATH}?bedroom=&proptype=Flat-Apartment,Penthouse&city-name=Gandhinagar&min-price=500000&max-price=30000000`,
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
    ).toBe("/plots-for-sale?city-name=Pune");
  });

  it("hyphenates multi-word cities and sorts bedrooms", () => {
    expect(
      buildSearchUrl({
        ...base,
        propertyTypes: [],
        cityName: "Navi Mumbai",
        bedrooms: [4, 2, 2],
      }),
    ).toBe(`${PATH}?bedroom=2,4&city-name=Navi-Mumbai`);
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
      "/property-for-lease/commercial-real-estate?proptype=Shop,Co-working-Space-Business-Centre&city-name=Pune&area-min=500&area-max=5000",
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
      "/pg-for-rent?city-name=Pune&min-price=5000&max-price=100000&occupancy=single,triple-plus&gender=female,both",
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
      "/property-for-rent/residential-real-estate?bedroom=&city-name=Pune&page=3",
    );
  });
});
