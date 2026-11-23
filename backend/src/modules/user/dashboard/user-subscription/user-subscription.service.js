const crypto = require("crypto");
const repository = require("./user-subscription.repository");
const { razorpayService } = require("../../../shared/subscription/services/razorpay.service");
const { confirmPayment } = require("../../../shared/subscription/services/subscription-payment.service");
const { calculatePrice, toGatewayAmount } = require("../../../shared/subscription/utils/subscription-pricing.util");
const { addMonths, formatIstDate } = require("../../../shared/subscription/utils/subscription-dates.util");
const { ORDER_STATUSES, ERROR_CODES } = require("../../../shared/subscription/constants/subscription.constants");
const { AppError } = require("../../../shared/property/utils/property.errors");

const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const CONFLICT = 409;
const PAYMENT_CAPTURED = "captured";
const MIN_CHARGE = 1;
const GATEWAY_ERROR_REASON = "Could not create the payment order";

const plural = (count, singular, pluralForm) => `${count} ${count === 1 ? singular : pluralForm}`;

function toUserPackage(row) {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    displayTitle: row.display_title,
    description: row.description ?? "",
    benefits: row.benefits,
    pricePerListingMonth: row.price_per_listing_month,
    pricePerLead: row.price_per_lead,
    gstPercent: Number(row.gst_percent),
    minLeads: row.min_leads,
    maxLeads: row.max_leads,
    minListings: row.min_listings,
    maxListings: row.max_listings,
    minMonths: row.min_months,
    maxMonths: row.max_months,
    allowCustomQuantity: row.allow_custom_quantity,
    allowCustomDuration: row.allow_custom_duration,
    freeCredits: row.free_credits,
    freeLeadLimit: row.free_lead_limit,
    freePropertyValidityDays: row.free_property_validity_days,
  };
}

function toOrderSummary(order) {
  return {
    id: order.id,
    orderNumber: order.order_number,
    status: order.status,
    orderType: order.order_type,
    listings: order.listings,
    months: order.months,
    leads: order.leads,
    baseAmount: order.base_amount,
    gstAmount: order.gst_amount,
    totalAmount: order.total_amount,
    paidAt: order.paid_at,
  };
}

const invalidChoice = (code, field, message) =>
  new AppError(message, BAD_REQUEST, { code, errors: [message], fields: { [field]: message } });

// Without the custom flag the user can only buy the package's own minimum
function assertChoiceAllowed(pkg, { listings, months }) {
  if (pkg.allow_custom_quantity ? listings < pkg.min_listings || listings > pkg.max_listings : listings !== pkg.min_listings) {
    throw invalidChoice(ERROR_CODES.INVALID_QUANTITY, "listings", `Choose between ${pkg.min_listings} and ${pkg.max_listings} listings`);
  }
  if (pkg.allow_custom_duration ? months < pkg.min_months || months > pkg.max_months : months !== pkg.min_months) {
    throw invalidChoice(ERROR_CODES.INVALID_DURATION, "months", `Choose between ${pkg.min_months} and ${pkg.max_months} months`);
  }
}

async function loadPurchasablePackage() {
  const pkg = await repository.findPurchasablePackage();
  if (!pkg) {
    throw new AppError("This package is not available for purchase right now.", CONFLICT, { code: ERROR_CODES.PACKAGE_INACTIVE });
  }
  return pkg;
}

// The price always comes from the stored package, never from the client
function buildQuote(pkg, { listings, months }, now = new Date()) {
  assertChoiceAllowed(pkg, { listings, months });

  const price = calculatePrice({
    listings,
    months,
    pricePerListingMonth: pkg.price_per_listing_month,
    gstPercent: Number(pkg.gst_percent),
  });
  if (price.totalAmount < MIN_CHARGE) {
    throw new AppError("This package cannot be purchased online right now.", CONFLICT, { code: ERROR_CODES.PACKAGE_INACTIVE });
  }

  return {
    packageId: pkg.id,
    listings,
    months,
    pricePerListingMonth: pkg.price_per_listing_month,
    gstPercent: Number(pkg.gst_percent),
    ...price,
    startsAt: now,
    endsAt: addMonths(now, months),
    benefits: [plural(listings, "Property Listing", "Property Listings"), "Unlimited Leads", `${plural(months, "Month", "Months")} Validity`],
  };
}

