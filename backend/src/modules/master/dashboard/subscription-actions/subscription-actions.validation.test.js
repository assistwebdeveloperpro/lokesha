const { giftCreditsSchema, extendSchema, refundSchema, actionsListQuerySchema } = require("./subscription-actions.validation");

const ID = "3f2b8a52-6c5e-4d0e-9f53-0a1c2d3e4f50";
const REASON = "Goodwill after downtime";

describe("giftCreditsSchema", () => {
  it("accepts credits, months and a reason, and trims the reason", () => {
    const { error, value } = giftCreditsSchema.validate({ userId: ID, credits: "3", months: 2, reason: `  ${REASON}  ` });

    expect(error).toBeUndefined();
    expect(value).toEqual({ userId: ID, credits: 3, months: 2, reason: REASON });
  });

  it.each([
    [{ credits: 3, months: 2, reason: REASON }],
    [{ userId: ID, months: 2, reason: REASON }],
    [{ userId: ID, credits: 3, reason: REASON }],
    [{ userId: ID, credits: 0, months: 2, reason: REASON }],
    [{ userId: ID, credits: 1001, months: 2, reason: REASON }],
    [{ userId: ID, credits: 1.5, months: 2, reason: REASON }],
    [{ userId: ID, credits: 3, months: 61, reason: REASON }],
    [{ userId: "x", credits: 3, months: 2, reason: REASON }],
  ])("rejects %j", (body) => {
    expect(giftCreditsSchema.validate(body).error).toBeDefined();
  });
});

describe("extendSchema", () => {
  it("accepts a subscription, months and a reason", () => {
    expect(extendSchema.validate({ subscriptionId: ID, months: 1, reason: REASON }).error).toBeUndefined();
  });

  it.each([[{ months: 1, reason: REASON }], [{ subscriptionId: ID, months: 0, reason: REASON }], [{ subscriptionId: ID, reason: REASON }]])(
    "rejects %j",
    (body) => {
      expect(extendSchema.validate(body).error).toBeDefined();
    },
  );
});

describe("refundSchema", () => {
  it("accepts an order and a reason", () => {
    expect(refundSchema.validate({ orderId: ID, reason: REASON }).error).toBeUndefined();
  });

  it.each([[{ reason: REASON }], [{ orderId: ID }], [{ orderId: "x", reason: REASON }]])("rejects %j", (body) => {
    expect(refundSchema.validate(body).error).toBeDefined();
  });
});

describe("the reason of every action", () => {
  it.each([[giftCreditsSchema, { userId: ID, credits: 1, months: 1 }], [extendSchema, { subscriptionId: ID, months: 1 }], [refundSchema, { orderId: ID }]])(
    "is required, at least five characters and at most 500",
    (schema, base) => {
      expect(schema.validate({ ...base }).error.message).toBe("Please give a reason for this action");
      expect(schema.validate({ ...base, reason: "" }).error).toBeDefined();
      expect(schema.validate({ ...base, reason: "no" }).error).toBeDefined();
      expect(schema.validate({ ...base, reason: "x".repeat(501) }).error).toBeDefined();
      expect(schema.validate({ ...base, reason: "x".repeat(500) }).error).toBeUndefined();
    },
  );
});

describe("actionsListQuerySchema", () => {
  it("needs a user and defaults the paging", () => {
    expect(actionsListQuerySchema.validate({ userId: ID }).value).toEqual({ userId: ID, page: 1, limit: 10 });
    expect(actionsListQuerySchema.validate({}).error).toBeDefined();
    expect(actionsListQuerySchema.validate({ userId: ID, limit: 51 }).error).toBeDefined();
  });
});
