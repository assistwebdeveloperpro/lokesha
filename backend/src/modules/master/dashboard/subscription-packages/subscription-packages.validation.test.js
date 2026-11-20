const { updatePackageSchema, auditLogsQuerySchema } = require("./subscription-packages.validation");

describe("updatePackageSchema", () => {
  it("accepts a partial update and trims text", () => {
    const { error, value } = updatePackageSchema.validate({ name: "  Standard  ", gstPercent: 18, benefits: [" Unlimited leads "] });

    expect(error).toBeUndefined();
    expect(value).toEqual({ name: "Standard", gstPercent: 18, benefits: ["Unlimited leads"] });
  });

  it("accepts every editable field", () => {
    const body = {
      name: "Standard",
      displayTitle: "Standard Package",
      description: "",
      benefits: [],
      status: "inactive",
      displayOrder: 2,
      pricePerListingMonth: 150000,
      gstPercent: 18.5,
      minListings: 1,
      maxListings: 50,
      minMonths: 1,
      maxMonths: 12,
      allowCustomQuantity: true,
      allowCustomDuration: false,
      freeCredits: 2,
      freeLeadLimit: 2,
      freePropertyValidityDays: 30,
    };

    expect(updatePackageSchema.validate(body).error).toBeUndefined();
  });

  it("rejects an empty update", () => {
    expect(updatePackageSchema.validate({}).error.message).toBe("Send at least one field to update");
  });

  it.each([
    [{ status: "deleted" }],
    [{ name: "" }],
    [{ pricePerListingMonth: -1 }],
    [{ pricePerListingMonth: 99.5 }],
    [{ gstPercent: 101 }],
    [{ minListings: 0 }],
    [{ maxMonths: 61 }],
    [{ freeCredits: 0 }],
    [{ freePropertyValidityDays: 0 }],
    [{ benefits: Array(11).fill("x") }],
    [{ allowCustomQuantity: "maybe" }],
  ])("rejects %j", (body) => {
    expect(updatePackageSchema.validate(body).error).toBeDefined();
  });

  it("does not allow changing the package code", () => {
    const { value } = updatePackageSchema.validate({ name: "Standard", code: "premium" }, { stripUnknown: true });

    expect(value).toEqual({ name: "Standard" });
  });
});

describe("auditLogsQuerySchema", () => {
  it("defaults the paging", () => {
    expect(auditLogsQuerySchema.validate({}).value).toEqual({ page: 1, limit: 10 });
  });

  it.each([[{ page: 0 }], [{ limit: 51 }]])("rejects %j", (query) => {
    expect(auditLogsQuerySchema.validate(query).error).toBeDefined();
  });
});
