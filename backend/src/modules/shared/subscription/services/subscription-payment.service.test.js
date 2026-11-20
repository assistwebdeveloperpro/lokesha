const mockTrx = {};

jest.mock("../../../../config/db", () => ({
  db: { transaction: jest.fn((callback) => callback(mockTrx)) },
}));
jest.mock("../repositories/subscription-order.repository");
jest.mock("../repositories/subscription.repository");
jest.mock("../repositories/subscription-ledger.repository");
jest.mock("../../../user/dashboard/user-notifications/user-notifications.repository");
jest.mock("../../../master/dashboard/admin-notifications/admin-notifications.service");
jest.mock("./invoice.service");

const { createInvoiceForOrder } = require("./invoice.service");
const orderRepository = require("../repositories/subscription-order.repository");
const subscriptionRepository = require("../repositories/subscription.repository");
const ledgerRepository = require("../repositories/subscription-ledger.repository");
const notificationRepository = require("../../../user/dashboard/user-notifications/user-notifications.repository");
const adminNotifications = require("../../../master/dashboard/admin-notifications/admin-notifications.service");
const { confirmPayment, markPaymentFailed } = require("./subscription-payment.service");

const NOW = new Date("2026-11-20T10:00:00.000Z");

const order = (overrides = {}) => ({
  id: "order-1",
  order_number: "ORD-1",
  user_id: "user-1",
  package_id: "pkg-std",
  listings: 2,
  months: 3,
  total_amount: 708000,
  status: "pending",
  razorpay_order_id: "order_rzp_1",
  ...overrides,
});

const payment = (overrides = {}) => ({
  id: "pay_1",
  order_id: "order_rzp_1",
  amount: 708000,
  currency: "INR",
  status: "captured",
  ...overrides,
});

beforeEach(() => {
  orderRepository.findOrderByIdForUpdate.mockResolvedValue(order());
  orderRepository.findOrderByRazorpayOrderIdForUpdate.mockResolvedValue(order());
  orderRepository.updateOrder.mockImplementation(async (_trx, _id, columns) => ({ ...order(), ...columns }));
  subscriptionRepository.insertSubscription.mockImplementation(async (_trx, row) => ({ id: "sub-1", ...row }));
  createInvoiceForOrder.mockResolvedValue({ id: "inv-1", invoice_number: "LOK/2026-27/000001" });
});

