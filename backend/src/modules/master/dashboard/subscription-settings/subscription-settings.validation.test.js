const { updateSettingsSchema } = require("./subscription-settings.validation");

describe("updateSettingsSchema", () => {
  it("accepts a full update and normalises case", () => {
    const { error, value } = updateSettingsSchema.validate({
      legalName: "  Lokesha Pvt Ltd ",
      address: "Surat, Gujarat",
      gstin: " 24aaacl0000a1z5 ",
      sacCode: "998314",
      invoicePrefix: "lok",
      creditNotePrefix: "lok-cn",
    });

    expect(error).toBeUndefined();
    expect(value).toEqual({
      legalName: "Lokesha Pvt Ltd",
      address: "Surat, Gujarat",
      gstin: "24AAACL0000A1Z5",
      sacCode: "998314",
      invoicePrefix: "LOK",
      creditNotePrefix: "LOK-CN",
    });
  });

  it("accepts a partial update and lets GSTIN and SAC code be cleared", () => {
    expect(updateSettingsSchema.validate({ legalName: "Lokesha" }).error).toBeUndefined();
    expect(updateSettingsSchema.validate({ gstin: "", sacCode: "" }).error).toBeUndefined();
  });

  it("rejects an empty update", () => {
    expect(updateSettingsSchema.validate({}).error.message).toBe("Send at least one field to update");
  });

  it.each([
    [{ gstin: "12345" }],
    [{ sacCode: "99" }],
    [{ sacCode: "99831A" }],
    [{ invoicePrefix: "" }],
    [{ invoicePrefix: "LOK/2026" }],
    [{ creditNotePrefix: "ABCDEFGHIJKLM" }],
    [{ legalName: "x".repeat(161) }],
    [{ address: "x".repeat(501) }],
  ])("rejects %j", (body) => {
    expect(updateSettingsSchema.validate(body).error).toBeDefined();
  });
});
