jest.mock("./subscription-packages.repository");

const repository = require("./subscription-packages.repository");
const service = require("./subscription-packages.service");

const TRX = Symbol("trx");
const ADMIN = { id: "admin-1" };
const PACKAGE_ID = "3f2b8a52-6c5e-4d0e-9f53-0a1c2d3e4f50";

const standardRow = (overrides = {}) => ({
  id: PACKAGE_ID,
  code: "standard",
  name: "Standard",
  display_title: "Standard Package",
  description: null,
  benefits: ["Unlimited leads"],
  status: "active",
  display_order: 2,
  price_per_listing_month: 100000,
  gst_percent: "18.00",
  min_listings: 1,
  max_listings: 50,
  min_months: 1,
  max_months: 12,
  allow_custom_quantity: true,
  allow_custom_duration: true,
  price_per_lead: null,
  min_leads: null,
  max_leads: null,
  free_credits: null,
  free_lead_limit: null,
  free_property_validity_days: null,
  created_at: new Date("2026-11-20T00:00:00Z"),
  updated_at: new Date("2026-11-20T00:00:00Z"),
  ...overrides,
});

const freeRow = (overrides = {}) =>
  standardRow({
    code: "free",
    name: "Free",
    price_per_listing_month: 0,
    gst_percent: "0.00",
    max_listings: 1,
    max_months: 1,
    allow_custom_quantity: false,
    allow_custom_duration: false,
    free_credits: 2,
    free_lead_limit: 2,
    free_property_validity_days: 30,
    ...overrides,
  });

const leadsRow = (overrides = {}) =>
  standardRow({
    code: "leads",
    name: "Buy More Leads",
    display_order: 3,
    price_per_listing_month: 0,
    price_per_lead: 100,
    min_leads: 1,
    max_leads: 100,
    max_listings: 1,
    max_months: 1,
    allow_custom_quantity: false,
    allow_custom_duration: false,
    ...overrides,
  });

beforeEach(() => {
  repository.runInTransaction.mockImplementation((callback) => callback(TRX));
  repository.findByIdForUpdate.mockResolvedValue(standardRow());
  repository.updateById.mockImplementation(async (_trx, _id, columns) => ({ ...standardRow(), ...columns }));
});

