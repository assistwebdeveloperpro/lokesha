jest.mock("./subscription-actions.repository");
jest.mock("../../../shared/subscription/repositories/subscription.repository");
jest.mock("../../../shared/subscription/repositories/subscription-order.repository");
jest.mock("../../../shared/subscription/repositories/subscription-ledger.repository");
jest.mock("../../../user/dashboard/user-notifications/user-notifications.repository");
jest.mock("../../../shared/subscription/services/razorpay.service", () => ({
  razorpayService: { fetchPayment: jest.fn(), refundPayment: jest.fn() },
}));
jest.mock("../../../shared/subscription/services/invoice.service");

const repository = require("./subscription-actions.repository");
const subscriptionRepository = require("../../../shared/subscription/repositories/subscription.repository");
const orderRepository = require("../../../shared/subscription/repositories/subscription-order.repository");
const ledgerRepository = require("../../../shared/subscription/repositories/subscription-ledger.repository");
const notificationRepository = require("../../../user/dashboard/user-notifications/user-notifications.repository");
const { razorpayService } = require("../../../shared/subscription/services/razorpay.service");
const { createCreditNoteForOrder } = require("../../../shared/subscription/services/invoice.service");
const service = require("./subscription-actions.service");

const TRX = Symbol("trx");
const NOW = new Date("2026-11-20T10:00:00.000Z");
const ADMIN = { id: "admin-1" };

beforeEach(() => {
  repository.runInTransaction.mockImplementation((callback) => callback(TRX));
});

describe("giftCredits", () => {
  const input = { userId: "user-1", credits: 3, months: 2, reason: "Goodwill after downtime" };

  beforeEach(() => {
    repository.findUser.mockResolvedValue({ id: "user-1", role: "agent" });
    subscriptionRepository.findPackageByCode.mockResolvedValue({ id: "pkg-std" });
    subscriptionRepository.insertSubscription.mockImplementation(async (_trx, row) => ({ id: "sub-gift", ...row }));
  });

  it("creates a gift subscription with its own end date, a ledger entry, an audit record and a notice", async () => {
    const result = await service.giftCredits(ADMIN, input, NOW);

    expect(subscriptionRepository.insertSubscription).toHaveBeenCalledWith(
      TRX,
      expect.objectContaining({
        user_id: "user-1",
        package_id: "pkg-std",
        source: "admin_gift",
        total_credits: 3,
        lead_limit: null,
        starts_at: NOW,
        ends_at: new Date("2027-01-20T10:00:00.000Z"),
        status: "active",
      }),
    );
    expect(ledgerRepository.insertEntry).toHaveBeenCalledWith(TRX, {
      subscriptionId: "sub-gift",
      userId: "user-1",
      type: "admin_added",
      credits: 3,
      reason: "Goodwill after downtime",
      adminId: "admin-1",
    });
    expect(repository.insertAction).toHaveBeenCalledWith(
      TRX,
      expect.objectContaining({ adminId: "admin-1", userId: "user-1", subscriptionId: "sub-gift", type: "gift_credits", reason: "Goodwill after downtime" }),
    );
    expect(notificationRepository.insertNotification).toHaveBeenCalledWith(TRX, expect.objectContaining({ user_id: "user-1", type: "credits_added" }));
    expect(result).toEqual({ subscriptionId: "sub-gift", credits: 3, endsAt: new Date("2027-01-20T10:00:00.000Z") });
  });

  it("works while the Standard package is switched off for sale", async () => {
    subscriptionRepository.findPackageByCode.mockResolvedValue({ id: "pkg-std", status: "inactive" });

    await expect(service.giftCredits(ADMIN, input, NOW)).resolves.toMatchObject({ subscriptionId: "sub-gift" });
    expect(subscriptionRepository.findPackageByCode).toHaveBeenCalledWith(TRX, "standard");
  });

  it.each([
    ["an unknown user", () => repository.findUser.mockResolvedValue(undefined), 404],
    ["a Lokesha staff user", () => repository.findUser.mockResolvedValue({ id: "user-1", role: "lokesha_staff" }), 409],
    ["a missing Standard package", () => subscriptionRepository.findPackageByCode.mockResolvedValue(undefined), 409],
  ])("refuses %s and changes nothing", async (_label, arrange, statusCode) => {
    arrange();

    await expect(service.giftCredits(ADMIN, input, NOW)).rejects.toMatchObject({ statusCode });
    expect(subscriptionRepository.insertSubscription).not.toHaveBeenCalled();
    expect(repository.insertAction).not.toHaveBeenCalled();
  });
});

