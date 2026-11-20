const { reportsQuerySchema } = require("./subscription-reports.validation");

describe("reportsQuerySchema", () => {
  it("accepts no range, a full range and a single day", () => {
    expect(reportsQuerySchema.validate({}).error).toBeUndefined();
    expect(reportsQuerySchema.validate({ from: "2026-11-01", to: "2026-11-30" }).error).toBeUndefined();
    expect(reportsQuerySchema.validate({ from: "2026-11-20", to: "2026-11-20" }).error).toBeUndefined();
  });

  it.each([[{ from: "2026-02-31" }], [{ to: "yesterday" }], [{ page: 1 }]])("rejects %j", (query) => {
    expect(reportsQuerySchema.validate(query).error).toBeDefined();
  });

  it("rejects a range that ends before it starts", () => {
    expect(reportsQuerySchema.validate({ from: "2026-11-30", to: "2026-11-01" }).error.message).toBe("From date cannot be after the to date");
  });
});
