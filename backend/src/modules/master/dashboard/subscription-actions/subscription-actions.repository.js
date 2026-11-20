const { db } = require("../../../../config/db");

const ACTIONS_TABLE = "subscription_admin_actions";
const SUBSCRIPTIONS_TABLE = "user_subscriptions";

const runInTransaction = (callback) => db.transaction(callback);

async function insertAction(trx, { adminId, userId, subscriptionId, orderId, type, reason, details }) {
  await trx(ACTIONS_TABLE).insert({
    admin_id: adminId,
    user_id: userId,
    subscription_id: subscriptionId ?? null,
    order_id: orderId ?? null,
    type,
    reason,
    details: JSON.stringify(details ?? {}),
  });
}

async function findActions(userId, { page, limit }) {
  return db(`${ACTIONS_TABLE} as a`)
    .leftJoin("admins as ad", "ad.id", "a.admin_id")
    .where("a.user_id", userId)
    .orderBy("a.created_at", "desc")
    .orderBy("a.id", "desc")
    .limit(limit)
    .offset((page - 1) * limit)
    .select("a.id", "a.type", "a.reason", "a.details", "a.subscription_id", "a.order_id", "a.created_at", "a.admin_id", "ad.name as admin_name");
}

async function countActions(userId) {
  const [{ count }] = await db(ACTIONS_TABLE).where({ user_id: userId }).count("id as count");
  return Number(count);
}

async function findUser(trx, id) {
  return trx("users").where({ id }).first("id", "role");
}

async function findOrder(id) {
  return db("subscription_orders").where({ id }).first();
}

// Taken before the subscription lock, the same order an approval uses, so the two can never wait on each other
async function lockSubscriptionProperties(trx, subscriptionId) {
  await trx("properties").where({ subscription_id: subscriptionId }).orderBy("id", "asc").forUpdate().select("id");
}

// Locks the row, so a purchase, an extension and a refund of one subscription run one after the other
async function findSubscriptionForUpdate(trx, id) {
  return trx(SUBSCRIPTIONS_TABLE).where({ id }).forUpdate().first();
}

async function findSubscriptionByOrderForUpdate(trx, orderId) {
  return trx(SUBSCRIPTIONS_TABLE).where({ order_id: orderId }).forUpdate().first();
}

// The reminders are cleared, so the new end date gets its own 7 day and last day notices
async function updateSubscriptionEnd(trx, id, endsAt) {
  await trx(SUBSCRIPTIONS_TABLE)
    .where({ id })
    .update({ ends_at: endsAt, reminder_7d_sent_at: null, reminder_1d_sent_at: null, updated_at: trx.fn.now() });
}

// Listings of a subscription are valid until its end date, so they move with it
async function extendPropertyExpiry(trx, subscriptionId, endsAt) {
  await trx("properties")
    .where({ subscription_id: subscriptionId })
    .whereNotNull("expires_at")
    .update({ expires_at: endsAt });
}

async function markSubscriptionRefunded(trx, id) {
  await trx(SUBSCRIPTIONS_TABLE).where({ id }).update({ status: "refunded", updated_at: trx.fn.now() });
}

module.exports = {
  runInTransaction,
  insertAction,
  findActions,
  countActions,
  findUser,
  findOrder,
  lockSubscriptionProperties,
  findSubscriptionForUpdate,
  findSubscriptionByOrderForUpdate,
  updateSubscriptionEnd,
  extendPropertyExpiry,
  markSubscriptionRefunded,
};
