import { describe, expect, it } from "vitest";
import type { SavedProperty, SavedPropertyListing } from "@/services/savedProperties.service";
import {
  getPageAfterRemoval,
  getSavedImages,
  getSavedLocation,
  getSavedPriceLabel,
  isNewSave,
  isSavedListing,
  toShareListItem,
} from "./savedPropertiesShared";

const HOUR_MS = 60 * 60 * 1000;

const unavailable: SavedProperty["property"] = {
  id: "7f0e2c1a-3b4d-4e5f-8a9b-0c1d2e3f4a5b",
  title: "2 BHK Flat",
  listingNumber: 100001,
  listingType: "sale",
  propertyType: "residential",
  locality: "Indiranagar",
  city: "Bengaluru",
};

const buildListing = (overrides: Partial<SavedPropertyListing> = {}) =>
  ({
    imageUrl: "main.jpg",
    imageUrls: ["main.jpg", "second.jpg"],
    listingType: "sale",
    propertyType: "residential",
    price: 5_000_000,
    priceMin: 5_000_000,
    priceMax: 5_000_000,
    ...overrides,
  }) as unknown as SavedPropertyListing;

describe("isNewSave", () => {
  const now = Date.now();

  it("flags a save made within 48 hours", () => {
    expect(isNewSave(new Date(now - 47 * HOUR_MS).toISOString(), now)).toBe(true);
  });

  it("does not flag an older save", () => {
    expect(isNewSave(new Date(now - 49 * HOUR_MS).toISOString(), now)).toBe(false);
  });
});

describe("isSavedListing", () => {
  it("tells a full card from the unavailable summary", () => {
    expect(isSavedListing(buildListing())).toBe(true);
    expect(isSavedListing(unavailable)).toBe(false);
  });
});

describe("getSavedLocation", () => {
  it("joins the locality and city", () => {
    expect(getSavedLocation(unavailable)).toBe("Indiranagar, Bengaluru");
  });

  it("skips a missing city", () => {
    expect(getSavedLocation({ ...unavailable, city: null })).toBe("Indiranagar");
  });
});

describe("getSavedPriceLabel", () => {
  it("shows Price On Request when there is no price", () => {
    expect(getSavedPriceLabel(buildListing({ price: null, priceMin: null, priceMax: null }))).toBe(
      "Price On Request",
    );
  });

  it("formats a real price", () => {
    expect(getSavedPriceLabel(buildListing())).not.toBe("Price On Request");
  });
});

describe("getSavedImages", () => {
  it("prefers the gallery images", () => {
    expect(getSavedImages(buildListing())).toEqual(["main.jpg", "second.jpg"]);
  });

  it("falls back to the main image", () => {
    expect(getSavedImages(buildListing({ imageUrls: [] }))).toEqual(["main.jpg"]);
  });

  it("returns nothing when the listing has no photo", () => {
    expect(getSavedImages(buildListing({ imageUrls: [], imageUrl: null }))).toEqual([]);
  });
});

describe("getPageAfterRemoval", () => {
  it("steps back when the last row of a later page is removed", () => {
    expect(getPageAfterRemoval(3, 1)).toBe(2);
  });

  it("stays on the page while rows remain", () => {
    expect(getPageAfterRemoval(3, 5)).toBe(3);
  });

  it("never goes below the first page", () => {
    expect(getPageAfterRemoval(1, 1)).toBe(1);
  });
});

describe("toShareListItem", () => {
  const listing = buildListing({
    id: "p1",
    shortCode: "Al65",
    title: "Sunrise",
    locality: "Bopal",
    city: "Ahmedabad",
  });
  const saved = (overrides: Partial<SavedProperty>): SavedProperty => ({
    id: "s1",
    propertyId: "p1",
    savedAt: new Date().toISOString(),
    isAvailable: true,
    property: listing,
    ...overrides,
  });

  it("maps an available listing to a share item", () => {
    expect(toShareListItem(saved({}))).toEqual({
      id: "p1",
      shortCode: "Al65",
      title: "Sunrise",
      location: "Bopal, Ahmedabad",
      imageUrl: "main.jpg",
    });
  });

  it("skips properties that are no longer available", () => {
    expect(toShareListItem(saved({ isAvailable: false, property: unavailable }))).toBeNull();
  });
});