describe("listPackages and getPackage", () => {
  it("maps rows to the API shape with a numeric GST rate", async () => {
    repository.findAll.mockResolvedValue([standardRow()]);

    const { items } = await service.listPackages();

    expect(items[0]).toMatchObject({
      id: PACKAGE_ID,
      code: "standard",
      displayTitle: "Standard Package",
      description: "",
      pricePerListingMonth: 100000,
      gstPercent: 18,
      allowCustomQuantity: true,
    });
  });

  it("returns 404 for an unknown package", async () => {
    repository.findById.mockResolvedValue(undefined);

    await expect(service.getPackage(PACKAGE_ID)).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("updatePackage", () => {
  it("saves only the changed fields and writes one audit row with old and new values", async () => {
    const result = await service.updatePackage(ADMIN, PACKAGE_ID, { pricePerListingMonth: 150000, name: "Standard", gstPercent: 18 });

    expect(repository.updateById).toHaveBeenCalledWith(TRX, PACKAGE_ID, { price_per_listing_month: 150000 });
    expect(repository.insertAuditLog).toHaveBeenCalledWith(TRX, {
      packageId: PACKAGE_ID,
      adminId: "admin-1",
      changes: { pricePerListingMonth: { from: 100000, to: 150000 } },
    });
    expect(result.pricePerListingMonth).toBe(150000);
  });

  it("stores benefits as JSON", async () => {
    await service.updatePackage(ADMIN, PACKAGE_ID, { benefits: ["Unlimited leads", "Priority support"] });

    expect(repository.updateById).toHaveBeenCalledWith(TRX, PACKAGE_ID, {
      benefits: JSON.stringify(["Unlimited leads", "Priority support"]),
    });
  });

  it("changes nothing and writes no audit row when the values are the same", async () => {
    const result = await service.updatePackage(ADMIN, PACKAGE_ID, { name: "Standard", gstPercent: 18, benefits: ["Unlimited leads"] });

    expect(result.name).toBe("Standard");
    expect(repository.updateById).not.toHaveBeenCalled();
    expect(repository.insertAuditLog).not.toHaveBeenCalled();
  });

  it("returns 404 when the package is missing", async () => {
    repository.findByIdForUpdate.mockResolvedValue(undefined);

    await expect(service.updatePackage(ADMIN, PACKAGE_ID, { name: "X" })).rejects.toMatchObject({ statusCode: 404 });
  });

  it("rejects a range that the merged values break", async () => {
    await expect(service.updatePackage(ADMIN, PACKAGE_ID, { minListings: 60 })).rejects.toMatchObject({
      statusCode: 400,
      details: { fields: { maxListings: expect.any(String) } },
    });
    await expect(service.updatePackage(ADMIN, PACKAGE_ID, { maxMonths: 1, minMonths: 2 })).rejects.toMatchObject({
      details: { fields: { maxMonths: expect.any(String) } },
    });
    expect(repository.updateById).not.toHaveBeenCalled();
  });

  it("keeps free-grant settings off the paid package", async () => {
    await expect(service.updatePackage(ADMIN, PACKAGE_ID, { freeCredits: 5 })).rejects.toMatchObject({
      statusCode: 400,
      details: { fields: { freeCredits: expect.any(String) } },
    });
  });

  describe("the Free package", () => {
    beforeEach(() => repository.findByIdForUpdate.mockResolvedValue(freeRow()));

    it("accepts the free-grant settings", async () => {
      repository.updateById.mockImplementation(async (_trx, _id, columns) => ({ ...freeRow(), ...columns }));

      const result = await service.updatePackage(ADMIN, PACKAGE_ID, { freeCredits: 3, freeLeadLimit: 5 });

      expect(repository.updateById).toHaveBeenCalledWith(TRX, PACKAGE_ID, { free_credits: 3, free_lead_limit: 5 });
      expect(result.freeCredits).toBe(3);
    });

    it("has no price or purchase limits", async () => {
      await expect(service.updatePackage(ADMIN, PACKAGE_ID, { pricePerListingMonth: 100 })).rejects.toMatchObject({
        details: { fields: { pricePerListingMonth: expect.any(String) } },
      });
    });

    it("cannot be deactivated", async () => {
      await expect(service.updatePackage(ADMIN, PACKAGE_ID, { status: "inactive" })).rejects.toMatchObject({
        details: { fields: { status: "The Free package cannot be deactivated" } },
      });
      expect(repository.updateById).not.toHaveBeenCalled();
    });
  });

  it("keeps lead-pack settings off the Standard package", async () => {
    await expect(service.updatePackage(ADMIN, PACKAGE_ID, { pricePerLead: 50 })).rejects.toMatchObject({
      statusCode: 400,
      details: { fields: { pricePerLead: expect.any(String) } },
    });
  });

  describe("the Buy More Leads package", () => {
    beforeEach(() => {
      repository.findByIdForUpdate.mockResolvedValue(leadsRow());
      repository.updateById.mockImplementation(async (_trx, _id, columns) => ({ ...leadsRow(), ...columns }));
    });

    it("maps the lead-pack columns to the API shape", async () => {
      repository.findById.mockResolvedValue(leadsRow());

      expect(await service.getPackage(PACKAGE_ID)).toMatchObject({ code: "leads", pricePerLead: 100, minLeads: 1, maxLeads: 100 });
    });

    it("saves the price, GST and lead range and audits the old and new price", async () => {
      const result = await service.updatePackage(ADMIN, PACKAGE_ID, { pricePerLead: 120, gstPercent: 12, maxLeads: 50 });

      expect(repository.updateById).toHaveBeenCalledWith(TRX, PACKAGE_ID, { price_per_lead: 120, gst_percent: 12, max_leads: 50 });
      expect(repository.insertAuditLog).toHaveBeenCalledWith(
        TRX,
        expect.objectContaining({ changes: expect.objectContaining({ pricePerLead: { from: 100, to: 120 } }) })
      );
      expect(result.pricePerLead).toBe(120);
    });

    it("rejects a lead range that the merged values break", async () => {
      await expect(service.updatePackage(ADMIN, PACKAGE_ID, { minLeads: 101 })).rejects.toMatchObject({
        details: { fields: { maxLeads: expect.any(String) } },
      });
      expect(repository.updateById).not.toHaveBeenCalled();
    });

    it.each([[{ minListings: 2 }], [{ maxMonths: 6 }], [{ pricePerListingMonth: 10 }], [{ freeCredits: 3 }]])(
      "has no listing, month or free-grant settings: %j",
      async (input) => {
        await expect(service.updatePackage(ADMIN, PACKAGE_ID, input)).rejects.toMatchObject({ statusCode: 400 });
        expect(repository.updateById).not.toHaveBeenCalled();
      }
    );

    it("can be deactivated", async () => {
      await service.updatePackage(ADMIN, PACKAGE_ID, { status: "inactive" });

      expect(repository.updateById).toHaveBeenCalledWith(TRX, PACKAGE_ID, { status: "inactive" });
    });
  });

  it("can deactivate the paid package", async () => {
    await service.updatePackage(ADMIN, PACKAGE_ID, { status: "inactive" });

    expect(repository.updateById).toHaveBeenCalledWith(TRX, PACKAGE_ID, { status: "inactive" });
  });
});

describe("listAuditLogs", () => {
  it("returns the history with the admin who made each change", async () => {
    repository.findById.mockResolvedValue(standardRow());
    repository.findAuditLogs.mockResolvedValue([
      { id: "log-1", admin_id: "admin-1", admin_name: "Asha", changes: { name: { from: "A", to: "B" } }, created_at: new Date("2026-11-20T00:00:00Z") },
      { id: "log-2", admin_id: null, admin_name: null, changes: {}, created_at: new Date("2026-11-19T00:00:00Z") },
    ]);
    repository.countAuditLogs.mockResolvedValue(2);

    const result = await service.listAuditLogs(PACKAGE_ID, { page: 1, limit: 10 });

    expect(result).toMatchObject({ page: 1, limit: 10, total: 2 });
    expect(result.items[0]).toMatchObject({ id: "log-1", admin: { id: "admin-1", name: "Asha" } });
    expect(result.items[1].admin).toBeNull();
  });

  it("returns 404 for an unknown package", async () => {
    repository.findById.mockResolvedValue(undefined);

    await expect(service.listAuditLogs(PACKAGE_ID, { page: 1, limit: 10 })).rejects.toMatchObject({ statusCode: 404 });
  });
});
