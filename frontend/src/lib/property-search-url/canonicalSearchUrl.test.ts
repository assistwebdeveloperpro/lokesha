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
      redirect({ bedroom: "3", cityName: "Ahmedabad", BudgetMax: "3-Crores" }),
    ).toBeNull();
    expect(redirect({ bedroom: "" })).toBeNull();
  });

  it("ignores empty params, so bedroom= is optional", () => {
    expect(redirect({ cityName: "Ahmedabad" })).toBeNull();
    expect(redirect({ cityName: "Ahmedabad", bedroom: "" })).toBeNull();
  });

  it("redirects renamed keys and unknown keys to the canonical url", () => {
    expect(
      redirect({ cityName: "Ahmedabad", propertyType: "Penthouse", utm: "x" }),
    ).toBe(
      "/property-for-sale/residential-real-estate?bedroom=&proptype=Penthouse&cityName=Ahmedabad",
    );
  });

  it("redirects a non-canonical category casing", () => {
    expect(redirect({ cityName: "Pune" }, "Residential-Real-Estate")).toBe(
      "/property-for-sale/residential-real-estate?bedroom=&cityName=Pune",
    );
  });

  it("does not loop on decoded non-ascii values", () => {
    expect(redirect({ Locality: "Café-Road" })).toBeNull();
  });

  it("returns null for an unparsable url", () => {
    expect(redirect({}, "unknown")).toBeNull();
  });
});
