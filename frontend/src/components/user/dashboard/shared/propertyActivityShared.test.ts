import { describe, expect, it } from "vitest";
import type { PublicSearchListing } from "@/components/landing/property-search/property-list/publicSearchListing.types";
import type { ActivityProperty } from "@/services/userPropertyActivity.types";
import {
  getListingTypeLabel,
  getPropertyLocation,
  getViewPropertyHref,
  humanizeSlug,
  isSearchListing,
} from "./propertyActivityShared";

const unavailable: ActivityProperty = {
  id: "7f0e2c1a-3b4d-4e5f-8a9b-0c1d2e3f4a5b",
  title: "2 BHK Flat",
  listingNumber: 100001,
  listingType: "sale",
  propertyType: "residential",
  locality: "Indiranagar",
  city: "Bengaluru",
};

const listing = {
  id: "7f0e2c1a-3b4d-4e5f-8a9b-0c1d2e3f4a5b",
  imageUrl: null,
  bedrooms: [2],
  carpetAreaMin: 1200,
  carpetAreaUnit: "sq-ft",
  propertySubType: "flat-apartment",
  propertyType: "residential",
  listingType: "sale",
  locality: "Indiranagar",
  city: "Bengaluru",
} as unknown as PublicSearchListing;

describe("isSearchListing", () => {
  it("tells a full search card from the unavailable summary", () => {
    expect(isSearchListing(listing)).toBe(true);
    expect(isSearchListing(unavailable)).toBe(false);
  });
});

describe("getPropertyLocation", () => {
  it("joins the locality and city", () => {
    expect(getPropertyLocation(unavailable)).toBe("Indiranagar, Bengaluru");
  });

  it("skips a missing city", () => {
    expect(getPropertyLocation({ ...unavailable, city: null })).toBe("Indiranagar");
  });
});

describe("getViewPropertyHref", () => {
  it("builds the property details url with the id", () => {
    const href = getViewPropertyHref(listing);

    expect(href.startsWith("/property-details/")).toBe(true);
    expect(href.endsWith(`&id=${listing.id}`)).toBe(true);
  });
});

describe("getListingTypeLabel", () => {
  it("labels sale and rent", () => {
    expect(getListingTypeLabel("sale")).toBe("Sale");
    expect(getListingTypeLabel("rent-lease")).toBe("Rent");
  });
});

describe("humanizeSlug", () => {
  it("turns a slug into a sentence", () => {
    expect(humanizeSlug("flat-apartment")).toBe("Flat apartment");
  });
});
