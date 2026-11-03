const { searchQuerySchema, propertyIdParamSchema } = require("./property-search.validation");

const required = { listingType: "sale", category: "residential" };
const validate = (query) => searchQuerySchema.validate(query, { abortEarly: false, stripUnknown: true });

describe("searchQuerySchema", () => {
  it("applies defaults for every optional value", () => {
    const { value, error } = validate(required);

    expect(error).toBeUndefined();
    expect(value).toMatchObject({ page: 1, pageSize: 30, sort: "recent", localities: [], bedrooms: [], amenities: [] });
  });

  it("splits comma separated lists and converts numbers", () => {
    const { value } = validate({ ...required, localities: "Bopal, Naroda", bedrooms: "2,3", budgetMin: "100", hasRera: "true" });

    expect(value).toMatchObject({ localities: ["Bopal", "Naroda"], bedrooms: [2, 3], budgetMin: 100, hasRera: true });
  });

  it("rejects a missing listing type and unknown values", () => {
    expect(validate({ category: "residential" }).error).toBeDefined();
    expect(validate({ ...required, category: "villa" }).error).toBeDefined();
    expect(validate({ ...required, sort: "random" }).error).toBeDefined();
    expect(validate({ ...required, postedBy: "admin" }).error).toBeDefined();
  });

  it("rejects bad numbers and ranges", () => {
    expect(validate({ ...required, bedrooms: "two" }).error).toBeDefined();
    expect(validate({ ...required, budgetMin: "500", budgetMax: "100" }).error).toBeDefined();
    expect(validate({ ...required, pageSize: "500" }).error).toBeDefined();
  });

  it("drops unknown params", () => {
    expect(validate({ ...required, status: "draft" }).value).not.toHaveProperty("status");
  });
});

describe("propertyIdParamSchema", () => {
  it("accepts only uuids", () => {
    expect(propertyIdParamSchema.validate({ id: "3f2b8c1e-9d4a-4e6b-8a1c-2d5f7a9b0c3e" }).error).toBeUndefined();
    expect(propertyIdParamSchema.validate({ id: "123" }).error).toBeDefined();
  });
});
