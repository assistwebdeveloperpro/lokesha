import { describe, expect, it } from "vitest";
import {
  formatPostedDate,
  formatPrice,
  getEditHref,
  getHeading,
  getListingLabel,
  getStatusAction,
  getSubtitle,
} from "./managePropertiesShared";

describe("formatPrice", () => {
  it("uses Indian digit grouping", () => {
    expect(formatPrice({ price: 5000000, listingType: "sale" })).toBe("₹50,00,000");
  });

  it("adds a per month suffix for rent", () => {
    expect(formatPrice({ price: 20000, listingType: "rent-lease" })).toBe("₹20,000/month");
  });

  it("handles a missing price", () => {
    expect(formatPrice({ price: null, listingType: "sale" })).toBe("Price on request");
  });

  it("shows a range when the sub types are priced differently", () => {
    expect(formatPrice({ price: 2500000, priceMin: 2500000, priceMax: 9000000, listingType: "sale" })).toBe(
      "₹25,00,000 - ₹90,00,000",
    );
  });

  it("shows one amount when the range is a single price", () => {
    expect(formatPrice({ price: 2500000, priceMin: 2500000, priceMax: 2500000, listingType: "sale" })).toBe(
      "₹25,00,000",
    );
  });
});

describe("getHeading", () => {
  it("prefers the project name over the title", () => {
    expect(getHeading({ title: "Sky Towers Shop", projectName: "Sky Towers" })).toBe("Sky Towers");
    expect(getHeading({ title: "Shop in Vesu", projectName: null })).toBe("Shop in Vesu");
  });
});

describe("getListingLabel", () => {
  it.each([
    ["sale", "residential", "Sale"],
    ["rent-lease", "commercial", "Rent"],
    ["rent-lease", "pg-co-living", "PG"],
  ])("labels %s %s as %s", (listingType, propertyType, label) => {
    expect(getListingLabel({ listingType, propertyType })).toBe(label);
  });
});

describe("getSubtitle", () => {
  it("joins the sub type and city", () => {
    expect(getSubtitle({ subType: { slug: "flat-apartment", name: "Flat/Apartment" }, city: "Surat" })).toBe(
      "Flat/Apartment · Surat",
    );
  });

  it("lists every sub type posted together", () => {
    const subTypes = [
      { slug: "shop", name: "Shop" },
      { slug: "showroom", name: "Showroom" },
    ];
    expect(getSubtitle({ subType: subTypes[0], subTypes, city: "Surat" })).toBe("Shop, Showroom · Surat");
  });

  it("skips a missing city", () => {
    expect(getSubtitle({ subType: { slug: "shop", name: "Shop" }, city: null })).toBe("Shop");
  });
});

describe("getStatusAction", () => {
  it.each([
    ["draft", "submit"],
    ["published", "close"],
    ["closed", "reopen"],
    ["pending", null],
    ["rejected", null],
  ] as const)("%s -> %s", (status, action) => {
    expect(getStatusAction(status)).toBe(action);
  });
});

describe("formatPostedDate and getEditHref", () => {
  it("formats a valid date and ignores an invalid one", () => {
    expect(formatPostedDate("2026-03-05T10:00:00.000Z")).toMatch(/2026/);
    expect(formatPostedDate("nope")).toBe("");
  });

  it("links to the edit form", () => {
    expect(getEditHref("abc")).toBe("/post-property?edit=abc");
  });
});
