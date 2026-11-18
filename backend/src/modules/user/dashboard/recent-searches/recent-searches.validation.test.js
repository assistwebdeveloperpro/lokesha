const {
  createSchema,
  syncEntrySchema,
  syncSchema,
  idParamSchema,
  listQuerySchema,
} = require("./recent-searches.validation");

const UUID = "3f2b1c9e-8a4d-4e6f-9b1a-2c3d4e5f6a7b";
const validate = (schema, value) => schema.validate(value, { abortEarly: false, stripUnknown: true });

const searchCriteria = {
  transaction: "property-for-sale",
  category: "residential-real-estate",
  cityName: "Ahmedabad",
};
const body = { searchCriteria, searchUrl: "/property-for-sale-in-ahmedabad" };

describe("createSchema", () => {
  it("accepts valid criteria and applies defaults", () => {
    const { error, value } = validate(createSchema, body);

    expect(error).toBeUndefined();
    expect(value.searchCriteria).toMatchObject({ localities: [], bedrooms: [], more: {} });
  });

  it("strips page, user id, title and hash", () => {
    const { value } = validate(createSchema, {
      ...body,
      userId: "attacker",
      title: "x",
      criteriaHash: "y",
      searchCriteria: { ...searchCriteria, page: 3, userId: "attacker" },
    });

    expect(value).not.toHaveProperty("userId");
    expect(value).not.toHaveProperty("title");
    expect(value).not.toHaveProperty("criteriaHash");
    expect(value.searchCriteria).not.toHaveProperty("page");
    expect(value.searchCriteria).not.toHaveProperty("userId");
  });

  it.each([
    ["unknown transaction", { searchCriteria: { ...searchCriteria, transaction: "buy" } }],
    ["unknown category", { searchCriteria: { ...searchCriteria, category: "villa" } }],
    ["negative budget", { searchCriteria: { ...searchCriteria, budgetMin: -1 } }],
    ["budget min above max", { searchCriteria: { ...searchCriteria, budgetMin: 10, budgetMax: 5 } }],
    ["area min above max", { searchCriteria: { ...searchCriteria, areaMin: 10, areaMax: 5 } }],
    ["too many localities", { searchCriteria: { ...searchCriteria, localities: Array(51).fill("a") } }],
    ["absolute url", { searchUrl: "https://evil.com" }],
    ["protocol relative url", { searchUrl: "//evil.com" }],
    ["missing url", { searchUrl: undefined }],
    ["missing criteria", { searchCriteria: undefined }],
  ])("rejects %s", (_, override) => {
    expect(validate(createSchema, { ...body, ...override }).error).toBeDefined();
  });

  it("accepts a one-sided range", () => {
    const { error } = validate(createSchema, { ...body, searchCriteria: { ...searchCriteria, budgetMax: 5 } });

    expect(error).toBeUndefined();
  });

  it("limits the more filters to known keys", () => {
    const { value } = validate(createSchema, {
      ...body,
      searchCriteria: { ...searchCriteria, more: { hasRera: true, injected: "x" } },
    });

    expect(value.searchCriteria.more).toEqual({ hasRera: true });
  });
});

describe("syncEntrySchema", () => {
  it("converts searchedAt to a date", () => {
    const { error, value } = validate(syncEntrySchema, { ...body, searchedAt: "2026-11-18T10:00:00.000Z" });

    expect(error).toBeUndefined();
    expect(value.searchedAt).toBeInstanceOf(Date);
  });

  it("rejects a missing or invalid searchedAt", () => {
    expect(validate(syncEntrySchema, body).error).toBeDefined();
    expect(validate(syncEntrySchema, { ...body, searchedAt: "yesterday" }).error).toBeDefined();
  });
});

describe("syncSchema", () => {
  it("accepts one to twenty entries of any shape", () => {
    expect(validate(syncSchema, { searches: [{ anything: true }] }).error).toBeUndefined();
  });

  it.each([[[]], [Array(21).fill({})], [undefined]])("rejects %p", (searches) => {
    expect(validate(syncSchema, { searches }).error).toBeDefined();
  });
});

describe("idParamSchema", () => {
  it("accepts a uuid only", () => {
    expect(validate(idParamSchema, { id: UUID }).error).toBeUndefined();
    expect(validate(idParamSchema, { id: "123" }).error).toBeDefined();
  });
});

describe("listQuerySchema", () => {
  it("defaults the limit to 20", () => {
    expect(validate(listQuerySchema, {}).value).toEqual({ limit: 20 });
  });

  it.each([{ limit: 0 }, { limit: 21 }])("rejects %p", (query) => {
    expect(validate(listQuerySchema, query).error).toBeDefined();
  });
});
