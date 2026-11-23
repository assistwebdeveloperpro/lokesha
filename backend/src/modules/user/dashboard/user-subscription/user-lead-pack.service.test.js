jest.mock("./user-subscription.repository");
jest.mock("../../../shared/subscription/services/razorpay.service", () => ({
  razorpayService: {
    CURRENCY: "INR",
    getKeyId: jest.fn(() => "rzp_test_key"),
    createOrder: jest.fn(),
  },
}));
jest.mock("../../../shared/subscription/services/subscription-payment.service");

const repository = require("./user-subscription.repository");
const { razorpayService } = require("../../../shared/subscription/services/razorpay.service");
const service = require("./user-lead-pack.service");

const USER_ID = "user-1";
const PROPERTY_ID = "3f2b8a52-6c5e-4d0e-9f53-0a1c2d3e4f50";

const leadsRow = (overrides = {}) => ({
  id: "pkg-leads",
  code: "leads",
  name: "Buy More Leads",
  display_title: "Buy More Leads",
  description: null,
  benefits: [],
  price_per_lead: 100,
  gst_percent: "18.00",
  min_leads: 1,
  max_leads: 100,
  ...overrides,
});

const propertyRow = (overrides = {}) => ({ id: PROPERTY_ID, title: "Sky Heights", listing_number: "12", ...overrides });

beforeEach(() => {
  repository.findLeadPackPackage.mockResolvedValue(leadsRow());
  repository.findEligibleProperty.mockResolvedValue(propertyRow());
  repository.findCheckoutUser.mockResolvedValue({ id: USER_ID, name: "Asha Rao", email: "asha@example.com", mobile_number: "9876543210" });
  repository.insertOrder.mockImplementation(async (row) => ({ id: "order-1", paid_at: null, ...row }));
  repository.updateOrder.mockResolvedValue({});
  razorpayService.createOrder.mockResolvedValue({ id: "order_rzp_1" });
});

describe("getLeadPackQuote", () => {
  it.each([
    [1, 100, 18, 118],
    [10, 1000, 180, 1180],
    [100, 10000, 1800, 11800],
  ])("prices %i lead(s) on the server", async (leads, baseAmount, gstAmount, totalAmount) => {
    const quote = await service.getLeadPackQuote(USER_ID, { propertyId: PROPERTY_ID, leads });

    expect(quote).toMatchObject({
      packageId: "pkg-leads",
      property: { id: PROPERTY_ID, title: "Sky Heights", listingNumber: 12 },
      leads,
      pricePerLead: 100,
      gstPercent: 18,
      baseAmount,
      gstAmount,
      totalAmount,
    });
  });

  it("uses the price stored on the package", async () => {
    repository.findLeadPackPackage.mockResolvedValue(leadsRow({ price_per_lead: 250 }));

    const quote = await service.getLeadPackQuote(USER_ID, { propertyId: PROPERTY_ID, leads: 2 });

    expect(quote).toMatchObject({ pricePerLead: 250, baseAmount: 500 });
  });

  it.each([[0], [101]])("rejects %i leads outside the package range", async (leads) => {
    await expect(service.getLeadPackQuote(USER_ID, { propertyId: PROPERTY_ID, leads })).rejects.toMatchObject({
      statusCode: 400,
      details: { code: "INVALID_LEAD_QUANTITY", fields: { leads: "Choose between 1 and 100 leads" } },
    });
  });

  it("refuses when the package is inactive", async () => {
    repository.findLeadPackPackage.mockResolvedValue(undefined);

    await expect(service.getLeadPackQuote(USER_ID, { propertyId: PROPERTY_ID, leads: 5 })).rejects.toMatchObject({
      statusCode: 409,
      details: { code: "SUBSCRIPTION_PACKAGE_INACTIVE" },
    });
  });

  it("refuses a property that is not owned, not live, unlimited or expired", async () => {
    repository.findEligibleProperty.mockResolvedValue(undefined);

    await expect(service.getLeadPackQuote(USER_ID, { propertyId: PROPERTY_ID, leads: 5 })).rejects.toMatchObject({
      statusCode: 409,
      details: { code: "LEAD_PACK_NOT_ELIGIBLE" },
    });
  });

  it("checks eligibility for the signed-in user at the current time", async () => {
    await service.getLeadPackQuote(USER_ID, { propertyId: PROPERTY_ID, leads: 5 });

    expect(repository.findEligibleProperty).toHaveBeenCalledWith(USER_ID, PROPERTY_ID, expect.any(Date));
  });

  it("refuses a free package that would charge nothing", async () => {
    repository.findLeadPackPackage.mockResolvedValue(leadsRow({ price_per_lead: 0 }));

    await expect(service.getLeadPackQuote(USER_ID, { propertyId: PROPERTY_ID, leads: 5 })).rejects.toMatchObject({ statusCode: 409 });
  });
});

