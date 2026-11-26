import { describe, expect, it } from "vitest";
import { buildSearchUrl } from "@/lib/property-search-url/buildSearchUrl";
import {
  AREA_RANGE,
  defaultPropertyTypes,
  PG_BUDGET,
  PROPERTY_TYPES,
  RESIDENTIAL_BUDGET,
  type SearchTag,
} from "./heroBanner.shared";
import {
  buildHeroSearchCriteria,
  type HeroSearchInput,
} from "./heroSearchCriteria";

const city: SearchTag = { kind: "city", label: "Ahmedabad" };

const AHMEDABAD_BUY_PATH = "/properties/buy-flats-in-ahmedabad";
const DEFAULT_RESIDENTIAL_TYPES = "proptype=flat-apartment";
const ALL_COMMERCIAL_TYPES =
  "proptype=shop,office,showroom,cold-storage,industrial-shed,guest-house,hotel-resort,warehouse-godown,co-working-space-business-centre";
const ALL_LAND_TYPES =
  "proptype=agriculture-land,non-agriculture-land,commercial-land,residential-land,industrial-land";

const input: HeroSearchInput = {
  category: "residential",
  transaction: "buy",
  searchTags: [city],
  propertyTypeOptions: PROPERTY_TYPES.residential,
  selectedPropertyTypes: defaultPropertyTypes("residential"),
  selectedBedrooms: [],
  selectedConstruction: [],
  selectedSaleTypes: [],
  selectedOccupancy: [],
  selectedGender: [],
  budgetMin: RESIDENTIAL_BUDGET.min,
  budgetMax: RESIDENTIAL_BUDGET.max,
  pgBudgetMin: PG_BUDGET.min,
  pgBudgetMax: PG_BUDGET.max,
  areaMin: AREA_RANGE.min,
  areaMax: AREA_RANGE.max,
};

const urlFor = (overrides: Partial<HeroSearchInput>) => {
  const criteria = buildHeroSearchCriteria({ ...input, ...overrides });
  return criteria ? buildSearchUrl(criteria) : null;
};

describe("buildHeroSearchCriteria (spec url-path-design.md)", () => {
  it("search without any search item beyond the default city", () => {
    expect(urlFor({})).toBe(
      `${AHMEDABAD_BUY_PATH}?bedroom=&${DEFAULT_RESIDENTIAL_TYPES}`,
    );
  });

  it("project only", () => {
    expect(
      urlFor({
        searchTags: [city, { kind: "project", label: "Shyam Swastik" }],
      }),
    ).toBe(
      `${AHMEDABAD_BUY_PATH}?bedroom=&${DEFAULT_RESIDENTIAL_TYPES}&project-socity=shyam-swastik`,
    );
  });

  it("locality only", () => {
    expect(
      urlFor({ searchTags: [city, { kind: "locality", label: "Bopal" }] }),
    ).toBe(
      `${AHMEDABAD_BUY_PATH}?bedroom=&${DEFAULT_RESIDENTIAL_TYPES}&locality=bopal`,
    );
  });

  it("project and locality", () => {
    expect(
      urlFor({
        searchTags: [
          city,
          { kind: "locality", label: "Hathijan" },
          { kind: "project", label: "Shyam Swastik" },
        ],
      }),
    ).toBe(
      `${AHMEDABAD_BUY_PATH}?bedroom=&${DEFAULT_RESIDENTIAL_TYPES}&locality=hathijan&project-socity=shyam-swastik`,
    );
  });

  it("bhk filter", () => {
    expect(
      urlFor({
        searchTags: [{ kind: "city", label: "Gandhinagar" }],
        selectedBedrooms: ["+3BHK"],
      }),
    ).toBe(
      `/properties/buy-flats-in-gandhinagar?bedroom=3&${DEFAULT_RESIDENTIAL_TYPES}`,
    );
  });

  it("budget", () => {
    expect(
      urlFor({
        searchTags: [{ kind: "city", label: "Gandhinagar" }],
        selectedBedrooms: ["+3BHK"],
        budgetMin: 500_000,
        budgetMax: 30_000_000,
      }),
    ).toBe(
      `/properties/buy-flats-in-gandhinagar?bedroom=3&${DEFAULT_RESIDENTIAL_TYPES}&max-price=30000000`,
    );
  });

  it("bhk not selected with a property type subset", () => {
    expect(
      urlFor({
        searchTags: [{ kind: "city", label: "Gandhinagar" }],
        selectedPropertyTypes: ["Flat/Apartment", "Penthouse"],
        budgetMin: 600_000,
        budgetMax: 30_000_000,
      }),
    ).toBe(
      "/properties/buy-flats-penthouse-in-gandhinagar?bedroom=&proptype=flat-apartment,penthouse&min-price=600000&max-price=30000000",
    );
  });
});

