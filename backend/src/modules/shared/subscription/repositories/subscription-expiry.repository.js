const { db } = require("../../../../config/db");

const SUBSCRIPTIONS_TABLE = "user_subscriptions";
const PROPERTIES_TABLE = "properties";

async function findExpiredSubscriptionIds(now, limit) {
  return db(SUBSCRIPTIONS_TABLE)
    .where({ status: "active" })
    .whereNotNull("ends_at")
    .andWhere("ends_at", "<=", now)
    .orderBy("ends_at", "asc")
    .limit(limit)
    .pluck("id");
}


async function lockExpiredSubscription(trx, id, now) {
  return trx(SUBSCRIPTIONS_TABLE)
    .where({ id, status: "active" })
    .andWhere("ends_at", "<=", now)
    .forUpdate()
    .skipLocked()
    .first("id", "user_id", "total_credits", "used_credits");
}

async function markSubscriptionExpired(trx, id) {
  await trx(SUBSCRIPTIONS_TABLE).where({ id }).update({ status: "expired", updated_at: trx.fn.now() });
}

async function findLivePropertiesOfSubscription(trx, subscriptionId) {
  return trx(PROPERTIES_TABLE).where({ subscription_id: subscriptionId, status: "published" }).forUpdate().select("id", "user_id", "title");
}

async function findExpiredPropertyIds(now, limit) {
  return db(PROPERTIES_TABLE)
    .where({ status: "published" })
    .whereNotNull("expires_at")
    .andWhere("expires_at", "<=", now)
    .orderBy("expires_at", "asc")
    .limit(limit)
    .pluck("id");
}


async function lockExpiredProperty(trx, id, now) {
  return trx(`${PROPERTIES_TABLE} as p`)
    .leftJoin(`${SUBSCRIPTIONS_TABLE} as s`, "s.id", "p.subscription_id")
    .where({ "p.id": id, "p.status": "published" })
    .andWhere("p.expires_at", "<=", now)
    .forUpdate("p")
    .skipLocked()
    .first("p.id", "p.user_id", "p.title", "s.ends_at as subscription_ends_at");
}

async function findDueReminderIds(now, windowEnd, limit) {
  return db(SUBSCRIPTIONS_TABLE)
    .where({ status: "active" })
    .andWhere("ends_at", ">", now)
    .andWhere("ends_at", "<=", windowEnd)
    .andWhere((builder) => builder.whereNull("reminder_7d_sent_at").orWhereNull("reminder_1d_sent_at"))
    .orderBy("ends_at", "asc")
    .limit(limit)
    .pluck("id");
}

async function lockSubscriptionForReminder(trx, id) {
  return trx(SUBSCRIPTIONS_TABLE)
    .where({ id, status: "active" })
    .forUpdate()
    .skipLocked()
    .first("id", "user_id", "ends_at", "reminder_7d_sent_at", "reminder_1d_sent_at");
}

async function markRemindersSent(trx, id, { sevenDay, oneDay }) {
  const sentAt = trx.fn.now();
  await trx(SUBSCRIPTIONS_TABLE)
    .where({ id })
    .update({
      ...(sevenDay ? { reminder_7d_sent_at: sentAt } : {}),
      ...(oneDay ? { reminder_1d_sent_at: sentAt } : {}),
      updated_at: sentAt,
    });
}

module.exports = {
  findExpiredSubscriptionIds,
  lockExpiredSubscription,
  markSubscriptionExpired,
  findLivePropertiesOfSubscription,
  findExpiredPropertyIds,
  lockExpiredProperty,
  findDueReminderIds,
  lockSubscriptionForReminder,
  markRemindersSent,
};
