jest.mock("./razorpay-webhook.repository");
jest.mock("../../shared/subscription/services/razorpay.service", () => ({
  razorpayService: { verifyWebhookSignature: jest.fn() },
}));
jest.mock("../../shared/subscription/services/subscription-payment.service");

const repository = require("./razorpay-webhook.repository");
const { razorpayService } = require("../../shared/subscription/services/razorpay.service");
const { confirmPayment, markPaymentFailed } = require("../../shared/subscription/services/subscription-payment.service");
const { handleWebhook } = require("./razorpay-webhook.service");

const PAYMENT = { id: "pay_1", order_id: "order_rzp_1", amount: 118000, currency: "INR", status: "captured" };

const buildRequest = (event, overrides = {}) => ({
  rawBody: Buffer.from(JSON.stringify(event)),
  signature: "valid-signature",
  eventIdHeader: "evt_1",
  ...overrides,
});

const capturedEvent = { event: "payment.captured", payload: { payment: { entity: PAYMENT } } };

beforeEach(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
  razorpayService.verifyWebhookSignature.mockReturnValue(true);
  repository.findEvent.mockResolvedValue({ event_id: "evt_1", processed_at: null });
  confirmPayment.mockResolvedValue({ alreadyPaid: false });
});

describe("signature", () => {
  it("checks the exact bytes received against the header", async () => {
    const request = buildRequest(capturedEvent);

    await handleWebhook(request);

    expect(razorpayService.verifyWebhookSignature).toHaveBeenCalledWith(request.rawBody, "valid-signature");
  });

  it("rejects a bad signature or a body that is not raw bytes before storing anything", async () => {
    razorpayService.verifyWebhookSignature.mockReturnValue(false);
    await expect(handleWebhook(buildRequest(capturedEvent))).rejects.toMatchObject({ statusCode: 400 });

    razorpayService.verifyWebhookSignature.mockReturnValue(true);
    await expect(handleWebhook(buildRequest(capturedEvent, { rawBody: { event: "x" } }))).rejects.toMatchObject({ statusCode: 400 });

    expect(repository.insertEventIfAbsent).not.toHaveBeenCalled();
    expect(confirmPayment).not.toHaveBeenCalled();
  });

  it("rejects a signed body that is not JSON", async () => {
    await expect(handleWebhook(buildRequest(null, { rawBody: Buffer.from("not json") }))).rejects.toMatchObject({ statusCode: 400 });
  });
});

describe("paid events", () => {
  it.each(["payment.captured", "order.paid"])("confirms the order of a %s event and marks the event processed", async (name) => {
    const result = await handleWebhook(buildRequest({ event: name, payload: { payment: { entity: PAYMENT } } }));

    expect(repository.insertEventIfAbsent).toHaveBeenCalledWith(expect.objectContaining({ eventId: "evt_1", type: name }));
    expect(confirmPayment).toHaveBeenCalledWith({ razorpayOrderId: "order_rzp_1", payment: PAYMENT });
    expect(repository.markProcessed).toHaveBeenCalledWith("evt_1");
    expect(result).toEqual({ duplicate: false });
  });

  it("skips an event that was already processed, so a replay changes nothing", async () => {
    repository.findEvent.mockResolvedValue({ event_id: "evt_1", processed_at: new Date() });

    await expect(handleWebhook(buildRequest(capturedEvent))).resolves.toEqual({ duplicate: true });
    expect(confirmPayment).not.toHaveBeenCalled();
    expect(repository.markProcessed).not.toHaveBeenCalled();
  });

  it("runs again for an event stored earlier but never finished", async () => {
    repository.findEvent.mockResolvedValue({ event_id: "evt_1", processed_at: null });

    await handleWebhook(buildRequest(capturedEvent));

    expect(confirmPayment).toHaveBeenCalledTimes(1);
  });

  it("falls back to a hash of the body when the event id header is missing", async () => {
    await handleWebhook(buildRequest(capturedEvent, { eventIdHeader: undefined }));

    expect(repository.insertEventIfAbsent).toHaveBeenCalledWith(expect.objectContaining({ eventId: expect.stringMatching(/^[0-9a-f]{64}$/) }));
  });

  it.each([
    ["an order that is not ours", "SUBSCRIPTION_ORDER_NOT_FOUND"],
    ["a payment that does not match its order", "SUBSCRIPTION_PAYMENT_MISMATCH"],
  ])("settles %s without retrying", async (_label, code) => {
    confirmPayment.mockRejectedValue(Object.assign(new Error("x"), { statusCode: 409, details: { code } }));

    await expect(handleWebhook(buildRequest(capturedEvent))).resolves.toEqual({ duplicate: false });
    expect(repository.markProcessed).toHaveBeenCalledWith("evt_1");
  });

  it("throws on any other failure and leaves the event unprocessed so Razorpay retries", async () => {
    confirmPayment.mockRejectedValue(new Error("database down"));

    await expect(handleWebhook(buildRequest(capturedEvent))).rejects.toThrow("database down");
    expect(repository.markProcessed).not.toHaveBeenCalled();
  });
});

describe("other events", () => {
  it("marks the order of a failed payment as failed with the gateway's reason", async () => {
    const failed = { event: "payment.failed", payload: { payment: { entity: { ...PAYMENT, status: "failed", error_description: "Card declined" } } } };

    await handleWebhook(buildRequest(failed));

    expect(markPaymentFailed).toHaveBeenCalledWith({ razorpayOrderId: "order_rzp_1", reason: "Card declined" });
    expect(confirmPayment).not.toHaveBeenCalled();
  });

  it("stores and acknowledges events it does not act on", async () => {
    await expect(handleWebhook(buildRequest({ event: "refund.processed", payload: { refund: { entity: {} } } }))).resolves.toEqual({ duplicate: false });

    expect(repository.insertEventIfAbsent).toHaveBeenCalled();
    expect(confirmPayment).not.toHaveBeenCalled();
    expect(markPaymentFailed).not.toHaveBeenCalled();
    expect(repository.markProcessed).toHaveBeenCalled();
  });
});