describe("extendSubscription", () => {
  const input = { subscriptionId: "sub-1", months: 1, reason: "Promotion extension" };
  const running = { id: "sub-1", user_id: "user-1", status: "active", ends_at: new Date("2026-12-20T10:00:00.000Z") };

  beforeEach(() => repository.findSubscriptionForUpdate.mockResolvedValue(running));

  it("moves the end date and its listings, clears the reminders, records the action and tells the user", async () => {
    const result = await service.extendSubscription(ADMIN, input, NOW);

    const newEnd = new Date("2027-01-20T10:00:00.000Z");
    expect(repository.updateSubscriptionEnd).toHaveBeenCalledWith(TRX, "sub-1", newEnd);
    expect(repository.extendPropertyExpiry).toHaveBeenCalledWith(TRX, "sub-1", newEnd);
    expect(repository.insertAction).toHaveBeenCalledWith(
      TRX,
      expect.objectContaining({
        adminId: "admin-1",
        userId: "user-1",
        subscriptionId: "sub-1",
        type: "extend",
        reason: "Promotion extension",
        details: { months: 1, previousEndsAt: new Date("2026-12-20T10:00:00.000Z"), endsAt: newEnd },
      }),
    );
    expect(notificationRepository.insertNotification).toHaveBeenCalledWith(TRX, expect.objectContaining({ type: "subscription_extended" }));
    expect(result).toEqual({ subscriptionId: "sub-1", previousEndsAt: new Date("2026-12-20T10:00:00.000Z"), endsAt: newEnd });
  });

  it("locks the properties before the subscription, the order an approval uses, so the two cannot deadlock", async () => {
    await service.extendSubscription(ADMIN, input, NOW);

    expect(repository.lockSubscriptionProperties).toHaveBeenCalledWith(TRX, "sub-1");
    expect(repository.lockSubscriptionProperties.mock.invocationCallOrder[0]).toBeLessThan(
      repository.findSubscriptionForUpdate.mock.invocationCallOrder[0],
    );
  });

  it.each([
    ["an unknown subscription", undefined, 404],
    ["an expired subscription", { ...running, status: "expired" }, 409],
    ["a subscription past its end date", { ...running, ends_at: new Date("2026-11-01T00:00:00.000Z") }, 409],
    ["a Free subscription without an end date", { ...running, ends_at: null }, 409],
    ["a refunded subscription", { ...running, status: "refunded" }, 409],
  ])("refuses %s", async (_label, subscription, statusCode) => {
    repository.findSubscriptionForUpdate.mockResolvedValue(subscription);

    await expect(service.extendSubscription(ADMIN, input, NOW)).rejects.toMatchObject({ statusCode });
    expect(repository.updateSubscriptionEnd).not.toHaveBeenCalled();
    expect(repository.insertAction).not.toHaveBeenCalled();
  });
});

