import { describe, expect, it } from "vitest";
import { getCanonicalSearchRedirect } from "./canonicalSearchUrl";

const redirect = (
  searchParams: Record<string, string | string[] | undefined>,
  slug = "buy-flats-in-ahmedabad",
) => getCanonicalSearchRedirect({ slug, searchParams });

describe("getCanonicalSearchRedirect", () => {
  it("returns null for an already canonical url", () => {
    expect(redirect({ bedroom: "3", "max-price": "30000000" })).toBeNull();
    expect(redirect({ bedroom: "" })).toBeNull();
  });

  it("ignores empty params, so bedroom= is optional", () => {
    expect(redirect({})).toBeNull();
    expect(redirect({ bedroom: "" })).toBeNull();
  });

  it("redirects renamed keys and unknown keys to the canonical url", () => {
    expect(redirect({ propertyType: "penthouse", utm: "x" })).toBe(
      "/properties/buy-penthouse-in-ahmedabad?bedroom=&proptype=penthouse",
    );
  });

  it("drops the legacy city-name param, since the city is in the path", () => {
    expect(redirect({ "city-name": "pune" })).toBe(
      "/properties/buy-flats-in-ahmedabad?bedroom=",
    );
  });

  it("redirects uppercase values to lowercase", () => {
    expect(redirect({ locality: "Bopal" })).toBe(
      "/properties/buy-flats-in-ahmedabad?bedroom=&locality=bopal",
    );
  });

  it("redirects a non-canonical path casing", () => {
    expect(redirect({ bedroom: "" }, "Buy-Flats-In-Navi-Mumbai")).toBe(
      "/properties/buy-flats-in-navi-mumbai?bedroom=",
    );
  });

  it("keeps a multi type path canonical and redirects a mismatched one", () => {
    const params = { bedroom: "", proptype: "flat-apartment,bungalow-villa" };

    expect(redirect(params, "buy-flats-bungalows-in-ahmedabad")).toBeNull();
    expect(redirect(params)).toBe(
      "/properties/buy-flats-bungalows-in-ahmedabad?bedroom=&proptype=flat-apartment,bungalow-villa",
    );
  });

  it("keeps plot, land and pg paths canonical without a bedroom param", () => {
    expect(redirect({}, "plots-for-sale-in-pune")).toBeNull();
    expect(redirect({}, "pg-in-india")).toBeNull();
  });

  it("does not loop on decoded non-ascii values", () => {
    expect(redirect({ locality: "café-road" })).toBeNull();
  });

  it("returns null for an unparsable url", () => {
    expect(redirect({}, "unknown")).toBeNull();
  });
});
