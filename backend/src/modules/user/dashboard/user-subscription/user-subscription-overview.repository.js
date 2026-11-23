const { db } = require("../../../../config/db");
const subscriptionRepository = require("../../../shared/subscription/repositories/subscription.repository");

const SUBSCRIPTION_COLUMNS = [
  "s.id",
  "s.source",
  "s.status",
  "s.total_credits",
  "s.used_credits",
  "s.lead_limit",
  "s.starts_at",
  "s.ends_at",
  "s.created_at",
  "p.code as package_code",
  "p.name as package_name",
];

const paginate = (query, { page, limit }) => query.limit(limit).offset((page - 1) * limit);

const countOf = async (query) => {
  const [{ count }] = await query.count("* as count");
  return Number(count);
};

// Active, not past its end date and still holding credits, Free (no end date) first
async function findCurrentSubscriptions(userId, now) {
  return db("user_subscriptions as s")
    .join("subscription_packages as p", "p.id", "s.package_id")
    .where({ "s.user_id": userId, "s.status": "active" })
    .andWhere((builder) => builder.whereNull("s.ends_at").orWhere("s.ends_at", ">", now))
    .orderByRaw("s.ends_at asc nulls first")
    .orderBy("s.created_at", "asc")
    .select(SUBSCRIPTION_COLUMNS);
}

const countReservedProperties = (userId, now) => subscriptionRepository.countReservedProperties(db, userId, now);

async function hasAnySubscription(userId) {
  return Boolean(await db("user_subscriptions").where({ user_id: userId }).first("id"));
}

async function findLatestOrder(userId) {
  return db("subscription_orders").where({ user_id: userId }).orderBy("created_at", "desc").first("id", "order_number", "status", "created_at");
}

const historyQuery = (userId) =>
  db("user_subscriptions as s").join("subscription_packages as p", "p.id", "s.package_id").where("s.user_id", userId);

async function findSubscriptionHistory(userId, paging) {
  return paginate(historyQuery(userId).orderBy("s.created_at", "desc").orderBy("s.id", "desc"), paging).select(SUBSCRIPTION_COLUMNS);
}

const countSubscriptionHistory = (userId) => countOf(historyQuery(userId));

// The invoice id lets a paid order link straight to its download
async function findOrders(userId, paging) {
  return paginate(
    db("subscription_orders as o")
      .leftJoin("subscription_invoices as i", function joinInvoice() {
        this.on("i.order_id", "o.id").andOn("i.type", db.raw("?", ["invoice"]));
      })
      .where("o.user_id", userId)
      .orderBy("o.created_at", "desc")
      .orderBy("o.id", "desc"),
    paging
  ).select(
    "o.id",
    "o.order_number",
    "o.status",
    "o.listings",
    "o.months",
    "o.price_per_listing_month",
    "o.gst_percent",
    "o.base_amount",
    "o.gst_amount",
    "o.total_amount",
    "o.failure_reason",
    "o.paid_at",
    "o.created_at",
    "i.id as invoice_id",
    "i.invoice_number"
  );
}

const countOrders = (userId) => countOf(db("subscription_orders").where({ user_id: userId }));

const ledgerQuery = (userId) =>
  db("subscription_credit_ledger as l").leftJoin("properties as p", "p.id", "l.property_id").where("l.user_id", userId);

async function findLedger(userId, paging) {
  return paginate(ledgerQuery(userId).orderBy("l.created_at", "desc").orderBy("l.id", "desc"), paging).select(
    "l.id",
    "l.type",
    "l.credits",
    "l.reason",
    "l.created_at",
    "l.property_id",
    "p.title as property_title",
    "p.listing_number"
  );
}

const countLedger = (userId) => countOf(ledgerQuery(userId));

// Properties that used a credit, with how many leads were sent to the lister
const leadUsageQuery = (userId) =>
  db("properties as p").where("p.user_id", userId).whereNotNull("p.credit_consumed_at");

async function findPropertyLeadUsage(userId, paging) {
  return paginate(leadUsageQuery(userId).orderBy("p.credit_consumed_at", "desc").orderBy("p.id", "desc"), paging).select(
    "p.id",
    "p.title",
    "p.listing_number",
    "p.status",
    "p.lead_limit",
    "p.expires_at",
    db("property_leads")
      .whereRaw("property_leads.property_id = p.id")
      .where("property_leads.distribution_status", "sent")
      .count("*")
      .as("leads_count")
  );
}

const countPropertyLeadUsage = (userId) => countOf(leadUsageQuery(userId));

module.exports = {
  findCurrentSubscriptions,
  countReservedProperties,
  hasAnySubscription,
  findLatestOrder,
  findSubscriptionHistory,
  countSubscriptionHistory,
  findOrders,
  countOrders,
  findLedger,
  countLedger,
  findPropertyLeadUsage,
  countPropertyLeadUsage,
};
