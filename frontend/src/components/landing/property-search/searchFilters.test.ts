import { describe, expect, it } from "vitest";
import type { PropertySearchCriteria } from "@/lib/property-search-url/searchUrl.types";
import { getActiveFilterChips } from "./searchFilterChips";
import {
  getCategoryFilters,
  togglePropertyType,
  toggleValue,
} from "./searchFilterOptions";
import { buildSearchHeading } from "./searchPageText";

const criteria: PropertySearchCriteria = {
  transaction: "property-for-sale",
  category: "residential-real-estate",
  cityName: "Ahmedabad",
  localities: ["Bopal"],
  projects: ["shyam swastik"],
  bedrooms: [3],
  propertyTypes: ["penthouse"],
  constructionStatuses: ["ready-to-move"],
  occupancies: [],
  budgetMin: undefined,
  budgetMax: 30_000_000,
  page: 1,
};

describe("getActiveFilterChips", () => {
  it("returns no chips for an empty search", () => {
    expect(
      getActiveFilterChips({
        ...criteria,
        cityName: undefined,
        localities: [],
        projects: [],
        bedrooms: [],
        propertyTypes: [],
        constructionStatuses: [],
        budgetMax: undefined,
      }),
    ).toEqual([]);
  });

  it("labels every active filter", () => {
    expect(getActiveFilterChips(criteria).map((chip) => chip.label)).toEqual([
      "Ahmedabad",
      "Bopal",
      "Shyam Swastik",
      "3 BHK",
      "Penthouse",
      "Ready to Move",
      "₹5.00 Lac - ₹3.00 Cr",
    ]);
  });

  it("shows no property type chips when every type is selected", () => {
    const all = getCategoryFilters("residential-real-estate").propertyTypeOptions.map(
      (option) => option.value,
    );
    const labels = getActiveFilterChips({ ...criteria, propertyTypes: all }).map(
      (chip) => chip.label,
    );
    expect(labels).not.toContain("Penthouse");
    expect(labels).toContain("3 BHK");
  });

  it("clears only the removed value", () => {
    const chips = getActiveFilterChips({ ...criteria, bedrooms: [2, 3] });
    const chip = chips.find((item) => item.id === "bedroom:2");
    expect(chip?.clearPatch).toEqual({ bedrooms: [3] });
  });

  it("drops locality and project together with the city", () => {
    const chip = getActiveFilterChips(criteria)[0];
    expect(chip.clearPatch).toEqual({
      cityName: undefined,
      localities: [],
      projects: [],
    });
  });
});

describe("category specific chips and headings", () => {
  it("labels commercial property types and area", () => {
    const commercial: PropertySearchCriteria = {
      ...criteria,
      transaction: "property-for-lease",
      category: "commercial-real-estate",
      bedrooms: [],
      constructionStatuses: [],
      propertyTypes: ["co-working-space-business-centre"],
      budgetMax: undefined,
      areaMin: 500,
    };
    expect(getActiveFilterChips(commercial).map((chip) => chip.label)).toEqual([
      "Ahmedabad",
      "Bopal",
      "Shyam Swastik",
      "Co-working Space/Business Centre",
      "500 sq ft - 50,000 sq ft",
    ]);
    expect(buildSearchHeading(commercial)).toBe(
      "Commercial Properties for Lease in Shyam Swastik, Bopal, Ahmedabad",
    );
  });

  it("labels pg occupancy and uses pg budget formatting", () => {
    const pg: PropertySearchCriteria = {
      ...criteria,
      transaction: "property-for-rent",
      category: "pg-co-living",
      bedrooms: [],
      propertyTypes: [],
      constructionStatuses: [],
      occupancies: ["triple-plus"],
      budgetMin: 5_000,
      budgetMax: undefined,
    };
    const labels = getActiveFilterChips(pg).map((chip) => chip.label);
    expect(labels).toContain("Triple+");
    expect(labels).toContain("₹5,000 - ₹1,00,000");
    expect(buildSearchHeading(pg)).toBe(
      "PG/Co-living in Shyam Swastik, Bopal, Ahmedabad",
    );
  });

  it("words plot and land headings", () => {
    const base = { ...criteria, bedrooms: [], cityName: "Pune", localities: [], projects: [] };
    expect(buildSearchHeading({ ...base, category: "plot" })).toBe(
      "Plots for Sale in Pune",
    );
    expect(
      buildSearchHeading({ ...base, category: "land", transaction: "property-for-rent" }),
    ).toBe("Land for Rent in Pune");
  });
});

describe("togglePropertyType", () => {
  const all = getCategoryFilters("residential-real-estate").propertyTypeOptions.map(
    (option) => option.value,
  );

  it("narrows from all-selected", () => {
    expect(togglePropertyType([], all, "penthouse")).toEqual(
      all.filter((value) => value !== "Penthouse"),
    );
  });

  it("lists every type again when everything is reselected", () => {
    const withoutPenthouse = all.filter((value) => value !== "Penthouse");
    expect(togglePropertyType(withoutPenthouse, all, "penthouse")).toEqual(all);
  });

  it("never deselects the last type", () => {
    expect(togglePropertyType(["penthouse"], all, "penthouse")).toEqual([
      "penthouse",
    ]);
  });
});

describe("toggleValue", () => {
  it("adds and removes", () => {
    expect(toggleValue([1], 2)).toEqual([1, 2]);
    expect(toggleValue([1, 2], 1)).toEqual([2]);
  });
});

describe("buildSearchHeading", () => {
  it("includes bhk, location and transaction", () => {
    expect(buildSearchHeading(criteria)).toBe(
      "3 BHK Properties for Sale in Shyam Swastik, Bopal, Ahmedabad",
    );
  });

  it("falls back to India without a location", () => {
    expect(
      buildSearchHeading({
        ...criteria,
        transaction: "property-for-rent",
        cityName: undefined,
        localities: [],
        projects: [],
        bedrooms: [],
      }),
    ).toBe("Properties for Rent in India");
  });
});
