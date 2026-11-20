jest.mock("../repositories/subscription-recovery.repository");
jest.mock("./razorpay.service", () => ({ razorpayService: { fetchOrderPayments: jest.fn() } }));
jest.mock("./subscription-payment.service");

const recoveryRepository = require("../repositories/subscription-recovery.repository");
const { razorpayService } = require("./razorpay.service");
const { confirmPayment } = require("./subscription-payment.service");
const { recoverPendingPayments } = require("./subscription-recovery.service");

const NOW = new Date("2026-11-20T10:00:00.000Z");
const CAPTURED = { id: "pay_1", status: "captured", order_id: "order_rzp_1", amount: 118000, currency: "INR" };

beforeEach(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
  recoveryRepository.findRecoveryMinutes.mockResolvedValue(30);
  recoveryRepository.findRecoverableOrders.mockResolvedValue([]);
  recoveryRepository.findAbandonedOrders.mockResolvedValue([]);
  recoveryRepository.cancelOrderIfOpen.mockResolvedValue(1);
  razorpayService.fetchOrderPayments.mockResolvedValue({ items: [] });
  confirmPayment.mockResolvedValue({ alreadyPaid: false });
});

describe("recoverPendingPayments: recent orders", () => {
  beforeEach(() => {
    recoveryRepository.findRecoverableOrders.mockResolvedValue([{ id: "order-1", razorpay_order_id: "order_rzp_1" }]);
  });

  it("looks at orders between the recovery delay and one day old", async () => {
    await recoverPendingPayments(NOW);

    expect(recoveryRepository.findRecoverableOrders).toHaveBeenCalledWith({
      olderThan: new Date("2026-11-20T09:30:00.000Z"),
      newerThan: new Date("2026-11-19T10:00:00.000Z"),
      limit: 50,
    });
  });

  it("confirms an order the gateway shows as captured", async () => {
    razorpayService.fetchOrderPayments.mockResolvedValue({ items: [{ id: "pay_0", status: "failed" }, CAPTURED] });

    await expect(recoverPendingPayments(NOW)).resolves.toEqual({ recovered: 1, cancelled: 0 });

    expect(razorpayService.fetchOrderPayments).toHaveBeenCalledWith("order_rzp_1");
    expect(confirmPayment).toHaveBeenCalledWith({ orderId: "order-1", payment: CAPTURED });
  });

  it("leaves an order alone when nothing was captured yet", async () => {
    razorpayService.fetchOrderPayments.mockResolvedValue({ items: [{ id: "pay_0", status: "failed" }] });

    await expect(recoverPendingPayments(NOW)).resolves.toEqual({ recovered: 0, cancelled: 0 });
    expect(confirmPayment).not.toHaveBeenCalled();
    expect(recoveryRepository.cancelOrderIfOpen).not.toHaveBeenCalled();
  });

  it("keeps going when one order cannot be checked or confirmed", async () => {
    recoveryRepository.findRecoverableOrders.mockResolvedValue([
      { id: "order-bad", razorpay_order_id: "order_bad" },
      { id: "order-1", razorpay_order_id: "order_rzp_1" },
    ]);
    razorpayService.fetchOrderPayments.mockRejectedValueOnce(new Error("gateway down")).mockResolvedValueOnce({ items: [CAPTURED] });

    await expect(recoverPendingPayments(NOW)).resolves.toEqual({ recovered: 1, cancelled: 0 });
    expect(console.error).toHaveBeenCalledWith("Payment recovery failed for order order-bad:", "gateway down");
  });

  it("uses the recovery delay from the settings", async () => {
    recoveryRepository.findRecoveryMinutes.mockResolvedValue(10);

    await recoverPendingPayments(NOW);

    expect(recoveryRepository.findRecoverableOrders).toHaveBeenCalledWith(expect.objectContaining({ olderThan: new Date("2026-11-20T09:50:00.000Z") }));
  });
});

describe("recoverPendingPayments: abandoned orders", () => {
  it("cancels an old open order after the gateway shows no captured payment", async () => {
    recoveryRepository.findAbandonedOrders.mockResolvedValue([{ id: "order-old", razorpay_order_id: "order_old" }]);

    await expect(recoverPendingPayments(NOW)).resolves.toEqual({ recovered: 0, cancelled: 1 });

    expect(recoveryRepository.findAbandonedOrders).toHaveBeenCalledWith(new Date("2026-11-19T10:00:00.000Z"), 50);
    expect(recoveryRepository.cancelOrderIfOpen).toHaveBeenCalledWith("order-old", "Payment was not completed");
  });

  it("confirms an old order that was paid after all, instead of cancelling it", async () => {
    recoveryRepository.findAbandonedOrders.mockResolvedValue([{ id: "order-old", razorpay_order_id: "order_old" }]);
    razorpayService.fetchOrderPayments.mockResolvedValue({ items: [CAPTURED] });

    await expect(recoverPendingPayments(NOW)).resolves.toEqual({ recovered: 0, cancelled: 0 });
    expect(confirmPayment).toHaveBeenCalledWith({ orderId: "order-old", payment: CAPTURED });
    expect(recoveryRepository.cancelOrderIfOpen).not.toHaveBeenCalled();
  });

  it("cancels an order that never reached the gateway without calling it", async () => {
    recoveryRepository.findAbandonedOrders.mockResolvedValue([{ id: "order-old", razorpay_order_id: null }]);

    await expect(recoverPendingPayments(NOW)).resolves.toEqual({ recovered: 0, cancelled: 1 });
    expect(razorpayService.fetchOrderPayments).not.toHaveBeenCalled();
  });

  it("keeps an order open when the gateway cannot be asked, so a paid order is never cancelled by mistake", async () => {
    recoveryRepository.findAbandonedOrders.mockResolvedValue([{ id: "order-old", razorpay_order_id: "order_old" }]);
    razorpayService.fetchOrderPayments.mockRejectedValue(new Error("gateway down"));

    await expect(recoverPendingPayments(NOW)).resolves.toEqual({ recovered: 0, cancelled: 0 });
    expect(recoveryRepository.cancelOrderIfOpen).not.toHaveBeenCalled();
  });

  it("does not count an order that was settled meanwhile", async () => {
    recoveryRepository.findAbandonedOrders.mockResolvedValue([{ id: "order-old", razorpay_order_id: "order_old" }]);
    recoveryRepository.cancelOrderIfOpen.mockResolvedValue(0);

    await expect(recoverPendingPayments(NOW)).resolves.toEqual({ recovered: 0, cancelled: 0 });
  });
});