describe("confirmPayment", () => {
  it("marks the order paid and grants the credits until the end date, all in one transaction", async () => {
    const result = await confirmPayment({ orderId: "order-1", payment: payment() }, NOW);

    expect(orderRepository.findOrderByIdForUpdate).toHaveBeenCalledWith(mockTrx, "order-1");
    expect(orderRepository.updateOrder).toHaveBeenCalledWith(mockTrx, "order-1", {
      status: "paid",
      razorpay_payment_id: "pay_1",
      failure_reason: null,
      paid_at: NOW,
    });
    expect(subscriptionRepository.insertSubscription).toHaveBeenCalledWith(
      mockTrx,
      expect.objectContaining({
        user_id: "user-1",
        package_id: "pkg-std",
        source: "purchase",
        order_id: "order-1",
        total_credits: 2,
        lead_limit: null,
        starts_at: NOW,
        ends_at: new Date("2027-02-20T10:00:00.000Z"),
        status: "active",
      }),
    );
    expect(ledgerRepository.insertEntry).toHaveBeenCalledWith(
      mockTrx,
      expect.objectContaining({ subscriptionId: "sub-1", type: "granted", credits: 2, reason: "Order ORD-1" }),
    );
    expect(notificationRepository.insertNotification).toHaveBeenCalledWith(
      mockTrx,
      expect.objectContaining({ user_id: "user-1", type: "payment_success" }),
    );
    expect(adminNotifications.notifySubscriptionPurchased).toHaveBeenCalledWith(mockTrx, {
      userId: "user-1",
      listings: 2,
      months: 3,
      orderNumber: "ORD-1",
    });
    expect(createInvoiceForOrder).toHaveBeenCalledWith(mockTrx, {
      order: expect.objectContaining({ id: "order-1", status: "paid" }),
      subscription: expect.objectContaining({ id: "sub-1" }),
      payment: payment(),
      issuedAt: NOW,
    });
    expect(result).toMatchObject({ alreadyPaid: false, subscription: { id: "sub-1" }, invoice: { id: "inv-1" } });
  });

  it("rolls the whole payment back when the invoice cannot be issued", async () => {
    createInvoiceForOrder.mockRejectedValue(new Error("sequence failed"));

    await expect(confirmPayment({ orderId: "order-1", payment: payment() }, NOW)).rejects.toThrow("sequence failed");
    expect(notificationRepository.insertNotification).not.toHaveBeenCalled();
    expect(adminNotifications.notifySubscriptionPurchased).not.toHaveBeenCalled();
  });

  it("finds the order by the gateway order id for a webhook", async () => {
    await confirmPayment({ razorpayOrderId: "order_rzp_1", payment: payment() }, NOW);

    expect(orderRepository.findOrderByRazorpayOrderIdForUpdate).toHaveBeenCalledWith(mockTrx, "order_rzp_1");
    expect(orderRepository.findOrderByIdForUpdate).not.toHaveBeenCalled();
  });

  it.each(["paid", "refunded"])("does nothing when the order is already %s, so a repeat creates no second subscription", async (status) => {
    orderRepository.findOrderByIdForUpdate.mockResolvedValue(order({ status }));

    const result = await confirmPayment({ orderId: "order-1", payment: payment() }, NOW);

    expect(result).toMatchObject({ alreadyPaid: true, subscription: null });
    expect(orderRepository.updateOrder).not.toHaveBeenCalled();
    expect(subscriptionRepository.insertSubscription).not.toHaveBeenCalled();
    expect(ledgerRepository.insertEntry).not.toHaveBeenCalled();
    expect(adminNotifications.notifySubscriptionPurchased).not.toHaveBeenCalled();
  });

  it("accepts a payment that succeeds on retry after an earlier failure", async () => {
    orderRepository.findOrderByIdForUpdate.mockResolvedValue(order({ status: "failed" }));

    await expect(confirmPayment({ orderId: "order-1", payment: payment() }, NOW)).resolves.toMatchObject({ alreadyPaid: false });
  });

  it.each([
    ["a different amount", { amount: 100 }],
    ["another gateway order", { order_id: "order_other" }],
    ["a different currency", { currency: "USD" }],
    ["a payment that is not captured", { status: "authorized" }],
  ])("rejects %s and grants nothing", async (_label, overrides) => {
    await expect(confirmPayment({ orderId: "order-1", payment: payment(overrides) }, NOW)).rejects.toMatchObject({
      statusCode: 409,
      details: { code: "SUBSCRIPTION_PAYMENT_MISMATCH" },
    });
    expect(orderRepository.updateOrder).not.toHaveBeenCalled();
    expect(subscriptionRepository.insertSubscription).not.toHaveBeenCalled();
  });

  it("answers 404 for an unknown order", async () => {
    orderRepository.findOrderByIdForUpdate.mockResolvedValue(undefined);

    await expect(confirmPayment({ orderId: "missing", payment: payment() }, NOW)).rejects.toMatchObject({
      statusCode: 404,
      details: { code: "SUBSCRIPTION_ORDER_NOT_FOUND" },
    });
  });
});

describe("markPaymentFailed", () => {
  it.each(["created", "pending"])("fails a %s order, keeps the reason and tells the user", async (status) => {
    orderRepository.findOrderByRazorpayOrderIdForUpdate.mockResolvedValue(order({ status }));

    await markPaymentFailed({ razorpayOrderId: "order_rzp_1", reason: "Card declined" });

    expect(orderRepository.updateOrder).toHaveBeenCalledWith(mockTrx, "order-1", { status: "failed", failure_reason: "Card declined" });
    expect(notificationRepository.insertNotification).toHaveBeenCalledWith(
      mockTrx,
      expect.objectContaining({ user_id: "user-1", type: "payment_failed" }),
    );
  });

  it.each(["paid", "refunded", "failed", "cancelled"])("never changes a %s order", async (status) => {
    orderRepository.findOrderByRazorpayOrderIdForUpdate.mockResolvedValue(order({ status }));

    await expect(markPaymentFailed({ razorpayOrderId: "order_rzp_1", reason: "x" })).resolves.toBeNull();
    expect(orderRepository.updateOrder).not.toHaveBeenCalled();
    expect(notificationRepository.insertNotification).not.toHaveBeenCalled();
  });

  it("ignores an order that is not ours and caps a long reason", async () => {
    orderRepository.findOrderByRazorpayOrderIdForUpdate.mockResolvedValueOnce(undefined);
    await expect(markPaymentFailed({ razorpayOrderId: "unknown", reason: "x" })).resolves.toBeNull();

    await markPaymentFailed({ razorpayOrderId: "order_rzp_1", reason: "x".repeat(400) });
    expect(orderRepository.updateOrder).toHaveBeenCalledWith(mockTrx, "order-1", {
      status: "failed",
      failure_reason: "x".repeat(255),
    });
  });
});
