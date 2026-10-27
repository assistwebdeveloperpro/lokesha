const { reviewListQuerySchema, rejectSchema } = require("./property-review.validation");

describe("reviewListQuerySchema", () => {
  it("lists properties waiting for review by default", () => {
    const { error, value } = reviewListQuerySchema.validate({});

    expect(error).toBeUndefined();
    expect(value).toMatchObject({ page: 1, limit: 10, status: "pending" });
  });

  it.each([["published"], ["rejected"], ["closed"]])("accepts the %s status", (status) => {
    expect(reviewListQuerySchema.validate({ status }).error).toBeUndefined();
  });

  it.each([[{ status: "draft" }], [{ status: "x" }], [{ limit: 500 }], [{ propertyType: "castle" }]])(
    "rejects %j",
    (query) => {
      expect(reviewListQuerySchema.validate(query).error).toBeDefined();
    }
  );
});

describe("rejectSchema", () => {
  it("trims the reason", () => {
    expect(rejectSchema.validate({ reason: "  Photos are blurry  " }).value.reason).toBe("Photos are blurry");
  });

  it.each([[{}], [{ reason: "" }], [{ reason: "no" }], [{ reason: "x".repeat(501) }]])("rejects %j", (body) => {
    expect(rejectSchema.validate(body).error).toBeDefined();
  });
});
