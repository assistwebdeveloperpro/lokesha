import { describe, expect, it } from "vitest";
import { createEmptyPhotosVideosValues } from "../config/postPropertyForm.shared";
import {
  applyDetailsChange,
  clearAmenitiesErrors,
  clearDetailsErrors,
  clearPricingErrors,
  withoutConstructionProgress,
  withoutHiddenDetailsErrors,
  withoutHiddenPricingErrors,
} from "./postPropertyFormState";
import { INITIAL_PROPERTY_DETAILS } from "./postPropertyInitialValues";

describe("applyDetailsChange", () => {
  it("resets construction fields when the transaction changes", () => {
    const current = {
      ...INITIAL_PROPERTY_DETAILS,
      constructionStatus: "ready-to-move" as const,
      possessionDate: "2030-01-01",
      ageOfConstruction: "lt-1" as const,
    };

    const next = applyDetailsChange(current, "propertyTransaction", "resale");

    expect(next).toMatchObject({
      propertyTransaction: "resale",
      constructionStatus: "",
      possessionDate: "",
      ageOfConstruction: "",
    });
  });

  it("resets the floor number when total floors change", () => {
    const current = { ...INITIAL_PROPERTY_DETAILS, floorNumber: "4" };

    expect(applyDetailsChange(current, "totalFloors", "12").floorNumber).toBe("");
  });

  it("does not mutate the previous values", () => {
    const current = { ...INITIAL_PROPERTY_DETAILS };

    applyDetailsChange(current, "bedrooms", "3");

    expect(current.bedrooms).toBe("");
  });
});

describe("clearDetailsErrors", () => {
  it("returns the same object when nothing is cleared", () => {
    const errors = { bedrooms: "Required" };

    expect(clearDetailsErrors(errors, "lift")).toBe(errors);
  });

  it("clears the edited field and its dependants", () => {
    const errors = {
      propertyTransaction: "Required",
      constructionStatus: "Required",
      possessionDate: "Required",
      bedrooms: "Required",
    };

    expect(clearDetailsErrors(errors, "propertyTransaction")).toEqual({ bedrooms: "Required" });
  });

  it("clears the floor number error when total floors change", () => {
    expect(clearDetailsErrors({ floorNumber: "Required" }, "totalFloors")).toEqual({});
  });
});

describe("clearAmenitiesErrors", () => {
  it("returns the same object when nothing is cleared", () => {
    const errors = { carParking: "Required" };

    expect(clearAmenitiesErrors(errors, "facing")).toBe(errors);
  });

  it("clears car parking when availability changes", () => {
    expect(clearAmenitiesErrors({ carParking: "Required" }, "carParkingAvailable")).toEqual({});
  });
});

describe("clearPricingErrors", () => {
  it("clears only the edited field", () => {
    const errors = { expectedPrice: "Required", bookingAmount: "Required" };

    expect(clearPricingErrors(errors, "expectedPrice")).toEqual({ bookingAmount: "Required" });
  });
});

describe("hidden builder errors", () => {
  it("leaves errors untouched outside the builder form", () => {
    const errors = { bedrooms: "Required" };

    expect(withoutHiddenDetailsErrors(errors, false)).toBe(errors);
    expect(withoutHiddenPricingErrors({ expectedPrice: "Required" }, false)).toEqual({
      expectedPrice: "Required",
    });
  });

  it("drops the fields the builder form does not show", () => {
    const errors = {
      bedrooms: "Required",
      balcony: "Required",
      floorNumber: "Required",
      bathrooms: "Required",
      totalFloors: "Required",
    };

    expect(withoutHiddenDetailsErrors(errors, true)).toEqual({ totalFloors: "Required" });
    expect(
      withoutHiddenPricingErrors(
        { expectedPrice: "Required", bookingAmount: "Required", monthlyRent: "Required" },
        true,
      ),
    ).toEqual({ monthlyRent: "Required" });
  });
});

describe("withoutConstructionProgress", () => {
  it("returns the same photos when there are none to clear", () => {
    const photos = createEmptyPhotosVideosValues();

    expect(withoutConstructionProgress(photos)).toBe(photos);
  });

  it("empties only the construction progress category", () => {
    const photos = createEmptyPhotosVideosValues();
    const item = { previewUrl: "blob:1" } as never;
    photos.mediaByCategory["construction-progress"] = [item];
    photos.mediaByCategory["main-photo"] = [item];

    const next = withoutConstructionProgress(photos);

    expect(next.mediaByCategory["construction-progress"]).toEqual([]);
    expect(next.mediaByCategory["main-photo"]).toHaveLength(1);
  });
});