describe("createLeadPackOrder", () => {
  it("saves the order with the package terms of this moment and opens the gateway order", async () => {
    const result = await service.createLeadPackOrder(USER_ID, { propertyId: PROPERTY_ID, leads: 10, gstin: "27AAAPL1234C1Z5" });

    expect(repository.insertOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        order_type: "lead_pack",
        user_id: USER_ID,
        package_id: "pkg-leads",
        property_id: PROPERTY_ID,
        leads: 10,
        price_per_lead: 100,
        gst_percent: 18,
        base_amount: 1000,
        gst_amount: 180,
        total_amount: 1180,
        status: "created",
        user_gstin: "27AAAPL1234C1Z5",
      })
    );
    expect(repository.insertOrder.mock.calls[0][0]).not.toHaveProperty("listings");
    expect(razorpayService.createOrder).toHaveBeenCalledWith(expect.objectContaining({ amount: 118000, receipt: expect.stringMatching(/^ORD-/) }));
    expect(repository.updateOrder).toHaveBeenCalledWith("order-1", { razorpay_order_id: "order_rzp_1", status: "pending" });
    expect(result).toMatchObject({
      order: { id: "order-1", status: "pending", totalAmount: 1180 },
      quote: { leads: 10, totalAmount: 1180 },
      checkout: { keyId: "rzp_test_key", razorpayOrderId: "order_rzp_1", amount: 118000, description: "Extra leads: 10 for Sky Heights" },
    });
  });

  it("stores no GSTIN when none is sent", async () => {
    await service.createLeadPackOrder(USER_ID, { propertyId: PROPERTY_ID, leads: 1, gstin: "" });

    expect(repository.insertOrder).toHaveBeenCalledWith(expect.objectContaining({ user_gstin: null }));
  });

  it("creates no order when the property is not eligible", async () => {
    repository.findEligibleProperty.mockResolvedValue(undefined);

    await expect(service.createLeadPackOrder(USER_ID, { propertyId: PROPERTY_ID, leads: 5 })).rejects.toMatchObject({ statusCode: 409 });
    expect(repository.insertOrder).not.toHaveBeenCalled();
  });

  it("creates no order when the quantity is out of range", async () => {
    await expect(service.createLeadPackOrder(USER_ID, { propertyId: PROPERTY_ID, leads: 500 })).rejects.toMatchObject({ statusCode: 400 });
    expect(repository.insertOrder).not.toHaveBeenCalled();
  });

  it("marks the order failed when the gateway cannot create it", async () => {
    razorpayService.createOrder.mockRejectedValue(new Error("gateway down"));

    await expect(service.createLeadPackOrder(USER_ID, { propertyId: PROPERTY_ID, leads: 5 })).rejects.toThrow("gateway down");
    expect(repository.updateOrder).toHaveBeenCalledWith("order-1", { status: "failed", failure_reason: "Could not create the payment order" });
  });
});
