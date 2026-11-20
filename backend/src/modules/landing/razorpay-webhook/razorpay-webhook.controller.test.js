jest.mock("./razorpay-webhook.service");

const service = require("./razorpay-webhook.service");
const { receiveWebhook } = require("./razorpay-webhook.controller");

const buildResponse = () => {
  const res = { status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  return res;
};

const buildRequest = () => ({
  body: Buffer.from("{}"),
  get: jest.fn((name) => ({ "x-razorpay-signature": "sig", "x-razorpay-event-id": "evt_1" })[name]),
});

beforeEach(() => jest.spyOn(console, "error").mockImplementation(() => {}));

describe("receiveWebhook", () => {
  it("hands the raw body and both headers to the service and answers 200", async () => {
    service.handleWebhook.mockResolvedValue({ duplicate: false });
    const req = buildRequest();
    const res = buildResponse();

    await receiveWebhook(req, res);

    expect(service.handleWebhook).toHaveBeenCalledWith({ rawBody: req.body, signature: "sig", eventIdHeader: "evt_1" });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ received: true });
  });

  it("answers 400 for a bad signature so the sender does not retry", async () => {
    service.handleWebhook.mockRejectedValue(Object.assign(new Error("Invalid webhook signature"), { statusCode: 400 }));
    const res = buildResponse();

    await receiveWebhook(buildRequest(), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid webhook signature" });
  });

  it.each([
    ["an unexpected error", new Error("database down")],
    ["missing payment configuration", Object.assign(new Error("not configured"), { statusCode: 503 })],
  ])("answers 500 for %s so Razorpay retries", async (_label, error) => {
    service.handleWebhook.mockRejectedValue(error);
    const res = buildResponse();

    await receiveWebhook(buildRequest(), res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Webhook could not be processed" });
  });
});
