import { describe, expect, it } from "vitest";
import { getCanonicalSearchRedirect } from "./canonicalSearchUrl";

const redirect = (
  searchParams: Record<string, string | string[] | undefined>,
  category = "residential-real-estate",
) =>
  getCanonicalSearchRedirect({
    transaction: "property-for-sale",
    category,
    searchParams,
  });

describe("getCanonicalSearchRedirect", () => {
  it("returns null for an already canonical url", () => {
    expect(
      redirect({ bedroom: "3", "city-name": "ahmedabad", "max-price": "30000000" }),
    ).toBeNull();
    expect(redirect({ bedroom: "" })).toBeNull();
  });

  it("ignores empty params, so bedroom= is optional", () => {
    expect(redirect({ "city-name": "ahmedabad" })).toBeNull();
    expect(redirect({ "city-name": "ahmedabad", bedroom: "" })).toBeNull();
  });

  it("redirects renamed keys and unknown keys to the canonical url", () => {
    expect(
      redirect({ "city-name": "ahmedabad", propertyType: "penthouse", utm: "x" }),
    ).toBe(
      "/property-for-sale/residential-real-estate?bedroom=&proptype=penthouse&city-name=ahmedabad",
    );
  });

  it("redirects uppercase values to lowercase", () => {
    expect(redirect({ "city-name": "Navi-Mumbai" })).toBe(
      "/property-for-sale/residential-real-estate?bedroom=&city-name=navi-mumbai",
    );
  });

  it("redirects a non-canonical category casing", () => {
    expect(redirect({ "city-name": "pune" }, "Residential-Real-Estate")).toBe(
      "/property-for-sale/residential-real-estate?bedroom=&city-name=pune",
    );
  });

  it("redirects legacy plot, land and pg paths to keyword paths", () => {
    expect(redirect({ "city-name": "pune" }, "plot")).toBe(
      "/plots-for-sale?city-name=pune",
    );
    expect(
      getCanonicalSearchRedirect({
        transaction: "property-for-rent",
        category: "pg-co-living",
        searchParams: {},
      }),
    ).toBe("/pg-for-rent");
  });

  it("keeps a keyword path canonical", () => {
    expect(
      getCanonicalSearchRedirect({
        transaction: "property-for-rent",
        category: "pg-co-living",
        pathname: "/pg-for-rent",
        searchParams: { "city-name": "pune" },
      }),
    ).toBeNull();
  });

  it("does not loop on decoded non-ascii values", () => {
    expect(redirect({ locality: "café-road"})).toBeNull();
  });

  it("returns null for an unparsable url", () => {
    expect(redirect({}, "unknown")).toBeNull();
  });
});
