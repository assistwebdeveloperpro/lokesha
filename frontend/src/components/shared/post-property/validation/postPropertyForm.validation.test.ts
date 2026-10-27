import { describe, expect, it } from "vitest";
import {
  INITIAL_ADDRESS_LOCATION,
  INITIAL_AMENITIES,
  INITIAL_PRICING_OTHERS,
} from "../state/postPropertyInitialValues";
import {
  hasAddressLocationErrors,
  hasPricingOthersErrors,
  validateAddressLocation,
  validateAmenities,
  validatePricingOthers,
} from "../config/postPropertyForm.shared";

const validAddress = {
  ...INITIAL_ADDRESS_LOCATION,
  projectName: "Green Heights",
  locality: "Indiranagar",
  pinCode: "560038",
  propertyDescription: "Spacious corner flat",
};

describe("validateAddressLocation", () => {
  it("passes a complete address", () => {
    expect(hasAddressLocationErrors(validateAddressLocation(validAddress))).toBe(false);
  });

  it("reports every missing required field", () => {
    expect(validateAddressLocation(INITIAL_ADDRESS_LOCATION)).toEqual({
      projectName: "Please enter the name of society, building, or project name",
      locality: "Please enter locality",
      pinCode: "Please enter pin code",
      propertyDescription: "Please enter property description",
    });
  });

  it("skips the project name when it is optional", () => {
    const errors = validateAddressLocation(
      { ...validAddress, projectName: "" },
      { projectNameOptional: true },
    );

    expect(errors).toEqual({});
  });

  it("rejects a pin code that is not 6 digits", () => {
    expect(validateAddressLocation({ ...validAddress, pinCode: "12345" })).toEqual({
      pinCode: "Pin code must be 6 digits",
    });
  });
});

describe("validatePricingOthers for rent", () => {
  const validRent = {
    ...INITIAL_PRICING_OTHERS,
    monthlyRent: "25,000",
    noticePeriod: "2",
    depositAmount: "50,000",
  };

  it("passes complete rent pricing", () => {
    const errors = validatePricingOthers(validRent, "rent-lease", "residential", "");

    expect(hasPricingOthersErrors(errors)).toBe(false);
  });

  it("asks for the required amounts", () => {
    expect(
      validatePricingOthers(INITIAL_PRICING_OTHERS, "rent-lease", "residential", ""),
    ).toEqual({
      monthlyRent: "Please enter monthly rent",
      noticePeriod: "Please enter notice period",
      depositAmount: "Please enter deposit amount",
    });
  });

  it("rejects a notice period outside 0 to 60 whole months", () => {
    const message = "Notice period must be between 0 and 60 months";

    expect(
      validatePricingOthers({ ...validRent, noticePeriod: "61" }, "rent-lease", "residential", "")
        .noticePeriod,
    ).toBe(message);
    expect(
      validatePricingOthers({ ...validRent, noticePeriod: "1.5" }, "rent-lease", "residential", "")
        .noticePeriod,
    ).toBe(message);
  });

  it("rejects an amount above the backend maximum", () => {
    const errors = validatePricingOthers(
      { ...validRent, monthlyRent: "100000000000000" },
      "rent-lease",
      "residential",
      "",
    );

    expect(errors.monthlyRent).toBe("Please enter a valid monthly rent");
  });
});

describe("validatePricingOthers for sale", () => {
  it("asks for expected price and booking amount", () => {
    expect(validatePricingOthers(INITIAL_PRICING_OTHERS, "sale", "land", "")).toEqual({
      expectedPrice: "Please enter expected price",
      bookingAmount: "Please enter booking amount",
    });
  });

  it("accepts comma formatted amounts", () => {
    const errors = validatePricingOthers(
      { ...INITIAL_PRICING_OTHERS, expectedPrice: "45,00,000", bookingAmount: "1,00,000" },
      "sale",
      "land",
      "",
    );

    expect(errors).toEqual({});
  });
});

describe("validateAmenities", () => {
  const context = { listingType: "sale" as const };
  const requiredKeys = ["status", "amenities"];

  it("requires status and amenities for a residential listing", () => {
    const errors = validateAmenities(INITIAL_AMENITIES, "residential", context);

    expect(Object.keys(errors)).toEqual(expect.arrayContaining(requiredKeys));
  });

  it("requires a furnishing item once a furnished status is chosen", () => {
    const errors = validateAmenities(
      { ...INITIAL_AMENITIES, status: "furnished" },
      "residential",
      context,
    );

    expect(errors.furnishing).toBeDefined();
  });

  it("skips status, furnishing and amenities errors when optional", () => {
    const errors = validateAmenities(INITIAL_AMENITIES, "residential", {
      ...context,
      optionalAmenities: true,
    });

    expect(errors.status).toBeUndefined();
    expect(errors.furnishing).toBeUndefined();
    expect(errors.amenities).toBeUndefined();
  });

  it("skips the furnishing item error when optional", () => {
    const errors = validateAmenities(
      { ...INITIAL_AMENITIES, status: "furnished" },
      "residential",
      { ...context, optionalAmenities: true },
    );

    expect(errors.furnishing).toBeUndefined();
  });

  it("still validates other fields when optional", () => {
    const errors = validateAmenities(
      { ...INITIAL_AMENITIES, carParkingAvailable: true },
      "residential",
      { ...context, optionalAmenities: true },
    );

    expect(errors.carParking).toBeDefined();
  });
});
