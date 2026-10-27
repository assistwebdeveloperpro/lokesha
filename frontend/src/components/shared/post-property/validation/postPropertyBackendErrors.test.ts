import { describe, expect, it } from "vitest";
import { mapBackendField, resolveBackendErrors } from "./postPropertyBackendErrors";

const single = { isMulti: false };

describe("mapBackendField", () => {
  it.each([
    ["address.locality", 1, "address", "locality"],
    ["address.pinCode", 1, "address", "pinCode"],
    ["address.state", 1, undefined, undefined],
    ["listings.0.description", 1, "address", "propertyDescription"],
    ["listings.0.details.bedrooms", 2, "details", "bedrooms"],
    ["listings.0.details.balconies", 2, "details", "balcony"],
    ["listings.0.details.carpetArea", 2, "details", "carpetAreaNumber"],
    ["listings.0.details.isLeasedOut", 2, "details", "currentlyLeasedOut"],
    ["listings.0.plotDetails.plotArea", 2, "details", "plotAreaNumber"],
    ["listings.0.construction.possessionDate", 2, "details", "possessionDate"],
    ["listings.0.selections.tenantPreference", 2, "details", "tenantPreferences"],
    ["listings.0.details.furnishingStatus", 3, "amenities", "status"],
    ["listings.0.details.carParkingCount", 3, "amenities", "carParking"],
    ["listings.0.details.openSides", 3, undefined, undefined],
    ["listings.0.facing", 3, "amenities", "facing"],
    ["listings.0.amenities.amenities", 3, "amenities", "amenities"],
    ["listings.0.files.media.1", 4, "photos", undefined],
    ["listings.0.pricing.expectedPrice", 5, "pricing", "expectedPrice"],
    ["listings.0.pricing.noticePeriodMonths", 5, "pricing", "noticePeriod"],
    ["listings.0.variants", 2, undefined, undefined],
    ["listings.0.builder.listing.priceMin", 2, undefined, undefined],
    ["project.projectName", 1, undefined, undefined],
    ["project.faqs", 5, undefined, undefined],
    ["project.developerName", 2, undefined, undefined],
    ["listingType", 1, undefined, undefined],
    ["listings", 1, undefined, undefined],
  ])("places %s on step %i", (path, step, section, field) => {
    const { target } = mapBackendField(path);

    expect(target.step).toBe(step);
    expect(target.section).toBe(section);
    expect(target.field).toBe(field);
  });

  it("reads the listing index", () => {
    expect(mapBackendField("listings.2.details.bedrooms").listingIndex).toBe(2);
    expect(mapBackendField("address.locality").listingIndex).toBeNull();
  });
});

describe("resolveBackendErrors", () => {
  it("puts messages on the form fields and picks the earliest step", () => {
    const result = resolveBackendErrors(
      {
        "listings.0.pricing.expectedPrice": '"pricing.expectedPrice" is required',
        "listings.0.details.bedrooms": '"details.bedrooms" must be less than or equal to 10',
        "address.pinCode": "Pin code must be 6 digits",
        "listings.0.files.media.0": "File was not found in this draft",
      },
      single,
    );

    expect(result.step).toBe(1);
    expect(result.firstMessage).toBe("Pin code must be 6 digits");
    expect(result.addressLocationErrors).toEqual({ pinCode: "Pin code must be 6 digits" });
    expect(result.propertyDetailsErrors).toEqual({ bedrooms: "This field must be less than or equal to 10" });
    expect(result.pricingOthersErrors).toEqual({ expectedPrice: "This field is required" });
    expect(result.photosError).toBe("File was not found in this draft");
  });

  it("keeps the first message of a field", () => {
    const result = resolveBackendErrors(
      { "listings.0.details.bedrooms": "First", "listings.0.details.bedrooms.extra": "Second" },
      single,
    );

    expect(result.propertyDetailsErrors).toEqual({ bedrooms: "First" });
  });

  it("only gives the step and message with sub type tabs", () => {
    const result = resolveBackendErrors(
      { "listings.1.details.bedrooms": '"details.bedrooms" is required', "address.locality": "Locality is required" },
      { isMulti: true },
    );

    expect(result.step).toBe(1);
    expect(result.propertyDetailsErrors).toEqual({});
    expect(result.addressLocationErrors).toEqual({});
  });

  it("does not show errors of a later listing on the single form", () => {
    const result = resolveBackendErrors({ "listings.1.details.bedrooms": "Bad" }, single);

    expect(result.step).toBe(2);
    expect(result.propertyDetailsErrors).toEqual({});
  });

  it("reports no step when there are no errors", () => {
    expect(resolveBackendErrors({}, single)).toMatchObject({ step: null, firstMessage: "" });
  });
});
