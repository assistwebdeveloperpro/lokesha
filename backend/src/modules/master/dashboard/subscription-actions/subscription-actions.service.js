const repository = require("./subscription-actions.repository");
const subscriptionRepository = require("../../../shared/subscription/repositories/subscription.repository");
const orderRepository = require("../../../shared/subscription/repositories/subscription-order.repository");
const ledgerRepository = require("../../../shared/subscription/repositories/subscription-ledger.repository");
const notificationRepository = require("../../../user/dashboard/user-notifications/user-notifications.repository");
const { creditsAdded, subscriptionExtended, refundIssued } = require("../../../user/dashboard/user-notifications/user-notifications.templates");
const { razorpayService } = require("../../../shared/subscription/services/razorpay.service");
const { createCreditNoteForOrder } = require("../../../shared/subscription/services/invoice.service");
const { addMonths } = require("../../../shared/subscription/utils/subscription-dates.util");
const { toGatewayAmount } = require("../../../shared/subscription/utils/subscription-pricing.util");
const {
  PACKAGE_CODES,
  SUBSCRIPTION_SOURCES,
  SUBSCRIPTION_STATUSES,
  ORDER_STATUSES,
  LEDGER_TYPES,
} = require("../../../shared/subscription/constants/subscription.constants");
const { AppError } = require("../../../shared/property/utils/property.errors");

const NOT_FOUND = 404;
const CONFLICT = 409;
const STAFF_ROLE = "lokesha_staff";
const ACTION_TYPES = { GIFT: "gift_credits", EXTEND: "extend", REFUND: "refund" };

// Adds credits as a separate subscription with its own end date, so it follows the same rules as a purchase
async function giftCredits(admin, { userId, credits, months, reason }, now = new Date()) {
  return repository.runInTransaction(async (trx) => {
    const user = await repository.findUser(trx, userId);
    if (!user) throw new AppError("User not found", NOT_FOUND);
    if (user.role === STAFF_ROLE) throw new AppError("Lokesha staff are not limited by packages, so they need no credits.", CONFLICT);

    const standardPackage = await subscriptionRepository.findPackageByCode(trx, PACKAGE_CODES.STANDARD);
    if (!standardPackage) throw new AppError("The Standard package is not set up.", CONFLICT);

    const endsAt = addMonths(now, months);
    const subscription = await subscriptionRepository.insertSubscription(trx, {
      user_id: userId,
      package_id: standardPackage.id,
      source: SUBSCRIPTION_SOURCES.ADMIN_GIFT,
      total_credits: credits,
      lead_limit: null,
      property_validity_days: null,
      starts_at: now,
      ends_at: endsAt,
      status: SUBSCRIPTION_STATUSES.ACTIVE,
    });
    await ledgerRepository.insertEntry(trx, {
      subscriptionId: subscription.id,
      userId,
      type: LEDGER_TYPES.ADMIN_ADDED,
      credits,
      reason,
      adminId: admin.id,
    });
    await repository.insertAction(trx, {
      adminId: admin.id,
      userId,
      subscriptionId: subscription.id,
      type: ACTION_TYPES.GIFT,
      reason,
      details: { credits, months, endsAt },
    });
    await notificationRepository.insertNotification(trx, creditsAdded({ userId, credits, endsAt }));

    return { subscriptionId: subscription.id, credits, endsAt };
  });
}

async function extendSubscription(admin, { subscriptionId, months, reason }, now = new Date()) {
  return repository.runInTransaction(async (trx) => {
    // Properties first, then the subscription: the order an approval locks them in
    await repository.lockSubscriptionProperties(trx, subscriptionId);
    const subscription = await repository.findSubscriptionForUpdate(trx, subscriptionId);
    if (!subscription) throw new AppError("Subscription not found", NOT_FOUND);

    const isRunning =
      subscription.status === SUBSCRIPTION_STATUSES.ACTIVE && subscription.ends_at && new Date(subscription.ends_at) > now;
    if (!isRunning) {
      throw new AppError("Only a running subscription with an end date can be extended. Add credits instead.", CONFLICT);
    }

    const previousEndsAt = new Date(subscription.ends_at);
    const endsAt = addMonths(previousEndsAt, months);
    await repository.updateSubscriptionEnd(trx, subscriptionId, endsAt);
    await repository.extendPropertyExpiry(trx, subscriptionId, endsAt);
    await repository.insertAction(trx, {
      adminId: admin.id,
      userId: subscription.user_id,
      subscriptionId,
      type: ACTION_TYPES.EXTEND,
      reason,
      details: { months, previousEndsAt, endsAt },
    });
    await notificationRepository.insertNotification(trx, subscriptionExtended({ userId: subscription.user_id, endsAt }));

    return { subscriptionId, previousEndsAt, endsAt };
  });
}

