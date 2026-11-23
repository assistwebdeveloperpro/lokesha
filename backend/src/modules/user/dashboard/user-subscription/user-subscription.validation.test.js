const {
  quoteSchema,
  createOrderSchema,
  leadQuoteSchema,
  createLeadOrderSchema,
  verifyPaymentSchema,
  pagingQuerySchema,
} = require("./user-subscription.validation");

const PROPERTY_ID = "3f2b8a52-6c5e-4d0e-9f53-0a1c2d3e4f50";

describe("leadQuoteSchema", () => {
  it("accepts a property and a whole lead count, converting numeric text", () => {
    expect(leadQuoteSchema.validate({ propertyId: PROPERTY_ID, leads: "10" }).value).toEqual({ propertyId: PROPERTY_ID, leads: 10 });
  });

  it.each([
    [{}],
    [{ propertyId: PROPERTY_ID }],
    [{ leads: 5 }],
    [{ propertyId: "not-a-uuid", leads: 5 }],
    [{ propertyId: PROPERTY_ID, leads: 0 }],
    [{ propertyId: PROPERTY_ID, leads: 1.5 }],
    [{ propertyId: PROPERTY_ID, leads: 1001 }],
  ])("rejects %j", (body) => {
    expect(leadQuoteSchema.validate(body).error).toBeDefined();
  });
});

describe("createLeadOrderSchema", () => {
  const base = { propertyId: PROPERTY_ID, leads: 5 };

  it("accepts an order without a GSTIN, with an empty one or with a valid one", () => {
    expect(createLeadOrderSchema.validate(base).error).toBeUndefined();
    expect(createLeadOrderSchema.validate({ ...base, gstin: "" }).error).toBeUndefined();
    expect(createLeadOrderSchema.validate({ ...base, gstin: "27aaapl1234c1z5" }).value.gstin).toBe("27AAAPL1234C1Z5");
  });

  it("rejects a malformed GSTIN", () => {
    expect(createLeadOrderSchema.validate({ ...base, gstin: "123" }).error.message).toBe("Enter a valid 15 character GSTIN");
  });
});

describe("pagingQuerySchema", () => {
  it("defaults to the first page of ten and converts numeric text", () => {
    expect(pagingQuerySchema.validate({}).value).toEqual({ page: 1, limit: 10 });
    expect(pagingQuerySchema.validate({ page: "2", limit: "5" }).value).toEqual({ page: 2, limit: 5 });
  });

  it.each([[{ page: 0 }], [{ limit: 0 }], [{ limit: 51 }], [{ page: 1.5 }]])("rejects %j", (query) => {
    expect(pagingQuerySchema.validate(query).error).toBeDefined();
  });
});

describe("quoteSchema", () => {
  it("accepts whole listings and months, converting numeric text", () => {
    expect(quoteSchema.validate({ listings: "2", months: 3 }).value).toEqual({ listings: 2, months: 3 });
  });

  it.each([
    [{}],
    [{ listings: 1 }],
    [{ months: 1 }],
    [{ listings: 0, months: 1 }],
    [{ listings: 1, months: 0 }],
    [{ listings: 1.5, months: 1 }],
    [{ listings: 1001, months: 1 }],
    [{ listings: 1, months: 61 }],
  ])("rejects %j", (body) => {
    expect(quoteSchema.validate(body).error).toBeDefined();
  });
});

describe("createOrderSchema", () => {
  const base = { listings: 2, months: 2 };

  it("accepts an order without a GSTIN or with an empty one", () => {
    expect(createOrderSchema.validate(base).error).toBeUndefined();
    expect(createOrderSchema.validate({ ...base, gstin: "" }).error).toBeUndefined();
  });

  it("normalises a valid GSTIN to upper case", () => {
    expect(createOrderSchema.validate({ ...base, gstin: " 24aaacc1206d1zm " }).value.gstin).toBe("24AAACC1206D1ZM");
  });

  it.each([["12345"], ["24AAACC1206D1ZMX"], ["ZZAAACC1206D1ZM"]])("rejects the GSTIN %s", (gstin) => {
    expect(createOrderSchema.validate({ ...base, gstin }).error).toBeDefined();
  });

  it("drops an amount sent by the client", () => {
    const { value } = createOrderSchema.validate({ ...base, totalAmount: 1 }, { stripUnknown: true });

    expect(value).toEqual(base);
  });
});

describe("verifyPaymentSchema", () => {
  it("needs the payment id and the signature", () => {
    expect(verifyPaymentSchema.validate({ razorpay_payment_id: "pay_1", razorpay_signature: "abc" }).error).toBeUndefined();
    expect(verifyPaymentSchema.validate({ razorpay_payment_id: "pay_1" }).error).toBeDefined();
    expect(verifyPaymentSchema.validate({ razorpay_signature: "abc" }).error).toBeDefined();
  });
});
