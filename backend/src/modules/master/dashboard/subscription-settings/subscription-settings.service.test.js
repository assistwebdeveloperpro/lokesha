jest.mock("./subscription-settings.repository");

const repository = require("./subscription-settings.repository");
const { getSettings, updateSettings } = require("./subscription-settings.service");

const COMPLETE_ROW = {
  legal_name: "Lokesha Pvt Ltd",
  address: "Ahmedabad, Gujarat",
  gstin: "24AAACL0000A1Z5",
  sac_code: "998314",
  invoice_prefix: "LOK",
  credit_note_prefix: "LOK-CN",
  updated_at: new Date("2026-11-20T00:00:00Z"),
};

describe("getSettings", () => {
  it("maps the row and reports the invoice details as ready when all four are filled", async () => {
    repository.findSettings.mockResolvedValue(COMPLETE_ROW);

    await expect(getSettings()).resolves.toEqual({
      legalName: "Lokesha Pvt Ltd",
      address: "Ahmedabad, Gujarat",
      gstin: "24AAACL0000A1Z5",
      sacCode: "998314",
      invoicePrefix: "LOK",
      creditNotePrefix: "LOK-CN",
      updatedAt: COMPLETE_ROW.updated_at,
      isInvoiceReady: true,
    });
  });

  it.each(["legal_name", "address", "gstin", "sac_code"])("is not ready when %s is empty", async (field) => {
    repository.findSettings.mockResolvedValue({ ...COMPLETE_ROW, [field]: "" });

    await expect(getSettings()).resolves.toMatchObject({ isInvoiceReady: false });
  });

  it("returns empty defaults when the row does not exist yet", async () => {
    repository.findSettings.mockResolvedValue(undefined);

    await expect(getSettings()).resolves.toMatchObject({ legalName: "", invoicePrefix: "LOK", isInvoiceReady: false, updatedAt: null });
  });
});

describe("updateSettings", () => {
  it("saves only the sent fields under their column names", async () => {
    repository.saveSettings.mockResolvedValue(COMPLETE_ROW);

    const result = await updateSettings({ gstin: "24AAACL0000A1Z5", sacCode: "998314" });

    expect(repository.saveSettings).toHaveBeenCalledWith({ gstin: "24AAACL0000A1Z5", sac_code: "998314" });
    expect(result.isInvoiceReady).toBe(true);
  });
});
