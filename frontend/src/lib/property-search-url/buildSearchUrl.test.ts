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
  occupancies: [],
  page: 1,
};

const PATH = "/property-for-sale/residential-real-estate";

describe("buildSearchUrl (spec url-path-design.md)", () => {
  it("search without any search item beyond the city", () => {
    expect(buildSearchUrl({ ...base, cityName: "Ahmedabad" })).toBe(
      `${PATH}?bedroom=&${TYPES_PARAM}&cityName=Ahmedabad`,
    );
  });

  it("project only", () => {
    expect(
      buildSearchUrl({ ...base, cityName: "Ahmedabad", projects: ["Shyam Swastik"] }),
    ).toBe(
      `${PATH}?bedroom=&${TYPES_PARAM}&cityName=Ahmedabad&projectSocity=shyam-swastik`,
    );
  });

  it("locality only", () => {
    expect(
      buildSearchUrl({ ...base, cityName: "Ahmedabad", localities: ["Bopal"] }),
    ).toBe(`${PATH}?bedroom=&${TYPES_PARAM}&Locality=Bopal&cityName=Ahmedabad`);
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
      `${PATH}?bedroom=&${TYPES_PARAM}&Locality=Hathijan&cityName=Ahmedabad&projectSocity=shyam-swastik`,
    );
  });

  it("bhk filter", () => {
    expect(
      buildSearchUrl({ ...base, cityName: "Gandhinagar", bedrooms: [3] }),
    ).toBe(`${PATH}?bedroom=3&${TYPES_PARAM}&cityName=Gandhinagar`);
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
      `${PATH}?bedroom=3&${TYPES_PARAM}&cityName=Gandhinagar&BudgetMin=5-Lacs&BudgetMax=3-Crores`,
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
      `${PATH}?bedroom=&proptype=Flat-Apartment,Penthouse&cityName=Gandhinagar&BudgetMin=5-Lacs&BudgetMax=3-Crores`,
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
    ).toBe("/property-for-sale/plot?cityName=Pune");
  });

  it("hyphenates multi-word cities and sorts bedrooms", () => {
    expect(
      buildSearchUrl({
        ...base,
        propertyTypes: [],
        cityName: "Navi Mumbai",
        bedrooms: [4, 2, 2],
      }),
    ).toBe(`${PATH}?bedroom=2,4&cityName=Navi-Mumbai`);
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
      "/property-for-lease/commercial-real-estate?proptype=Shop,Co-working-Space-Business-Centre&cityName=Pune&areaMin=500&areaMax=5000",
    );
  });

  it("builds pg search with occupancy and budget", () => {
    expect(
      buildSearchUrl({
        ...base,
        transaction: "property-for-rent",
        category: "pg-co-living",
        propertyTypes: [],
        cityName: "Pune",
        occupancies: ["single", "triple-plus"],
        budgetMin: 5_000,
        budgetMax: 100_000,
      }),
    ).toBe(
      "/property-for-rent/pg-co-living?cityName=Pune&BudgetMin=5000&BudgetMax=1-Lacs&occupancy=single,triple-plus",
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
      "/property-for-rent/residential-real-estate?bedroom=&cityName=Pune&page=3",
    );
  });
});