// The gateway is asked first and only if the payment is not already refunded, so a retry after a failure is safe
async function refundAtGateway(order, reason) {
  const payment = await razorpayService.fetchPayment(order.razorpay_payment_id);
  const isRefunded = payment.status === "refunded" || (payment.amount_refunded ?? 0) >= payment.amount;
  if (isRefunded) return;

  await razorpayService.refundPayment(order.razorpay_payment_id, {
    amount: toGatewayAmount(order.total_amount),
    notes: { orderNumber: order.order_number, reason },
  });
}

function assertRefundable(order) {
  if (order.status === ORDER_STATUSES.REFUNDED) throw new AppError("This order is already refunded.", CONFLICT);
  if (order.status !== ORDER_STATUSES.PAID || !order.razorpay_payment_id) {
    throw new AppError("Only a paid order can be refunded.", CONFLICT);
  }
}

// Unused credits are cancelled, used ones stay with the properties; closing those is the admin's separate choice
async function refundOrder(admin, { orderId, reason }, now = new Date()) {
  const order = await repository.findOrder(orderId);
  if (!order) throw new AppError("Order not found", NOT_FOUND);
  assertRefundable(order);

  await refundAtGateway(order, reason);

  return repository.runInTransaction(async (trx) => {
    const locked = await orderRepository.findOrderByIdForUpdate(trx, orderId);
    // A parallel refund that finished while this one waited leaves nothing to do
    if (locked.status === ORDER_STATUSES.REFUNDED) return { orderId, status: ORDER_STATUSES.REFUNDED, cancelledCredits: 0, creditNote: null };
    assertRefundable(locked);

    const refunded = await orderRepository.updateOrder(trx, orderId, { status: ORDER_STATUSES.REFUNDED, refunded_at: now });

    let cancelledCredits = 0;
    const subscription = await repository.findSubscriptionByOrderForUpdate(trx, orderId);
    if (subscription) {
      cancelledCredits = Math.max(0, subscription.total_credits - subscription.used_credits);
      await repository.markSubscriptionRefunded(trx, subscription.id);
      if (cancelledCredits > 0) {
        await ledgerRepository.insertEntry(trx, {
          subscriptionId: subscription.id,
          userId: refunded.user_id,
          type: LEDGER_TYPES.CANCELLED,
          credits: -cancelledCredits,
          reason: `Refund of order ${refunded.order_number}`,
          adminId: admin.id,
        });
      }
    }

    const creditNote = await createCreditNoteForOrder(trx, { order: refunded, issuedAt: now });
    await repository.insertAction(trx, {
      adminId: admin.id,
      userId: refunded.user_id,
      subscriptionId: subscription?.id,
      orderId,
      type: ACTION_TYPES.REFUND,
      reason,
      details: {
        amount: refunded.total_amount,
        razorpayPaymentId: refunded.razorpay_payment_id,
        cancelledCredits,
        creditNoteNumber: creditNote?.invoice_number ?? null,
      },
    });
    await notificationRepository.insertNotification(trx, refundIssued({ userId: refunded.user_id, orderNumber: refunded.order_number }));

    return {
      orderId,
      status: ORDER_STATUSES.REFUNDED,
      cancelledCredits,
      creditNote: creditNote ? { id: creditNote.id, number: creditNote.invoice_number } : null,
    };
  });
}

const toAction = (row) => ({
  id: row.id,
  type: row.type,
  reason: row.reason,
  details: row.details,
  subscriptionId: row.subscription_id,
  orderId: row.order_id,
  admin: row.admin_id ? { id: row.admin_id, name: row.admin_name } : null,
  createdAt: row.created_at,
});

async function listActions(userId, { page, limit }) {
  const [rows, total] = await Promise.all([repository.findActions(userId, { page, limit }), repository.countActions(userId)]);
  return { items: rows.map(toAction), page, limit, total };
}

module.exports = { giftCredits, extendSubscription, refundOrder, listActions };
