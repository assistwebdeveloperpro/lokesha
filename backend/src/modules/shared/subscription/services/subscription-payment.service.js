const { db } = require("../../../../config/db");
const orderRepository = require("../repositories/subscription-order.repository");
const subscriptionRepository = require("../repositories/subscription.repository");
const ledgerRepository = require("../repositories/subscription-ledger.repository");
const notificationRepository = require("../../../user/dashboard/user-notifications/user-notifications.repository");
const { paymentSuccess, paymentFailed } = require("../../../user/dashboard/user-notifications/user-notifications.templates");
const adminNotifications = require("../../../master/dashboard/admin-notifications/admin-notifications.service");
const { createInvoiceForOrder } = require("./invoice.service");
const { addMonths } = require("../utils/subscription-dates.util");
const { ORDER_STATUSES, SUBSCRIPTION_SOURCES, SUBSCRIPTION_STATUSES, LEDGER_TYPES, ERROR_CODES } = require("../constants/subscription.constants");
const { AppError } = require("../../property/utils/property.errors");

const PAYMENT_CAPTURED = "captured";
const CURRENCY = "INR";
const NOT_FOUND = 404;
const CONFLICT = 409;
const SETTLED_STATUSES = [ORDER_STATUSES.PAID, ORDER_STATUSES.REFUNDED];
const OPEN_STATUSES = [ORDER_STATUSES.CREATED, ORDER_STATUSES.PENDING];
const MAX_REASON_LENGTH = 255;

const findLockedOrder = (trx, { orderId, razorpayOrderId }) =>
  orderId
    ? orderRepository.findOrderByIdForUpdate(trx, orderId)
    : orderRepository.findOrderByRazorpayOrderIdForUpdate(trx, razorpayOrderId);

// The gateway's own record must match what we asked for, so a forged or altered payment is never accepted
function assertPaymentMatchesOrder(order, payment) {
  const matches =
    payment.status === PAYMENT_CAPTURED &&
    payment.order_id === order.razorpay_order_id &&
    payment.amount === order.total_amount &&
    payment.currency === CURRENCY;

  if (!matches) {
    throw new AppError("The payment does not match this order.", CONFLICT, { code: ERROR_CODES.PAYMENT_MISMATCH });
  }
}

// Safe to call any number of times for one order: the browser return, the webhook and the recovery job all land here
async function confirmPayment({ orderId, razorpayOrderId, payment }, now = new Date()) {
  return db.transaction(async (trx) => {
    const order = await findLockedOrder(trx, { orderId, razorpayOrderId });
    if (!order) {
      throw new AppError("Order not found", NOT_FOUND, { code: ERROR_CODES.ORDER_NOT_FOUND });
    }
    if (SETTLED_STATUSES.includes(order.status)) {
      return { order, subscription: null, alreadyPaid: true };
    }

    assertPaymentMatchesOrder(order, payment);

    const paidOrder = await orderRepository.updateOrder(trx, order.id, {
      status: ORDER_STATUSES.PAID,
      razorpay_payment_id: payment.id,
      failure_reason: null,
      paid_at: now,
    });

    const subscription = await subscriptionRepository.insertSubscription(trx, {
      user_id: order.user_id,
      package_id: order.package_id,
      source: SUBSCRIPTION_SOURCES.PURCHASE,
      order_id: order.id,
      total_credits: order.listings,
      lead_limit: null,
      property_validity_days: null,
      starts_at: now,
      ends_at: addMonths(now, order.months),
      status: SUBSCRIPTION_STATUSES.ACTIVE,
    });
    await ledgerRepository.insertEntry(trx, {
      subscriptionId: subscription.id,
      userId: order.user_id,
      type: LEDGER_TYPES.GRANTED,
      credits: order.listings,
      reason: `Order ${order.order_number}`,
    });
    const invoice = await createInvoiceForOrder(trx, { order: paidOrder, subscription, payment, issuedAt: now });

    await notificationRepository.insertNotification(
      trx,
      paymentSuccess({ userId: order.user_id, listings: order.listings, months: order.months })
    );
    await adminNotifications.notifySubscriptionPurchased(trx, {
      userId: order.user_id,
      listings: order.listings,
      months: order.months,
      orderNumber: order.order_number,
    });

    return { order: paidOrder, subscription, invoice, alreadyPaid: false };
  });
}

// A failed attempt never touches an order that is already paid; the user may retry on the same order
async function markPaymentFailed({ razorpayOrderId, reason }) {
  return db.transaction(async (trx) => {
    const order = await orderRepository.findOrderByRazorpayOrderIdForUpdate(trx, razorpayOrderId);
    if (!order || !OPEN_STATUSES.includes(order.status)) return null;

    const failedOrder = await orderRepository.updateOrder(trx, order.id, {
      status: ORDER_STATUSES.FAILED,
      failure_reason: reason ? String(reason).slice(0, MAX_REASON_LENGTH) : null,
    });
    await notificationRepository.insertNotification(trx, paymentFailed({ userId: order.user_id, orderNumber: order.order_number }));

    return failedOrder;
  });
}

module.exports = { confirmPayment, markPaymentFailed };