describe("refundOrder", () => {
  const input = { orderId: "order-1", reason: "Duplicate purchase" };
  const paidOrder = {
    id: "order-1",
    order_number: "ORD-1",
    user_id: "user-1",
    status: "paid",
    total_amount: 7080,
    razorpay_payment_id: "pay_1",
  };
  const subscription = { id: "sub-1", total_credits: 5, used_credits: 2 };

  beforeEach(() => {
    repository.findOrder.mockResolvedValue(paidOrder);
    razorpayService.fetchPayment.mockResolvedValue({ id: "pay_1", status: "captured", amount: 708000, amount_refunded: 0 });
    razorpayService.refundPayment.mockResolvedValue({ id: "rfnd_1" });
    orderRepository.findOrderByIdForUpdate.mockResolvedValue(paidOrder);
    orderRepository.updateOrder.mockImplementation(async (_trx, _id, columns) => ({ ...paidOrder, ...columns }));
    repository.findSubscriptionByOrderForUpdate.mockResolvedValue(subscription);
    createCreditNoteForOrder.mockResolvedValue({ id: "cn-1", invoice_number: "LOK-CN/2026-27/000001" });
  });

  it("refunds the full amount at the gateway, then marks the order, cancels unused credits, issues a credit note and records it", async () => {
    const result = await service.refundOrder(ADMIN, input, NOW);

    expect(razorpayService.refundPayment).toHaveBeenCalledWith("pay_1", {
      amount: 708000,
      notes: { orderNumber: "ORD-1", reason: "Duplicate purchase" },
    });
    expect(orderRepository.updateOrder).toHaveBeenCalledWith(TRX, "order-1", { status: "refunded", refunded_at: NOW });
    expect(repository.markSubscriptionRefunded).toHaveBeenCalledWith(TRX, "sub-1");
    expect(ledgerRepository.insertEntry).toHaveBeenCalledWith(TRX, {
      subscriptionId: "sub-1",
      userId: "user-1",
      type: "cancelled",
      credits: -3,
      reason: "Refund of order ORD-1",
      adminId: "admin-1",
    });
    expect(createCreditNoteForOrder).toHaveBeenCalledWith(TRX, { order: expect.objectContaining({ status: "refunded" }), issuedAt: NOW });
    expect(repository.insertAction).toHaveBeenCalledWith(
      TRX,
      expect.objectContaining({
        type: "refund",
        orderId: "order-1",
        subscriptionId: "sub-1",
        details: { amount: 7080, razorpayPaymentId: "pay_1", cancelledCredits: 3, creditNoteNumber: "LOK-CN/2026-27/000001" },
      }),
    );
    expect(notificationRepository.insertNotification).toHaveBeenCalledWith(TRX, expect.objectContaining({ type: "refund_issued" }));
    expect(result).toEqual({ orderId: "order-1", status: "refunded", cancelledCredits: 3, creditNote: { id: "cn-1", number: "LOK-CN/2026-27/000001" } });
  });

  it("keeps used credits and writes no ledger row when everything was used", async () => {
    repository.findSubscriptionByOrderForUpdate.mockResolvedValue({ ...subscription, used_credits: 5 });

    await expect(service.refundOrder(ADMIN, input, NOW)).resolves.toMatchObject({ cancelledCredits: 0 });
    expect(ledgerRepository.insertEntry).not.toHaveBeenCalled();
    expect(repository.markSubscriptionRefunded).toHaveBeenCalled();
  });

  it("still completes when the order has no subscription or no credit note could be issued", async () => {
    repository.findSubscriptionByOrderForUpdate.mockResolvedValue(undefined);
    createCreditNoteForOrder.mockResolvedValue(null);

    await expect(service.refundOrder(ADMIN, input, NOW)).resolves.toEqual({ orderId: "order-1", status: "refunded", cancelledCredits: 0, creditNote: null });
  });

  it.each([
    ["already refunded in full", { status: "refunded", amount: 708000, amount_refunded: 708000 }],
    ["marked refunded by the gateway", { status: "refunded", amount: 708000, amount_refunded: 0 }],
  ])("does not refund again when the payment is %s, so a retry after a failure is safe", async (_label, payment) => {
    razorpayService.fetchPayment.mockResolvedValue({ id: "pay_1", ...payment });

    await expect(service.refundOrder(ADMIN, input, NOW)).resolves.toMatchObject({ status: "refunded" });
    expect(razorpayService.refundPayment).not.toHaveBeenCalled();
    expect(orderRepository.updateOrder).toHaveBeenCalled();
  });

  it("changes nothing when the gateway refuses the refund", async () => {
    razorpayService.refundPayment.mockRejectedValue(Object.assign(new Error("gateway"), { statusCode: 502 }));

    await expect(service.refundOrder(ADMIN, input, NOW)).rejects.toMatchObject({ statusCode: 502 });
    expect(repository.runInTransaction).not.toHaveBeenCalled();
    expect(orderRepository.updateOrder).not.toHaveBeenCalled();
  });

  it.each([
    ["an unknown order", undefined, 404],
    ["an order already refunded", { ...paidOrder, status: "refunded" }, 409],
    ["an unpaid order", { ...paidOrder, status: "failed" }, 409],
    ["a paid order without a payment id", { ...paidOrder, razorpay_payment_id: null }, 409],
  ])("refuses %s before touching the gateway", async (_label, order, statusCode) => {
    repository.findOrder.mockResolvedValue(order);

    await expect(service.refundOrder(ADMIN, input, NOW)).rejects.toMatchObject({ statusCode });
    expect(razorpayService.fetchPayment).not.toHaveBeenCalled();
    expect(razorpayService.refundPayment).not.toHaveBeenCalled();
  });

  it("leaves a parallel refund that finished first untouched", async () => {
    orderRepository.findOrderByIdForUpdate.mockResolvedValue({ ...paidOrder, status: "refunded" });

    await expect(service.refundOrder(ADMIN, input, NOW)).resolves.toEqual({ orderId: "order-1", status: "refunded", cancelledCredits: 0, creditNote: null });
    expect(orderRepository.updateOrder).not.toHaveBeenCalled();
    expect(createCreditNoteForOrder).not.toHaveBeenCalled();
    expect(repository.insertAction).not.toHaveBeenCalled();
  });
});

describe("listActions", () => {
  it("maps the audit trail with the admin who acted", async () => {
    repository.findActions.mockResolvedValue([
      { id: "a-1", type: "refund", reason: "Duplicate", details: { amount: 118000 }, subscription_id: "sub-1", order_id: "order-1", created_at: NOW, admin_id: "admin-1", admin_name: "Asha" },
      { id: "a-2", type: "extend", reason: "Promo", details: {}, subscription_id: "sub-2", order_id: null, created_at: NOW, admin_id: null, admin_name: null },
    ]);
    repository.countActions.mockResolvedValue(2);

    const result = await service.listActions("user-1", { page: 1, limit: 10 });

    expect(repository.findActions).toHaveBeenCalledWith("user-1", { page: 1, limit: 10 });
    expect(result).toMatchObject({ page: 1, limit: 10, total: 2 });
    expect(result.items[0]).toMatchObject({ type: "refund", admin: { id: "admin-1", name: "Asha" }, details: { amount: 118000 } });
    expect(result.items[1].admin).toBeNull();
  });
});
