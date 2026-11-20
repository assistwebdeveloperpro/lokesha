const { db } = require("../../../../config/db");

const ORDERS_TABLE = "subscription_orders";
const SETTINGS_TABLE = "subscription_settings";
const DEFAULT_RECOVERY_MINUTES = 30;

async function findRecoveryMinutes() {
  const settings = await db(SETTINGS_TABLE).where({ id: 1 }).first("pending_recovery_minutes");
  return settings?.pending_recovery_minutes ?? DEFAULT_RECOVERY_MINUTES;
}

// A failed order is included, since a retry inside the payment window can still succeed on it
async function findRecoverableOrders({ olderThan, newerThan, limit }) {
  return db(ORDERS_TABLE)
    .whereIn("status", ["created", "pending", "failed"])
    .whereNotNull("razorpay_order_id")
    .andWhere("created_at", "<=", olderThan)
    .andWhere("created_at", ">", newerThan)
    .orderBy("created_at", "asc")
    .limit(limit)
    .select("id", "razorpay_order_id");
}

async function findAbandonedOrders(cutoff, limit) {
  return db(ORDERS_TABLE)
    .whereIn("status", ["created", "pending"])
    .andWhere("created_at", "<=", cutoff)
    .orderBy("created_at", "asc")
    .limit(limit)
    .select("id", "razorpay_order_id");
}

// Only an order that is still open is cancelled, a payment confirmed meanwhile is never touched
async function cancelOrderIfOpen(id, reason) {
  return db(ORDERS_TABLE)
    .where({ id })
    .whereIn("status", ["created", "pending"])
    .update({ status: "cancelled", failure_reason: reason, updated_at: db.fn.now() });
}

module.exports = { findRecoveryMinutes, findRecoverableOrders, findAbandonedOrders, cancelOrderIfOpen };
