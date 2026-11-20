const PACKAGES_TABLE = "subscription_packages";
const SUBSCRIPTIONS_TABLE = "user_subscriptions";
const PROPERTIES_TABLE = "properties";

// trx is the caller's transaction, so a change exists only if its cause was saved
async function findActivePackageByCode(trx, code) {
  return trx(PACKAGES_TABLE).where({ code, status: "active" }).first();
}

async function findPackageByCode(trx, code) {
  return trx(PACKAGES_TABLE).where({ code }).first();
}

// A unique-index conflict (same mobile or user already has a Free package) inserts nothing
async function insertSubscriptionIfAbsent(trx, row) {
  const [subscription] = await trx(SUBSCRIPTIONS_TABLE).insert(row).onConflict().ignore().returning("*");
  return subscription ?? null;
}

async function insertSubscription(trx, row) {
  const [subscription] = await trx(SUBSCRIPTIONS_TABLE).insert(row).returning("*");
  return subscription;
}

// Free (no end date) comes first, then the one ending earliest, so no credit is wasted
function usableSubscriptions(trx, userId, now) {
  return trx(SUBSCRIPTIONS_TABLE)
    .where({ user_id: userId, status: "active" })
    .whereRaw("used_credits < total_credits")
    .andWhere((builder) => builder.whereNull("ends_at").orWhere("ends_at", ">", now))
    .orderByRaw("ends_at asc nulls first")
    .orderBy("created_at", "asc");
}

// Locks the rows, so two publishes of one user never spend the same credit
async function findUsableSubscriptionsForUpdate(trx, userId, now) {
  return usableSubscriptions(trx, userId, now).forUpdate();
}

async function incrementUsedCredits(trx, subscriptionId) {
  await trx(SUBSCRIPTIONS_TABLE)
    .where({ id: subscriptionId })
    .update({
      used_credits: trx.raw("used_credits + 1"),
      status: trx.raw("CASE WHEN used_credits + 1 >= total_credits THEN 'exhausted' ELSE status END"),
      updated_at: trx.fn.now(),
    });
}

async function findPropertyBillingState(trx, propertyId) {
  return trx(`${PROPERTIES_TABLE} as p`)
    .leftJoin("users as u", "u.id", "p.user_id")
    .where({ "p.id": propertyId })
    .first("p.id", "p.user_id", "p.credit_consumed_at", "p.expires_at", "u.role as owner_role");
}

async function markPropertyBilled(trx, propertyId, data) {
  await trx(PROPERTIES_TABLE)
    .where({ id: propertyId })
    .update({
      subscription_id: data.subscriptionId,
      credit_consumed_at: trx.fn.now(),
      expires_at: data.expiresAt,
      lead_limit: data.leadLimit,
    });
}

// A pending listing that still needs a credit (never charged, or its validity ended) holds one
async function countReservedProperties(trx, userId, now) {
  const [{ count }] = await trx(PROPERTIES_TABLE)
    .where({ user_id: userId, status: "pending" })
    .andWhere((builder) => builder.whereNull("credit_consumed_at").orWhere("expires_at", "<=", now))
    .count("id as count");
  return Number(count);
}

// Locks the property, so two enquiries never take the last free lead slot together
async function findLeadLimitForUpdate(trx, propertyId) {
  const property = await trx(PROPERTIES_TABLE).where({ id: propertyId }).forNoKeyUpdate().first("lead_limit");
  return property?.lead_limit ?? null;
}

async function countPropertyLeads(trx, propertyId) {
  const [{ count }] = await trx("property_leads").where({ property_id: propertyId }).count("id as count");
  return Number(count);
}

module.exports = {
  findPackageByCode,
  findLeadLimitForUpdate,
  countPropertyLeads,
  findActivePackageByCode,
  insertSubscriptionIfAbsent,
  insertSubscription,
  findUsableSubscriptionsForUpdate,
  incrementUsedCredits,
  findPropertyBillingState,
  markPropertyBilled,
  countReservedProperties,
};
