import { describe, expect, it } from "vitest";
import {
  DEFAULT_LIMELIGHT_FILTERS,
  LIMELIGHT_SEARCH_PAGE_SIZE,
  formatProjectLocation,
  formatProjectPrice,
  moveItem,
  pluralizeProjects,
  toSearchQuery,
} from "./limelightShared";

const project = {
  projectId: "bp-1",
  projectName: "Shyam Kutir 86",
  builderName: "Shyam Group",
  locality: "Hathijan",
  city: "Ahmedabad",
  priceMin: 7_500_000,
  priceMax: 25_000_000,
  mainImage: null,
};

describe("toSearchQuery", () => {
  it("leaves every filter out when nothing is set", () => {
    expect(toSearchQuery(DEFAULT_LIMELIGHT_FILTERS, 1)).toEqual({
      page: 1,
      limit: LIMELIGHT_SEARCH_PAGE_SIZE,
      keyword: undefined,
      city: undefined,
      locality: undefined,
      builder: undefined,
      propertyType: undefined,
      bhk: undefined,
      priceMin: undefined,
      priceMax: undefined,
      possessionStatus: undefined,
      listedBy: undefined,
    });
  });

  it("trims text and converts lakh prices to rupees", () => {
    const query = toSearchQuery(
      { ...DEFAULT_LIMELIGHT_FILTERS, keyword: "  shyam ", priceMin: "75", priceMax: "250.5", bhk: "3" },
      2,
    );

    expect(query).toMatchObject({ page: 2, keyword: "shyam", priceMin: "7500000", priceMax: "25050000", bhk: "3" });
  });

  it("keeps a zero minimum price", () => {
    expect(toSearchQuery({ ...DEFAULT_LIMELIGHT_FILTERS, priceMin: "0" }, 1).priceMin).toBe("0");
  });
});

describe("moveItem", () => {
  it("moves an item to a new position", () => {
    expect(moveItem(["a", "b", "c"], 0, 2)).toEqual(["b", "c", "a"]);
    expect(moveItem(["a", "b", "c"], 2, 1)).toEqual(["a", "c", "b"]);
  });

  it("does not change the original list", () => {
    const items = ["a", "b"];

    moveItem(items, 0, 1);

    expect(items).toEqual(["a", "b"]);
  });

  it.each([
    [1, 1],
    [-1, 0],
    [0, 5],
  ])("returns the same list for a move from %i to %i", (from, to) => {
    const items = ["a", "b", "c"];

    expect(moveItem(items, from, to)).toBe(items);
  });
});

describe("formatProjectPrice", () => {
  it("shows a range", () => {
    expect(formatProjectPrice(project)).toBe("₹ 75 Lac - ₹ 2.5 Cr");
  });

  it("shows one price when the range is a single value", () => {
    expect(formatProjectPrice({ ...project, priceMax: project.priceMin })).toBe("₹ 75 Lac");
  });

  it("falls back when there is no price", () => {
    expect(formatProjectPrice({ ...project, priceMin: null, priceMax: null })).toBe("Price on request");
  });
});

describe("formatProjectLocation", () => {
  it("joins locality and city", () => {
    expect(formatProjectLocation(project)).toBe("Hathijan, Ahmedabad");
  });

  it("falls back when both are missing", () => {
    expect(formatProjectLocation({ ...project, locality: null, city: null })).toBe("Location not available");
  });
});

describe("pluralizeProjects", () => {
  it("handles one and many", () => {
    expect(pluralizeProjects(1)).toBe("1 project");
    expect(pluralizeProjects(10)).toBe("10 projects");
  });
});
