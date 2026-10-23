const { createPropertySchema, updatePropertySchema, listQuerySchema } = require("./property.validation");

const futureDate = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().slice(0, 10);
};

const address = {
  projectName: "Green Heights",
  locality: "Indiranagar",
  pinCode: "560038",
  state: "Karnataka",
  propertyDescription: "Spacious corner flat",
};

const baseDetails = {
  carpetArea: 1200,
  carpetAreaUnit: "sq-ft",
  superBuildUpUnit: "sq-ft",
  bedrooms: 3,
  balconies: 2,
  totalFloors: 10,
  floorNumber: 4,
  bathrooms: 2,
};

const salePayload = (overrides = {}) => ({
  listingType: "sale",
  propertyType: "residential",
  propertySubType: "flat-apartment",
  address,
  details: { ...baseDetails, propertyTransaction: "resale", ageOfConstruction: "lt-1" },
  pricing: { expectedPrice: 4500000, bookingAmount: 100000 },
  ...overrides,
});

const rentPayload = (overrides = {}) => ({
  listingType: "rent-lease",
  propertyType: "residential",
  propertySubType: "flat-apartment",
  address,
  details: {
    ...baseDetails,
    ageOfConstruction: "lt-1",
    availableFrom: futureDate(),
    tenantPreferences: ["family"],
  },
  pricing: { monthlyRent: 25000, noticePeriod: 2, depositAmount: 50000 },
  ...overrides,
});

const validate = (schema, payload) => schema.validate(payload, { abortEarly: false });

describe("createPropertySchema", () => {
  it("accepts a valid resale listing", () => {
    expect(validate(createPropertySchema, salePayload()).error).toBeUndefined();
  });

  it("accepts a valid rent listing", () => {
    expect(validate(createPropertySchema, rentPayload()).error).toBeUndefined();
  });

  it("requires the possession date and status for new construction", () => {
    const payload = salePayload({
      details: { ...baseDetails, propertyTransaction: "new" },
    });

    const { error } = validate(createPropertySchema, payload);

    expect(error.details.map((detail) => detail.path.join("."))).toEqual(
      expect.arrayContaining(["details.constructionStatus", "details.possessionDate"]),
    );
  });

  it("rejects a past possession date on create but not on update", () => {
    const details = {
      ...baseDetails,
      propertyTransaction: "new",
      constructionStatus: "under-construction",
      possessionDate: "2020-01-01",
    };

    expect(validate(createPropertySchema, salePayload({ details })).error.message).toMatch(
      /Possession date cannot be in the past/,
    );
    expect(validate(updatePropertySchema, salePayload({ details })).error).toBeUndefined();
  });

  it("rejects a floor number above total floors", () => {
    const payload = salePayload({
      details: {
        ...baseDetails,
        floorNumber: 11,
        propertyTransaction: "resale",
        ageOfConstruction: "lt-1",
      },
    });

    expect(validate(createPropertySchema, payload).error.message).toMatch(
      /Floor number cannot exceed total floors/,
    );
  });

  it("rejects a pin code that is not 6 digits", () => {
    const payload = salePayload({ address: { ...address, pinCode: "123" } });

    expect(validate(createPropertySchema, payload).error.message).toMatch(
      /Pincode must be 6 digits/,
    );
  });

  it("requires tenant preferences for rent but forbids them for sale", () => {
    const rent = rentPayload();
    rent.details.tenantPreferences = [];

    expect(validate(createPropertySchema, rent).error).toBeDefined();

    const sale = salePayload();
    sale.details.tenantPreferences = ["family"];

    expect(validate(createPropertySchema, sale).error).toBeDefined();
  });

  it("requires a car parking count when parking is available", () => {
    const payload = salePayload({ amenities: { carParkingAvailable: true } });

    const { error } = validate(createPropertySchema, payload);

    expect(error.details.map((detail) => detail.path.join("."))).toContain(
      "amenities.carParking",
    );
  });

  it("rejects a sub type that does not belong to the property type", () => {
    expect(
      validate(createPropertySchema, salePayload({ propertySubType: "shop" })).error.message,
    ).toMatch(/sub type is invalid/);
  });

  it("rejects any sub type for PG / co-living", () => {
    const payload = rentPayload({ propertyType: "pg-co-living" });

    expect(validate(createPropertySchema, payload).error.message).toMatch(/not allowed/);
  });

  it("normalises comma separated sub types and drops duplicates", () => {
    const payload = salePayload({ propertySubType: "flat-apartment,penthouse,flat-apartment" });

    const { value, error } = validate(createPropertySchema, payload);

    expect(error).toBeUndefined();
    expect(value.propertySubType).toBe("flat-apartment,penthouse");
  });

  it("limits the number of media categories", () => {
    const payload = salePayload({ mediaCategories: Array(51).fill("main-photo") });

    expect(validate(createPropertySchema, payload).error).toBeDefined();
  });
});

describe("listQuerySchema", () => {
  it("applies pagination defaults", () => {
    const { value } = listQuerySchema.validate({});

    expect(value).toEqual({ page: 1, limit: 12 });
  });

  it("caps the page size at 50", () => {
    expect(listQuerySchema.validate({ limit: 51 }).error).toBeDefined();
  });
});
