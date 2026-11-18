const { listQuerySchema } = require("./user-leads.validation");

describe("listQuerySchema", () => {
  it("applies the defaults", () => {
    const { error, value } = listQuerySchema.validate({});

    expect(error).toBeUndefined();
    expect(value).toEqual({ page: 1, limit: 10 });
  });

  it("converts numeric strings", () => {
    expect(listQuerySchema.validate({ page: "2", limit: "20" }).value).toEqual({ page: 2, limit: 20 });
  });

  it("accepts a lead id only when it is a uuid", () => {
    expect(listQuerySchema.validate({ leadId: "3f1c2a9e-5b7d-4c11-9a3e-2d6f8b0c1e44" }).error).toBeUndefined();
    expect(listQuerySchema.validate({ leadId: "lead-1" }).error).toBeDefined();
  });

  it("rejects an invalid page or an oversized limit", () => {
    expect(listQuerySchema.validate({ page: 0 }).error).toBeDefined();
    expect(listQuerySchema.validate({ limit: 51 }).error).toBeDefined();
  });
});
