const crypto = require("crypto");
const Razorpay = require("razorpay");
const { ERROR_CODES } = require("../constants/subscription.constants");
const { AppError } = require("../../property/utils/property.errors");

const CURRENCY = "INR";
const SERVICE_UNAVAILABLE = 503;
const BAD_GATEWAY = 502;

const hmacSha256 = (secret, payload) => crypto.createHmac("sha256", secret).update(payload).digest("hex");

// Constant-time compare, a wrong length is rejected before the compare
function safeEqual(expected, actual) {
  if (typeof actual !== "string") return false;

  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(actual);
  return expectedBuffer.length === actualBuffer.length && crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}

// Keys are read on use, so the server starts and the rest of the app works without them
function createRazorpayService({ env = process.env, createClient = (options) => new Razorpay(options) } = {}) {
  let client = null;

  function requireEnv(name) {
    const value = env[name];
    if (!value) {
      throw new AppError("Online payments are not available right now.", SERVICE_UNAVAILABLE, {
        code: ERROR_CODES.PAYMENTS_NOT_CONFIGURED,
      });
    }
    return value;
  }

  function getClient() {
    client ??= createClient({ key_id: requireEnv("RAZORPAY_KEY_ID"), key_secret: requireEnv("RAZORPAY_KEY_SECRET") });
    return client;
  }

  // Gateway errors carry details we do not want to show users
  async function callGateway(action) {
    try {
      return await action(getClient());
    } catch (error) {
      if (error instanceof AppError) throw error;

      console.error("Razorpay error:", error?.error?.description ?? error?.message);
      throw new AppError("We could not reach the payment gateway. Please try again.", BAD_GATEWAY, {
        code: ERROR_CODES.PAYMENT_GATEWAY_FAILED,
      });
    }
  }

  const getKeyId = () => requireEnv("RAZORPAY_KEY_ID");

  const createOrder = ({ amount, receipt, notes }) =>
    callGateway((razorpay) => razorpay.orders.create({ amount, currency: CURRENCY, receipt, notes }));

  const fetchPayment = (paymentId) => callGateway((razorpay) => razorpay.payments.fetch(paymentId));

  const fetchOrderPayments = (orderId) => callGateway((razorpay) => razorpay.orders.fetchPayments(orderId));

  const refundPayment = (paymentId, { amount, notes }) =>
    callGateway((razorpay) => razorpay.payments.refund(paymentId, { amount, notes }));

  // Signature the checkout returns to the browser: HMAC of "order_id|payment_id" with the key secret
  function verifyPaymentSignature({ orderId, paymentId, signature }) {
    return safeEqual(hmacSha256(requireEnv("RAZORPAY_KEY_SECRET"), `${orderId}|${paymentId}`), signature);
  }

  // Signature Razorpay sends with a webhook: HMAC of the raw body with the webhook secret
  function verifyWebhookSignature(rawBody, signature) {
    return safeEqual(hmacSha256(requireEnv("RAZORPAY_WEBHOOK_SECRET"), rawBody), signature);
  }

  return {
    CURRENCY,
    getKeyId,
    createOrder,
    fetchPayment,
    fetchOrderPayments,
    refundPayment,
    verifyPaymentSignature,
    verifyWebhookSignature,
  };
}

module.exports = { createRazorpayService, razorpayService: createRazorpayService() };
