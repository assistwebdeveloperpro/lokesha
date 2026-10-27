import { describe, expect, it } from "vitest";
import {
  formatPostedDate,
  formatPrice,
  getEditHref,
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
