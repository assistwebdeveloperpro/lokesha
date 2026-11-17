const {
  listQuerySchema,
  savePropertySchema,
  propertyIdParamSchema,
} = require("./saved-properties.validation");

const VALID_ID = "3f6c2a1e-8b4d-4c1a-9e5f-1a2b3c4d5e6f";

describe("listQuerySchema", () => {
  it("applies the defaults", () => {
    const { error, value } = listQuerySchema.validate({});

    expect(error).toBeUndefined();
    expect(value).toEqual({ page: 1, limit: 10 });
  });

  it("converts numeric strings", () => {
    expect(listQuerySchema.validate({ page: "2", limit: "20" }).value).toEqual({
      page: 2,
      limit: 20,
    });
  });

  it.each([{ page: 0 }, { limit: 0 }, { limit: 51 }, { page: 1.5 }])("rejects %p", (query) => {
    expect(listQuerySchema.validate(query).error).toBeDefined();
  });
});

describe.each([
  ["savePropertySchema", savePropertySchema],
  ["propertyIdParamSchema", propertyIdParamSchema],
])("%s", (_name, schema) => {
  it("accepts a uuid", () => {
    expect(schema.validate({ propertyId: VALID_ID }).error).toBeUndefined();
  });

  it.each([undefined, "", "123", "not-a-uuid"])("rejects %p", (propertyId) => {
    expect(schema.validate({ propertyId }).error).toBeDefined();
  });
});
