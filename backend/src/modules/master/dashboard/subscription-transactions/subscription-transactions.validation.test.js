const { transactionsQuerySchema } = require("./subscription-transactions.validation");

describe("transactionsQuerySchema", () => {
  it("defaults to the first page of ten", () => {
    expect(transactionsQuerySchema.validate({}).value).toEqual({ page: 1, limit: 10 });
  });

  it("accepts every filter", () => {
    const query = {
      search: " ORD-1 ",
      status: "paid",
      userId: "3f2b8a52-6c5e-4d0e-9f53-0a1c2d3e4f50",
      from: "2026-11-01",
      to: "2026-11-30",
      page: "2",
    };

    const { error, value } = transactionsQuerySchema.validate(query);

    expect(error).toBeUndefined();
    expect(value).toMatchObject({ ...query, search: "ORD-1", page: 2, limit: 10 });
  });

  it("accepts a single day range", () => {
    expect(transactionsQuerySchema.validate({ from: "2026-11-20", to: "2026-11-20" }).error).toBeUndefined();
  });

  it.each([
    [{ status: "unknown" }],
    [{ userId: "not-a-uuid" }],
    [{ from: "2026-02-31" }],
    [{ to: "20-11-2026" }],
    [{ limit: 51 }],
    [{ search: "x".repeat(101) }],
  ])("rejects %j", (query) => {
    expect(transactionsQuerySchema.validate(query).error).toBeDefined();
  });

  it("rejects a range that ends before it starts", () => {
    const { error } = transactionsQuerySchema.validate({ from: "2026-11-30", to: "2026-11-01" });

    expect(error.message).toBe("From date cannot be after the to date");
  });
});
