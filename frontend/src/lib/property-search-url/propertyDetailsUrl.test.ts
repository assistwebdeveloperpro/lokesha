import { describe, expect, it } from "vitest";
import {
  buildPropertyDetailsSlug,
  buildPropertyDetailsUrl,
  getCanonicalDetailsRedirect,
  parsePropertyDetailsSlug,
  type PropertyDetailsSource,
} from "./propertyDetailsUrl";

const ID = "4d423837-3130-4331-8239-0a1b2c3d4e5f";

const source: PropertyDetailsSource = {
  id: ID,
  bedrooms: 4,
  carpetArea: 5500,
  carpetAreaUnit: "sq-ft",
  propertySubType: "penthouse",
  propertyType: "residential",
  listingType: "sale",
  locality: "South Bopal",
  city: "Ahmedabad",
};

const DESCRIPTOR = "4-BHK-5500-Sq-ft-Penthouse-FOR-Sale-South-Bopal-in-Ahmedabad";

describe("buildPropertyDetailsUrl", () => {
  it("builds the spec style url", () => {
    expect(buildPropertyDetailsUrl(source)).toBe(
      `/propertyDetails/${DESCRIPTOR}&id=${ID}`,
    );
  });

  it("skips missing parts and maps rent-lease to rent", () => {
    expect(
      buildPropertyDetailsSlug({
        ...source,
        bedrooms: null,
        carpetArea: null,
        propertySubType: null,
        listingType: "rent-lease",
        city: null,
      }),
    ).toBe(`Residential-FOR-Rent-South-Bopal&id=${ID}`);
  });
});

describe("parsePropertyDetailsSlug", () => {
  it("extracts the id from a built slug", () => {
    expect(parsePropertyDetailsSlug(buildPropertyDetailsSlug(source))).toEqual({
      id: ID,
      descriptor: DESCRIPTOR,
    });
  });

  it("decodes the percent-encoded segment Next passes in", () => {
    expect(
      parsePropertyDetailsSlug(`${DESCRIPTOR}%26id%3D${ID}`),
    ).toEqual({ id: ID, descriptor: DESCRIPTOR });
    expect(parsePropertyDetailsSlug("%E0%A4%A")).toBeNull();
  });

  it("accepts a bare id param and uppercase ids", () => {
    expect(parsePropertyDetailsSlug(`&id=${ID}`)?.id).toBe(ID);
    expect(parsePropertyDetailsSlug(`flat&id=${ID.toUpperCase()}`)?.id).toBe(ID);
  });

  it("rejects slugs without an id", () => {
    expect(parsePropertyDetailsSlug("4-BHK-Penthouse-in-Ahmedabad")).toBeNull();
    expect(parsePropertyDetailsSlug("flat&id=1234")).toBeNull();
    expect(parsePropertyDetailsSlug(`flat-${ID}`)).toBeNull();
  });
});

describe("getCanonicalDetailsRedirect", () => {
  it("returns null for the canonical slug", () => {
    expect(
      getCanonicalDetailsRedirect(buildPropertyDetailsSlug(source), source),
    ).toBeNull();
  });

  it("treats an encoded canonical slug as canonical", () => {
    const encoded = encodeURIComponent(buildPropertyDetailsSlug(source));
    expect(getCanonicalDetailsRedirect(encoded, source)).toBeNull();
  });

  it("redirects a stale slug", () => {
    expect(getCanonicalDetailsRedirect(`old-title&id=${ID}`, source)).toBe(
      buildPropertyDetailsUrl(source),
    );
  });
});
