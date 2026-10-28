import { describe, expect, it } from "vitest";
import type { PropertyDetailResponse, PropertyMediaFileDto } from "@/services/property.service";
import {
  formatValue,
  getMainPhotoImage,
  getSubTypeListingImages,
  humanizeKey,
  toDisplayEntries,
} from "./reviewPropertiesShared";

const image = (id: string, category: string): PropertyMediaFileDto => ({
  id,
  path: `/${id}.jpg`,
  category,
  mediaType: "image",
  originalName: null,
  mimeType: "image/jpeg",
  size: 1,
});

function detailWithListings(
  listings: PropertyDetailResponse["payload"]["listings"],
  listingFiles: PropertyDetailResponse["listingFiles"],
  media: PropertyMediaFileDto[] = [],
): PropertyDetailResponse {
  return {
    property: {
      id: "p1",
      listingNumber: 1,
      status: "pending",
      title: "Test",
      price: null,
      rejectionReason: null,
      createdAt: "",
      updatedAt: "",
      publishedAt: null,
    },
    payload: {
      propertyType: "residential",
      listingType: "sale",
      postingsAs: "builder",
      address: {},
      listings,
    } as PropertyDetailResponse["payload"],
    media,
    floorPlans: [],
    listingFiles,
  };
}

describe("humanizeKey", () => {
  it.each([
    ["carpetAreaUnit", "Carpet area unit"],
    ["bedrooms", "Bedrooms"],
    ["isFullHouse", "Is full house"],
  ])("%s -> %s", (key, label) => {
    expect(humanizeKey(key)).toBe(label);
  });
});

describe("formatValue", () => {
  it("formats booleans and lists", () => {
    expect(formatValue(true)).toBe("Yes");
    expect(formatValue(["a", "b"])).toBe("a, b");
    expect(formatValue(12)).toBe("12");
  });
});

describe("toDisplayEntries", () => {
  it("keeps real values and drops empty ones, false flags and nested objects", () => {
    const entries = toDisplayEntries({
      bedrooms: 3,
      carpetAreaUnit: "sq-ft",
      isFullHouse: true,
      hasPantry: false,
      note: "",
      missing: null,
      tags: [],
      list: ["x"],
      nested: { a: 1 },
    });

    expect(entries).toEqual([
      { label: "Bedrooms", value: "3" },
      { label: "Carpet area unit", value: "sq-ft" },
      { label: "Is full house", value: "Yes" },
      { label: "List", value: "x" },
    ]);
  });

  it("handles missing fields", () => {
    expect(toDisplayEntries(undefined)).toEqual([]);
  });
});

describe("listing images for detail modal", () => {
  it("keeps project photos out of other sub types and avoids detail.media fallback", () => {
    const main = image("main", "main-photo");
    const kitchen = image("kitchen", "kitchen");
    const detail = detailWithListings(
      [{ propertySubType: "flat-apartment" }, { propertySubType: "duplex" }],
      [
        { propertyId: "p1", media: [main, kitchen], floorPlans: [] },
        { propertyId: "p2", media: [], floorPlans: [] },
      ],
      [main, kitchen],
    );

    expect(getMainPhotoImage(detail, true)?.id).toBe("main");
    expect(getSubTypeListingImages(detail, 0, true).map((item) => item.id)).toEqual(["kitchen"]);
    expect(getSubTypeListingImages(detail, 1, true)).toEqual([]);
  });

  it("shows main photo after description for a single listing without duplicating it in photos", () => {
    const main = image("main", "main-photo");
    const kitchen = image("kitchen", "kitchen");
    const detail = detailWithListings([{ propertySubType: "flat-apartment" }], [
      { propertyId: "p1", media: [main, kitchen], floorPlans: [] },
    ]);

    expect(getMainPhotoImage(detail, false)?.id).toBe("main");
    expect(getSubTypeListingImages(detail, 0, false).map((item) => item.id)).toEqual(["kitchen"]);
  });
});