// e.g. ORD-20261120-7F3A91BC
function generateOrderNumber(now = new Date()) {
  return `ORD-${formatIstDate(now).replaceAll("-", "")}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

// Opens the gateway order for a saved order, shared by every kind of purchase
async function startCheckout({ order, user, totalAmount, description }) {
  let gatewayOrder;
  try {
    gatewayOrder = await razorpayService.createOrder({
      amount: toGatewayAmount(totalAmount),
      receipt: order.order_number,
      notes: { orderId: order.id, userId: user.id },
    });
  } catch (error) {
    await repository.updateOrder(order.id, { status: ORDER_STATUSES.FAILED, failure_reason: GATEWAY_ERROR_REASON });
    throw error;
  }

  await repository.updateOrder(order.id, { razorpay_order_id: gatewayOrder.id, status: ORDER_STATUSES.PENDING });

  return {
    order: { ...toOrderSummary(order), status: ORDER_STATUSES.PENDING },
    checkout: {
      keyId: razorpayService.getKeyId(),
      razorpayOrderId: gatewayOrder.id,
      amount: toGatewayAmount(totalAmount),
      currency: razorpayService.CURRENCY,
      name: "Lokesha",
      description,
      prefill: { name: user.name, email: user.email, contact: user.mobile_number },
    },
  };
}

async function listPackages() {
  return { items: (await repository.findActivePackages()).map(toUserPackage) };
}

async function getQuote(input) {
  return buildQuote(await loadPurchasablePackage(), input);
}

async function createOrder(userId, { listings, months, gstin }) {
  const now = new Date();
  const pkg = await loadPurchasablePackage();
  const quote = buildQuote(pkg, { listings, months }, now);

  const user = await repository.findCheckoutUser(userId);
  if (!user) throw new AppError("User not found", NOT_FOUND);

  // Saved first with the package terms of this moment, so later admin edits never change this order
  const order = await repository.insertOrder({
    order_number: generateOrderNumber(now),
    user_id: userId,
    package_id: pkg.id,
    listings,
    months,
    price_per_listing_month: quote.pricePerListingMonth,
    gst_percent: quote.gstPercent,
    base_amount: quote.baseAmount,
    gst_amount: quote.gstAmount,
    total_amount: quote.totalAmount,
    status: ORDER_STATUSES.CREATED,
    user_gstin: gstin || null,
    snapshot: JSON.stringify({ package: toUserPackage(pkg), quote }),
  });

  const checkout = await startCheckout({
    order,
    user,
    totalAmount: quote.totalAmount,
    description: `Standard package: ${quote.benefits[0]}, ${quote.benefits[2]}`,
  });

  return { ...checkout, quote };
}

// A fast path for the browser return; the webhook stays the source of truth, so anything unsure answers "pending"
async function verifyPayment(userId, orderId, { razorpay_payment_id: paymentId, razorpay_signature: signature }) {
  const order = await repository.findOrderForUser(userId, orderId);
  if (!order) throw new AppError("Order not found", NOT_FOUND, { code: ERROR_CODES.ORDER_NOT_FOUND });
  if (order.status === ORDER_STATUSES.PAID) return { status: ORDER_STATUSES.PAID, order: toOrderSummary(order) };
  if (!order.razorpay_order_id) throw new AppError("This order has no payment to verify.", CONFLICT);

  if (!razorpayService.verifyPaymentSignature({ orderId: order.razorpay_order_id, paymentId, signature })) {
    throw new AppError("We could not verify this payment.", BAD_REQUEST, { code: ERROR_CODES.PAYMENT_SIGNATURE_INVALID });
  }

  const payment = await razorpayService.fetchPayment(paymentId);
  if (payment.status !== PAYMENT_CAPTURED) {
    return { status: ORDER_STATUSES.PENDING, order: toOrderSummary(order) };
  }

  const { order: confirmed } = await confirmPayment({ orderId: order.id, payment });
  return { status: ORDER_STATUSES.PAID, order: toOrderSummary(confirmed) };
}

module.exports = {
  listPackages,
  getQuote,
  createOrder,
  verifyPayment,
  buildQuote,
  generateOrderNumber,
  startCheckout,
  toUserPackage,
};
