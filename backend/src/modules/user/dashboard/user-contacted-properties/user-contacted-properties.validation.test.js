const { listQuerySchema } = require("./user-contacted-properties.validation");

describe("listQuerySchema", () => {
  it("applies the defaults", () => {
    const { error, value } = listQuerySchema.validate({});

    expect(error).toBeUndefined();
    expect(value).toEqual({ page: 1, limit: 10, availability: "all" });
  });

  it("accepts each availability filter", () => {
    ["all", "available", "unavailable"].forEach((availability) => {
      expect(listQuerySchema.validate({ availability }).error).toBeUndefined();
    });
  });

  it("rejects an unknown availability", () => {
    expect(listQuerySchema.validate({ availability: "closed" }).error).toBeDefined();
  });

  it("rejects a page below 1 and a limit above 50", () => {
    expect(listQuerySchema.validate({ page: 0 }).error).toBeDefined();
    expect(listQuerySchema.validate({ limit: 51 }).error).toBeDefined();
  });
});