describe("buildHeroSearchCriteria extras", () => {
  it("omits proptype when no type is selected", () => {
    expect(urlFor({ selectedPropertyTypes: [] })).toBe(
      `${AHMEDABAD_BUY_PATH}?bedroom=`,
    );
  });

  it("uses the rent route", () => {
    expect(urlFor({ transaction: "rent" })).toBe(
      `/properties/rent-flats-in-ahmedabad?bedroom=&${DEFAULT_RESIDENTIAL_TYPES}`,
    );
  });

  it("maps sale type", () => {
    expect(urlFor({ selectedSaleTypes: ["New", "Resale"] })).toContain(
      "property-transaction=new,resale",
    );
  });

  it("builds commercial lease with area and property types", () => {
    expect(
      urlFor({
        category: "commercial",
        transaction: "lease",
        propertyTypeOptions: PROPERTY_TYPES.commercial,
        selectedPropertyTypes: ["Shop", "Co-working Space/Business Centre"],
        areaMin: 500,
        areaMax: 5000,
      }),
    ).toBe(
      "/properties/commercial-properties-for-lease-in-ahmedabad?proptype=shop,co-working-space-business-centre&area-min=500&area-max=5000",
    );
  });

  it("builds commercial buy on the sale route", () => {
    expect(
      urlFor({
        category: "commercial",
        propertyTypeOptions: PROPERTY_TYPES.commercial,
        selectedPropertyTypes: PROPERTY_TYPES.commercial,
      }),
    ).toBe(
      `/properties/commercial-properties-for-sale-in-ahmedabad?${ALL_COMMERCIAL_TYPES}`,
    );
  });

  it("maps sale type on commercial", () => {
    expect(
      urlFor({
        category: "commercial",
        propertyTypeOptions: PROPERTY_TYPES.commercial,
        selectedPropertyTypes: PROPERTY_TYPES.commercial,
        selectedSaleTypes: ["Resale"],
      }),
    ).toContain("property-transaction=resale");
  });

  it("maps sale type on plot", () => {
    expect(
      urlFor({
        category: "plot",
        propertyTypeOptions: PROPERTY_TYPES.plot,
        selectedPropertyTypes: ["Residential Plot"],
        selectedSaleTypes: ["New"],
      }),
    ).toBe(
      "/properties/plots-for-sale-in-ahmedabad?proptype=residential-plot&property-transaction=new",
    );
  });

  it("builds plot and land searches", () => {
    expect(
      urlFor({
        category: "plot",
        propertyTypeOptions: PROPERTY_TYPES.plot,
        selectedPropertyTypes: ["Residential Plot"],
      }),
    ).toBe("/properties/plots-for-sale-in-ahmedabad?proptype=residential-plot");
    expect(
      urlFor({
        category: "land",
        transaction: "rent",
        propertyTypeOptions: PROPERTY_TYPES.land,
        selectedPropertyTypes: PROPERTY_TYPES.land,
      }),
    ).toBe(`/properties/lands-for-rent-in-ahmedabad?${ALL_LAND_TYPES}`);
  });

  it("builds pg searches on the rent route using the pg budget", () => {
    expect(
      urlFor({
        category: "pg-co-living",
        transaction: "buy",
        propertyTypeOptions: [],
        selectedPropertyTypes: [],
        selectedOccupancy: ["Triple+", "Single"],
        selectedGender: ["Male", "Both"],
        pgBudgetMin: 5_000,
        budgetMax: 1,
      }),
    ).toBe(
      "/properties/pg-in-ahmedabad?min-price=5000&occupancy=single,triple-plus&gender=male,both",
    );
  });

  it("ignores filters that do not apply to the category", () => {
    expect(
      urlFor({
        category: "commercial",
        propertyTypeOptions: PROPERTY_TYPES.commercial,
        selectedPropertyTypes: PROPERTY_TYPES.commercial,
        selectedBedrooms: ["+3BHK"],
        selectedConstruction: ["Ready to Move"],
      }),
    ).toBe(
      `/properties/commercial-properties-for-sale-in-ahmedabad?${ALL_COMMERCIAL_TYPES}`,
    );
  });

  it("returns null for unsupported combinations and categories", () => {
    expect(urlFor({ transaction: "lease" })).toBeNull();
    expect(urlFor({ category: "new-projects" })).toBeNull();
  });
});

describe("defaultPropertyTypes", () => {
  it("selects a subset for residential, commercial, and land", () => {
    expect(defaultPropertyTypes("residential")).toEqual(["Flat/Apartment"]);
    expect(defaultPropertyTypes("commercial")).toEqual([
      "Shop",
      "Office",
      "Showroom",
    ]);
    expect(defaultPropertyTypes("land")).toEqual([
      "Commercial Land",
      "Residential Land",
    ]);
  });

  it("selects every plot type and none for categories without chips", () => {
    expect(defaultPropertyTypes("plot")).toEqual(PROPERTY_TYPES.plot);
    expect(defaultPropertyTypes("pg-co-living")).toEqual([]);
    expect(defaultPropertyTypes("new-projects")).toEqual([]);
  });
});
