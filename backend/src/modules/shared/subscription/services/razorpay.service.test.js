const crypto = require("crypto");
const { createRazorpayService } = require("./razorpay.service");

const ENV = { RAZORPAY_KEY_ID: "rzp_test_key", RAZORPAY_KEY_SECRET: "key-secret", RAZORPAY_WEBHOOK_SECRET: "hook-secret" };

const sign = (secret, payload) => crypto.createHmac("sha256", secret).update(payload).digest("hex");

function buildService(env = ENV) {
  const razorpay = {
    orders: { create: jest.fn().mockResolvedValue({ id: "order_1" }), fetchPayments: jest.fn().mockResolvedValue({ items: [] }) },
    payments: { fetch: jest.fn().mockResolvedValue({ id: "pay_1" }), refund: jest.fn().mockResolvedValue({ id: "rfnd_1" }) },
  };
  const createClient = jest.fn(() => razorpay);
  return { razorpay, createClient, service: createRazorpayService({ env, createClient }) };
}

describe("verifyPaymentSignature", () => {
  it("accepts the signature of order_id|payment_id made with the key secret", () => {
    const { service } = buildService();

    expect(service.verifyPaymentSignature({ orderId: "order_1", paymentId: "pay_1", signature: sign("key-secret", "order_1|pay_1") })).toBe(true);
  });

  it.each([
    ["a signature made with another secret", sign("other", "order_1|pay_1")],
    ["a signature of another payment", sign("key-secret", "order_1|pay_2")],
    ["a short value", "abc"],
    ["an empty value", ""],
    ["a missing value", undefined],
  ])("rejects %s", (_label, signature) => {
    const { service } = buildService();

    expect(service.verifyPaymentSignature({ orderId: "order_1", paymentId: "pay_1", signature })).toBe(false);
  });
});

describe("verifyWebhookSignature", () => {
  const body = Buffer.from('{"event":"payment.captured"}');

  it("accepts the HMAC of the raw body made with the webhook secret", () => {
    const { service } = buildService();

    expect(service.verifyWebhookSignature(body, sign("hook-secret", body))).toBe(true);
  });

  it("rejects a tampered body, the key secret and a missing header", () => {
    const { service } = buildService();

    expect(service.verifyWebhookSignature(Buffer.from('{"event":"payment.failed"}'), sign("hook-secret", body))).toBe(false);
    expect(service.verifyWebhookSignature(body, sign("key-secret", body))).toBe(false);
    expect(service.verifyWebhookSignature(body, undefined)).toBe(false);
  });
});

describe("gateway calls", () => {
  it("creates an order in INR and builds the client once", async () => {
    const { service, razorpay, createClient } = buildService();

    await service.createOrder({ amount: 118000, receipt: "ORD-1", notes: { orderId: "o-1" } });
    await service.fetchPayment("pay_1");

    expect(razorpay.orders.create).toHaveBeenCalledWith({ amount: 118000, currency: "INR", receipt: "ORD-1", notes: { orderId: "o-1" } });
    expect(razorpay.payments.fetch).toHaveBeenCalledWith("pay_1");
    expect(createClient).toHaveBeenCalledTimes(1);
    expect(createClient).toHaveBeenCalledWith({ key_id: "rzp_test_key", key_secret: "key-secret" });
  });

  it("refunds a payment for an amount", async () => {
    const { service, razorpay } = buildService();

    await service.refundPayment("pay_1", { amount: 5000, notes: { reason: "goodwill" } });

    expect(razorpay.payments.refund).toHaveBeenCalledWith("pay_1", { amount: 5000, notes: { reason: "goodwill" } });
  });

  it("hides gateway details behind a 502 with a code", async () => {
    const { service, razorpay } = buildService();
    jest.spyOn(console, "error").mockImplementation(() => {});
    razorpay.orders.create.mockRejectedValue({ error: { description: "Authentication failed" } });

    await expect(service.createOrder({ amount: 100, receipt: "r" })).rejects.toMatchObject({
      statusCode: 502,
      message: "We could not reach the payment gateway. Please try again.",
      details: { code: "SUBSCRIPTION_PAYMENT_GATEWAY_FAILED" },
    });
  });
});

describe("missing configuration", () => {
  it("answers 503 instead of crashing when the keys are not set", async () => {
    const { service, createClient } = buildService({});

    await expect(service.createOrder({ amount: 100, receipt: "r" })).rejects.toMatchObject({
      statusCode: 503,
      details: { code: "SUBSCRIPTION_PAYMENTS_NOT_CONFIGURED" },
    });
    expect(() => service.getKeyId()).toThrow(/not available/);
    expect(() => service.verifyWebhookSignature(Buffer.from("x"), "y")).toThrow(/not available/);
    expect(createClient).not.toHaveBeenCalled();
  });
});
