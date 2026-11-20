const recoveryRepository = require("../repositories/subscription-recovery.repository");
const { razorpayService } = require("./razorpay.service");
const { confirmPayment } = require("./subscription-payment.service");

const BATCH_SIZE = 50;
const MINUTE_MS = 60 * 1000;
const ABANDONED_AFTER_MS = 24 * 60 * MINUTE_MS;
const PAYMENT_CAPTURED = "captured";
const ABANDONED_REASON = "Payment was not completed";

// Asks the gateway whether the order was paid; true when a missed confirmation was applied now
async function recoverOrder(order) {
  const { items } = await razorpayService.fetchOrderPayments(order.razorpay_order_id);
  const captured = (items ?? []).find((payment) => payment.status === PAYMENT_CAPTURED);
  if (!captured) return false;

  await confirmPayment({ orderId: order.id, payment: captured });
  return true;
}

async function recoverEach(orders, label) {
  let recovered = 0;
  for (const order of orders) {
    try {
      if (await recoverOrder(order)) recovered += 1;
    } catch (error) {
      console.error(`Payment recovery failed for ${label} ${order.id}:`, error.message);
    }
  }
  return recovered;
}

// An unconfirmed order is only cancelled after the gateway shows no captured payment; if it cannot be reached the order stays
async function cancelAbandoned(orders) {
  let cancelled = 0;
  for (const order of orders) {
    try {
      if (order.razorpay_order_id && (await recoverOrder(order))) continue;
      if (await recoveryRepository.cancelOrderIfOpen(order.id, ABANDONED_REASON)) cancelled += 1;
    } catch (error) {
      console.error(`Abandoned order check failed for ${order.id}:`, error.message);
    }
  }
  return cancelled;
}

// Catches payments the webhook and the browser both missed, then closes orders nobody paid
async function recoverPendingPayments(now = new Date()) {
  const minutes = await recoveryRepository.findRecoveryMinutes();
  const olderThan = new Date(now.getTime() - minutes * MINUTE_MS);
  const abandonedBefore = new Date(now.getTime() - ABANDONED_AFTER_MS);

  const recoverable = await recoveryRepository.findRecoverableOrders({ olderThan, newerThan: abandonedBefore, limit: BATCH_SIZE });
  const recovered = await recoverEach(recoverable, "order");

  const abandoned = await recoveryRepository.findAbandonedOrders(abandonedBefore, BATCH_SIZE);
  const cancelled = await cancelAbandoned(abandoned);

  return { recovered, cancelled };
}

module.exports = { recoverPendingPayments };
