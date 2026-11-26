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

const AHMEDABAD_PATH =
  "/properties/buy-flats-studio-apartments-penthouse-in-ahmedabad";
const GANDHINAGAR_PATH =
  "/properties/buy-flats-studio-apartments-penthouse-in-gandhinagar";

describe("buildSearchUrl", () => {
  it("search without any search item beyond the city", () => {
    expect(buildSearchUrl({ ...base, cityName: "Ahmedabad" })).toBe(
      `${AHMEDABAD_PATH}?bedroom=&${TYPES_PARAM}`,
    );
  });

  it("project only", () => {
    expect(
      buildSearchUrl({ ...base, cityName: "Ahmedabad", projects: ["Shyam Swastik"] }),
    ).toBe(`${AHMEDABAD_PATH}?bedroom=&${TYPES_PARAM}&project-socity=shyam-swastik`);
  });

  it("locality only", () => {
    expect(
      buildSearchUrl({ ...base, cityName: "Ahmedabad", localities: ["Bopal"] }),
    ).toBe(`${AHMEDABAD_PATH}?bedroom=&${TYPES_PARAM}&locality=bopal`);
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
      `${AHMEDABAD_PATH}?bedroom=&${TYPES_PARAM}&locality=hathijan&project-socity=shyam-swastik`,
    );
  });

  it("bhk filter", () => {
    expect(
      buildSearchUrl({ ...base, cityName: "Gandhinagar", bedrooms: [3] }),
    ).toBe(`${GANDHINAGAR_PATH}?bedroom=3&${TYPES_PARAM}`);
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
      `${GANDHINAGAR_PATH}?bedroom=3&${TYPES_PARAM}&min-price=500000&max-price=30000000`,
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
      "/properties/buy-flats-penthouse-in-gandhinagar?bedroom=&proptype=flat-apartment,penthouse&min-price=500000&max-price=30000000",
    );
  });
});

describe("buildSearchUrl property type words", () => {
  const build = (propertyTypes: string[], transaction = base.transaction) =>
    buildSearchUrl({ ...base, transaction, cityName: "Ahmedabad", propertyTypes });

  it("lists the selected types in a stable order", () => {
    expect(build(["bungalow-villa", "flat-apartment"])).toBe(
      "/properties/buy-flats-bungalows-in-ahmedabad?bedroom=&proptype=bungalow-villa,flat-apartment",
    );
  });

  it("uses a single type word, also for rent", () => {
    expect(build(["penthouse"], "property-for-rent")).toBe(
      "/properties/rent-penthouse-in-ahmedabad?bedroom=&proptype=penthouse",
    );
  });

  it("falls back to flats for no or unknown types", () => {
    expect(build([])).toBe("/properties/buy-flats-in-ahmedabad?bedroom=");
    expect(build(["multistorey-apartment"])).toContain("/buy-flats-in-ahmedabad?");
  });
});

describe("buildSearchUrl paths", () => {
  it("uses india when there is no city", () => {
    expect(buildSearchUrl({ ...base, propertyTypes: [] })).toBe(
      "/properties/buy-flats-in-india?bedroom=",
    );
  });

  it("follows the transaction for residential", () => {
    expect(
      buildSearchUrl({
        ...base,
        transaction: "property-for-rent",
        propertyTypes: [],
        cityName: "Pune",
        page: 3,
      }),
    ).toBe("/properties/rent-flats-in-pune?bedroom=&page=3");
  });

  it("builds commercial sale and lease paths", () => {
    const commercial: PropertySearchCriteria = {
      ...base,
      category: "commercial-real-estate",
      cityName: "Pune",
      propertyTypes: [],
    };

    expect(buildSearchUrl({ ...commercial, transaction: "property-for-sale" })).toBe(
      "/properties/commercial-properties-for-sale-in-pune",
    );
    expect(buildSearchUrl({ ...commercial, transaction: "property-for-lease" })).toBe(
      "/properties/commercial-properties-for-lease-in-pune",
    );
  });

  it("builds plot and land paths for sale and rent", () => {
    const build = (
      category: "plot" | "land",
      transaction: "property-for-sale" | "property-for-rent",
    ) =>
      buildSearchUrl({ ...base, category, transaction, propertyTypes: [], cityName: "Pune" });

    expect(build("plot", "property-for-sale")).toBe("/properties/plots-for-sale-in-pune");
    expect(build("plot", "property-for-rent")).toBe("/properties/plots-for-rent-in-pune");
    expect(build("land", "property-for-sale")).toBe("/properties/lands-for-sale-in-pune");
    expect(build("land", "property-for-rent")).toBe("/properties/lands-for-rent-in-pune");
  });

  it("hyphenates multi-word cities and sorts bedrooms", () => {
    expect(
      buildSearchUrl({
        ...base,
        propertyTypes: [],
        cityName: "Navi Mumbai",
        bedrooms: [4, 2, 2],
      }),
    ).toBe("/properties/buy-flats-in-navi-mumbai?bedroom=2,4");
  });
});

describe("buildSearchUrl extras", () => {
  it("builds commercial with area", () => {
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
      "/properties/commercial-properties-for-lease-in-pune?proptype=shop,co-working-space-business-centre&area-min=500&area-max=5000",
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
      "/properties/pg-in-pune?min-price=5000&max-price=100000&occupancy=single,triple-plus&gender=female,both",
    );
  });
});
