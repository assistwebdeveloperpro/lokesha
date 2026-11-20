const crypto = require("crypto");
const repository = require("./razorpay-webhook.repository");
const { razorpayService } = require("../../shared/subscription/services/razorpay.service");
const { confirmPayment, markPaymentFailed } = require("../../shared/subscription/services/subscription-payment.service");
const { ERROR_CODES } = require("../../shared/subscription/constants/subscription.constants");
const { AppError } = require("../../shared/property/utils/property.errors");

const BAD_REQUEST = 400;
const PAID_EVENTS = ["payment.captured", "order.paid"];
const FAILED_EVENT = "payment.failed";
const IGNORED_CODES = [ERROR_CODES.ORDER_NOT_FOUND, ERROR_CODES.PAYMENT_MISMATCH];

function parsePayload(rawBody) {
  try {
    return JSON.parse(rawBody.toString("utf8"));
  } catch {
    throw new AppError("Invalid webhook body", BAD_REQUEST);
  }
}

// Razorpay sends an event id header; the body hash covers a delivery without it
const resolveEventId = (headerValue, rawBody) => headerValue || crypto.createHash("sha256").update(rawBody).digest("hex");

// An order that is not ours, or a payment that does not match it, will never succeed on retry
async function runIgnoringUnmatched(action, event) {
  try {
    await action();
  } catch (error) {
    if (!IGNORED_CODES.includes(error.details?.code)) throw error;
    console.error("Razorpay webhook ignored:", event.event, error.details.code);
  }
}

async function dispatch(event) {
  const payment = event.payload?.payment?.entity;
  if (!payment?.order_id) return;

  if (PAID_EVENTS.includes(event.event)) {
    await runIgnoringUnmatched(() => confirmPayment({ razorpayOrderId: payment.order_id, payment }), event);
  } else if (event.event === FAILED_EVENT) {
    await markPaymentFailed({ razorpayOrderId: payment.order_id, reason: payment.error_description });
  }
}

// The signature is checked on the exact bytes received; a processing error throws so Razorpay retries
async function handleWebhook({ rawBody, signature, eventIdHeader }) {
  if (!Buffer.isBuffer(rawBody) || !razorpayService.verifyWebhookSignature(rawBody, signature)) {
    throw new AppError("Invalid webhook signature", BAD_REQUEST);
  }

  const event = parsePayload(rawBody);
  const eventId = resolveEventId(eventIdHeader, rawBody);

  await repository.insertEventIfAbsent({ eventId, type: String(event.event), payload: event });
  const stored = await repository.findEvent(eventId);
  if (stored?.processed_at) return { duplicate: true };

  await dispatch(event);
  await repository.markProcessed(eventId);

  return { duplicate: false };
}

module.exports = { handleWebhook };
