jest.mock("./user-subscription.repository");
jest.mock("../../../shared/subscription/services/razorpay.service", () => ({
  razorpayService: {
    CURRENCY: "INR",
    getKeyId: jest.fn(() => "rzp_test_key"),
    createOrder: jest.fn(),
    fetchPayment: jest.fn(),
    verifyPaymentSignature: jest.fn(),
  },
}));
jest.mock("../../../shared/subscription/services/subscription-payment.service");

const repository = require("./user-subscription.repository");
const { razorpayService } = require("../../../shared/subscription/services/razorpay.service");
const { confirmPayment } = require("../../../shared/subscription/services/subscription-payment.service");
const service = require("./user-subscription.service");

const NOW = new Date("2026-11-20T10:00:00.000Z");

const standardRow = (overrides = {}) => ({
  id: "pkg-std",
  code: "standard",
  name: "Standard",
  display_title: "Standard Package",
  description: null,
  benefits: [],
  price_per_listing_month: 1000,
  gst_percent: "18.00",
  min_listings: 1,
  max_listings: 50,
  min_months: 1,
  max_months: 12,
  allow_custom_quantity: true,
  allow_custom_duration: true,
  free_credits: null,
  free_lead_limit: null,
  free_property_validity_days: null,
  ...overrides,
});

const orderRow = (overrides = {}) => ({
  id: "order-1",
  order_number: "ORD-20261120-AAAA1111",
  user_id: "user-1",
  status: "pending",
  listings: 2,
  months: 2,
  base_amount: 4000,
  gst_amount: 720,
  total_amount: 4720,
  razorpay_order_id: "order_rzp_1",
  paid_at: null,
  ...overrides,
});

beforeEach(() => {
  repository.findPurchasablePackage.mockResolvedValue(standardRow());
  repository.findCheckoutUser.mockResolvedValue({ id: "user-1", name: "Asha Rao", email: "asha@example.com", mobile_number: "9876543210" });
  repository.insertOrder.mockImplementation(async (row) => ({ id: "order-1", paid_at: null, ...row }));
  repository.updateOrder.mockResolvedValue({});
  razorpayService.createOrder.mockResolvedValue({ id: "order_rzp_1" });
});

describe("buildQuote", () => {
  it("prices the choice on the server and shows the end date and the benefit lines", () => {
    const quote = service.buildQuote(standardRow(), { listings: 2, months: 2 }, NOW);

    expect(quote).toMatchObject({
      packageId: "pkg-std",
      listings: 2,
      months: 2,
      pricePerListingMonth: 1000,
      gstPercent: 18,
      baseAmount: 4000,
      gstAmount: 720,
      totalAmount: 4720,
      startsAt: NOW,
      endsAt: new Date("2027-01-20T10:00:00.000Z"),
      benefits: ["2 Property Listings", "Unlimited Leads", "2 Months Validity"],
    });
  });

  it("uses singular wording for one listing and one month", () => {
    expect(service.buildQuote(standardRow(), { listings: 1, months: 1 }, NOW).benefits).toEqual([
      "1 Property Listing",
      "Unlimited Leads",
      "1 Month Validity",
    ]);
  });

  it.each([
    ["too many listings", { listings: 51, months: 1 }, "SUBSCRIPTION_INVALID_QUANTITY"],
    ["too few months", { listings: 1, months: 0 }, "SUBSCRIPTION_INVALID_DURATION"],
    ["too many months", { listings: 1, months: 13 }, "SUBSCRIPTION_INVALID_DURATION"],
  ])("rejects %s", (_label, input, code) => {
    expect(() => service.buildQuote(standardRow(), input, NOW)).toThrow(expect.objectContaining({ statusCode: 400, details: expect.objectContaining({ code }) }));
  });

  it("allows only the minimum when custom choices are switched off", () => {
    const fixed = standardRow({ allow_custom_quantity: false, allow_custom_duration: false });

    expect(service.buildQuote(fixed, { listings: 1, months: 1 }, NOW).totalAmount).toBe(1180);
    expect(() => service.buildQuote(fixed, { listings: 2, months: 1 }, NOW)).toThrow(expect.objectContaining({ statusCode: 400 }));
    expect(() => service.buildQuote(fixed, { listings: 1, months: 2 }, NOW)).toThrow(expect.objectContaining({ statusCode: 400 }));
  });

  it("refuses an online charge below the gateway minimum", () => {
    expect(() => service.buildQuote(standardRow({ price_per_listing_month: 0 }), { listings: 1, months: 1 }, NOW)).toThrow(
      expect.objectContaining({ statusCode: 409 }),
    );
  });
});

describe("getQuote and listPackages", () => {
  it("refuses a quote when the package is inactive", async () => {
    repository.findPurchasablePackage.mockResolvedValue(undefined);

    await expect(service.getQuote({ listings: 1, months: 1 })).rejects.toMatchObject({
      statusCode: 409,
      details: { code: "SUBSCRIPTION_PACKAGE_INACTIVE" },
    });
  });

  it("lists the active packages for users without admin-only fields", async () => {
    repository.findActivePackages.mockResolvedValue([standardRow()]);

    const { items } = await service.listPackages();

    expect(items[0]).toMatchObject({ code: "standard", gstPercent: 18, maxListings: 50 });
    expect(items[0]).not.toHaveProperty("status");
    expect(items[0]).not.toHaveProperty("createdAt");
  });
});

