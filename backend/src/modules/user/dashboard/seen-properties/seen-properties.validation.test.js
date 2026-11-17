const { listQuerySchema, propertyIdParamSchema, syncSchema } = require("./seen-properties.validation");

const UUID = "3f2b1c9e-8a4d-4e6f-9b1a-2c3d4e5f6a7b";
const validate = (schema, value) => schema.validate(value, { abortEarly: false, stripUnknown: true });

describe("listQuerySchema", () => {
  it("applies the defaults", () => {
    expect(validate(listQuerySchema, {}).value).toEqual({ page: 1, limit: 20 });
  });

  it.each([{ page: 0 }, { limit: 0 }, { limit: 51 }])("rejects %p", (query) => {
    expect(validate(listQuerySchema, query).error).toBeDefined();
  });
});

describe("propertyIdParamSchema", () => {
  it("accepts a uuid", () => {
    expect(validate(propertyIdParamSchema, { id: UUID }).error).toBeUndefined();
  });

  it("rejects anything else", () => {
    expect(validate(propertyIdParamSchema, { id: "123" }).error).toBeDefined();
  });
});

describe("syncSchema", () => {
  const entry = { propertyId: UUID, viewedAt: "2026-11-17T10:30:00.000Z" };

  it("accepts and converts valid entries", () => {
    const { error, value } = validate(syncSchema, { properties: [entry] });

    expect(error).toBeUndefined();
    expect(value.properties[0].viewedAt).toBeInstanceOf(Date);
  });

  it("strips a user id sent in the body", () => {
    const { value } = validate(syncSchema, { userId: "attacker", properties: [entry] });

    expect(value).not.toHaveProperty("userId");
  });

  it.each([
    ["missing properties", {}],
    ["an empty list", { properties: [] }],
    ["a bad property id", { properties: [{ ...entry, propertyId: "nope" }] }],
    ["a bad timestamp", { properties: [{ ...entry, viewedAt: "yesterday" }] }],
    ["a missing timestamp", { properties: [{ propertyId: UUID }] }],
    ["too many entries", { properties: Array.from({ length: 101 }, () => entry) }],
  ])("rejects %s", (_label, body) => {
    expect(validate(syncSchema, body).error).toBeDefined();
  });
});
