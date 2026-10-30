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
      redirect({ bedroom: "3", "city-name": "Ahmedabad", "max-price": "30000000" }),
    ).toBeNull();
    expect(redirect({ bedroom: "" })).toBeNull();
  });

  it("ignores empty params, so bedroom= is optional", () => {
    expect(redirect({ "city-name": "Ahmedabad" })).toBeNull();
    expect(redirect({ "city-name": "Ahmedabad", bedroom: "" })).toBeNull();
  });

  it("redirects renamed keys and unknown keys to the canonical url", () => {
    expect(
      redirect({ "city-name": "Ahmedabad", propertyType: "Penthouse", utm: "x" }),
    ).toBe(
      "/property-for-sale/residential-real-estate?bedroom=&proptype=Penthouse&city-name=Ahmedabad",
    );
  });

  it("redirects a non-canonical category casing", () => {
    expect(redirect({ "city-name": "Pune" }, "Residential-Real-Estate")).toBe(
      "/property-for-sale/residential-real-estate?bedroom=&city-name=Pune",
    );
  });

  it("redirects legacy plot, land and pg paths to keyword paths", () => {
    expect(redirect({ "city-name": "Pune" }, "plot")).toBe(
      "/plots-for-sale?city-name=Pune",
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
        searchParams: { "city-name": "Pune" },
      }),
    ).toBeNull();
  });

  it("does not loop on decoded non-ascii values", () => {
    expect(redirect({ locality: "Café-Road" })).toBeNull();
  });

  it("returns null for an unparsable url", () => {
    expect(redirect({}, "unknown")).toBeNull();
  });
});
