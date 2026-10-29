import { describe, expect, it } from "vitest";
import { buildSearchUrl } from "@/lib/property-search-url/buildSearchUrl";
import {
  AREA_RANGE,
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

const ALL_RESIDENTIAL_TYPES =
  "proptype=Flat-Apartment,Bungalow-Villa,Studio-Apartment,Weekend-Homes,Farm-House,Penthouse,Duplex";
const ALL_COMMERCIAL_TYPES =
  "proptype=Shop,Office,Showroom,Cold-Storage,Industrial-Shed,Guest-House,Hotel-Resort,Warehouse-Godown,Co-working-Space-Business-Centre";
const ALL_LAND_TYPES =
  "proptype=Agriculture-Land,Non-Agriculture-Land,Commercial-Land,Residential-Land,Industrial-Land";

const input: HeroSearchInput = {
  category: "residential",
  transaction: "buy",
  searchTags: [city],
  propertyTypeOptions: PROPERTY_TYPES.residential,
  selectedPropertyTypes: PROPERTY_TYPES.residential,
  selectedBedrooms: [],
  selectedConstruction: [],
  selectedOccupancy: [],
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
      `/property-for-sale/residential-real-estate?bedroom=&${ALL_RESIDENTIAL_TYPES}&cityName=Ahmedabad`,
    );
  });

  it("project only", () => {
    expect(
      urlFor({
        searchTags: [city, { kind: "project", label: "Shyam Swastik" }],
      }),
    ).toBe(
      `/property-for-sale/residential-real-estate?bedroom=&${ALL_RESIDENTIAL_TYPES}&cityName=Ahmedabad&projectSocity=shyam-swastik`,
    );
  });

  it("locality only", () => {
    expect(
      urlFor({ searchTags: [city, { kind: "locality", label: "Bopal" }] }),
    ).toBe(
      `/property-for-sale/residential-real-estate?bedroom=&${ALL_RESIDENTIAL_TYPES}&Locality=Bopal&cityName=Ahmedabad`,
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
      `/property-for-sale/residential-real-estate?bedroom=&${ALL_RESIDENTIAL_TYPES}&Locality=Hathijan&cityName=Ahmedabad&projectSocity=shyam-swastik`,
    );
  });

  it("bhk filter", () => {
    expect(
      urlFor({
        searchTags: [{ kind: "city", label: "Gandhinagar" }],
        selectedBedrooms: ["+3BHK"],
      }),
    ).toBe(
      `/property-for-sale/residential-real-estate?bedroom=3&${ALL_RESIDENTIAL_TYPES}&cityName=Gandhinagar`,
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
      `/property-for-sale/residential-real-estate?bedroom=3&${ALL_RESIDENTIAL_TYPES}&cityName=Gandhinagar&BudgetMax=3-Crores`,
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
      "/property-for-sale/residential-real-estate?bedroom=&proptype=Flat-Apartment,Penthouse&cityName=Gandhinagar&BudgetMin=6-Lacs&BudgetMax=3-Crores",
    );
  });
});

describe("buildHeroSearchCriteria extras", () => {
  it("omits proptype when no type is selected", () => {
    expect(urlFor({ selectedPropertyTypes: [] })).toBe(
      "/property-for-sale/residential-real-estate?bedroom=&cityName=Ahmedabad",
    );
  });

  it("uses the rent route", () => {
    expect(urlFor({ transaction: "rent" })).toBe(
      `/property-for-rent/residential-real-estate?bedroom=&${ALL_RESIDENTIAL_TYPES}&cityName=Ahmedabad`,
    );
  });

  it("maps construction status", () => {
    expect(urlFor({ selectedConstruction: ["Ready to Move"] })).toContain(
      "constructionStatus=ready-to-move",
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
      "/property-for-lease/commercial-real-estate?proptype=Shop,Co-working-Space-Business-Centre&cityName=Ahmedabad&areaMin=500&areaMax=5000",
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
      `/property-for-sale/commercial-real-estate?${ALL_COMMERCIAL_TYPES}&cityName=Ahmedabad`,
    );
  });

  it("builds plot and land searches", () => {
    expect(
      urlFor({
        category: "plot",
        propertyTypeOptions: PROPERTY_TYPES.plot,
        selectedPropertyTypes: ["Residential Plot"],
      }),
    ).toBe("/property-for-sale/plot?proptype=Residential-Plot&cityName=Ahmedabad");
    expect(
      urlFor({
        category: "land",
        transaction: "rent",
        propertyTypeOptions: PROPERTY_TYPES.land,
        selectedPropertyTypes: PROPERTY_TYPES.land,
      }),
    ).toBe(`/property-for-rent/land?${ALL_LAND_TYPES}&cityName=Ahmedabad`);
  });

  it("builds pg searches on the rent route using the pg budget", () => {
    expect(
      urlFor({
        category: "pg-co-living",
        transaction: "buy",
        propertyTypeOptions: [],
        selectedPropertyTypes: [],
        selectedOccupancy: ["Triple+", "Single"],
        pgBudgetMin: 5_000,
        budgetMax: 1,
      }),
    ).toBe(
      "/property-for-rent/pg-co-living?cityName=Ahmedabad&BudgetMin=5000&occupancy=single,triple-plus",
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
      `/property-for-sale/commercial-real-estate?${ALL_COMMERCIAL_TYPES}&cityName=Ahmedabad`,
    );
  });

  it("returns null for unsupported combinations and categories", () => {
    expect(urlFor({ transaction: "lease" })).toBeNull();
    expect(urlFor({ category: "new-projects" })).toBeNull();
  });
});