describe("createOrder", () => {
  it("saves a priced order, creates the gateway order for the same amount and returns the checkout details", async () => {
    const result = await service.createOrder("user-1", { listings: 2, months: 2, gstin: "24AAACC1206D1ZM" });

    expect(repository.insertOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        package_id: "pkg-std",
        listings: 2,
        months: 2,
        base_amount: 4000,
        gst_amount: 720,
        total_amount: 4720,
        status: "created",
        user_gstin: "24AAACC1206D1ZM",
        order_number: expect.stringMatching(/^ORD-\d{8}-[0-9A-F]{8}$/),
      }),
    );
    expect(razorpayService.createOrder).toHaveBeenCalledWith({
      amount: 472000,
      receipt: expect.stringMatching(/^ORD-/),
      notes: { orderId: "order-1", userId: "user-1" },
    });
    expect(repository.updateOrder).toHaveBeenCalledWith("order-1", { razorpay_order_id: "order_rzp_1", status: "pending" });
    expect(result.order).toMatchObject({ id: "order-1", status: "pending", totalAmount: 4720 });
    expect(result.checkout).toMatchObject({
      keyId: "rzp_test_key",
      razorpayOrderId: "order_rzp_1",
      amount: 472000,
      currency: "INR",
      prefill: { name: "Asha Rao", email: "asha@example.com", contact: "9876543210" },
    });
  });

  it("stores no GSTIN when none is given", async () => {
    await service.createOrder("user-1", { listings: 1, months: 1, gstin: "" });

    expect(repository.insertOrder).toHaveBeenCalledWith(expect.objectContaining({ user_gstin: null }));
  });

  it("fails the saved order and passes the error on when the gateway is down", async () => {
    const gatewayError = Object.assign(new Error("down"), { statusCode: 502 });
    razorpayService.createOrder.mockRejectedValue(gatewayError);

    await expect(service.createOrder("user-1", { listings: 1, months: 1 })).rejects.toBe(gatewayError);
    expect(repository.updateOrder).toHaveBeenCalledWith("order-1", expect.objectContaining({ status: "failed" }));
  });

  it("creates nothing when the choice is invalid", async () => {
    await expect(service.createOrder("user-1", { listings: 99, months: 1 })).rejects.toMatchObject({ statusCode: 400 });
    expect(repository.insertOrder).not.toHaveBeenCalled();
    expect(razorpayService.createOrder).not.toHaveBeenCalled();
  });
});

describe("verifyPayment", () => {
  const body = { razorpay_payment_id: "pay_1", razorpay_signature: "sig" };

  beforeEach(() => {
    repository.findOrderForUser.mockResolvedValue(orderRow());
    razorpayService.verifyPaymentSignature.mockReturnValue(true);
    razorpayService.fetchPayment.mockResolvedValue({ id: "pay_1", status: "captured" });
    confirmPayment.mockResolvedValue({ order: orderRow({ status: "paid" }) });
  });

  it("checks the signature against the gateway order, confirms with the gateway's own payment and answers paid", async () => {
    const result = await service.verifyPayment("user-1", "order-1", body);

    expect(repository.findOrderForUser).toHaveBeenCalledWith("user-1", "order-1");
    expect(razorpayService.verifyPaymentSignature).toHaveBeenCalledWith({ orderId: "order_rzp_1", paymentId: "pay_1", signature: "sig" });
    expect(confirmPayment).toHaveBeenCalledWith({ orderId: "order-1", payment: { id: "pay_1", status: "captured" } });
    expect(result).toMatchObject({ status: "paid", order: { id: "order-1", status: "paid" } });
  });

  it("answers paid without confirming again when the order is already paid", async () => {
    repository.findOrderForUser.mockResolvedValue(orderRow({ status: "paid" }));

    await expect(service.verifyPayment("user-1", "order-1", body)).resolves.toMatchObject({ status: "paid" });
    expect(confirmPayment).not.toHaveBeenCalled();
  });

  it("rejects a wrong signature before asking the gateway", async () => {
    razorpayService.verifyPaymentSignature.mockReturnValue(false);

    await expect(service.verifyPayment("user-1", "order-1", body)).rejects.toMatchObject({
      statusCode: 400,
      details: { code: "SUBSCRIPTION_PAYMENT_SIGNATURE_INVALID" },
    });
    expect(razorpayService.fetchPayment).not.toHaveBeenCalled();
    expect(confirmPayment).not.toHaveBeenCalled();
  });

  it("answers pending and grants nothing when the payment is not captured yet", async () => {
    razorpayService.fetchPayment.mockResolvedValue({ id: "pay_1", status: "authorized" });

    await expect(service.verifyPayment("user-1", "order-1", body)).resolves.toMatchObject({ status: "pending" });
    expect(confirmPayment).not.toHaveBeenCalled();
  });

  it("answers 404 for an order that is not the user's", async () => {
    repository.findOrderForUser.mockResolvedValue(undefined);

    await expect(service.verifyPayment("user-2", "order-1", body)).rejects.toMatchObject({ statusCode: 404 });
  });

  it("rejects an order that never reached the gateway", async () => {
    repository.findOrderForUser.mockResolvedValue(orderRow({ razorpay_order_id: null }));

    await expect(service.verifyPayment("user-1", "order-1", body)).rejects.toMatchObject({ statusCode: 409 });
  });
});
