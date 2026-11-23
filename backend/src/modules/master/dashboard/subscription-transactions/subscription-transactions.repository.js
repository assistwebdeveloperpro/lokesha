const { db } = require("../../../../config/db");
const { toContainsPattern } = require("../../../shared/subscription/utils/search.util");

const COLUMNS = [
  "o.id",
  "o.order_number",
  "o.order_type",
  "o.listings",
  "o.months",
  "o.price_per_listing_month",
  "o.leads",
  "o.price_per_lead",
  "o.gst_percent",
  "o.base_amount",
  "o.gst_amount",
  "o.total_amount",
  "o.status",
  "o.razorpay_order_id",
  "o.razorpay_payment_id",
  "o.failure_reason",
  "o.paid_at",
  "o.refunded_at",
  "o.created_at",
  "o.user_gstin",
  "u.id as user_id",
  "u.name as user_name",
  "u.mobile_number as user_mobile",
  "p.name as package_name",
  "pr.title as property_title",
  "pr.listing_number as property_listing_number",
  "i.id as invoice_id",
  "i.invoice_number",
  "c.id as credit_note_id",
  "c.invoice_number as credit_note_number",
];

function buildTransactionsQuery({ search, status, from, to, userId }) {
  const query = db("subscription_orders as o")
    .join("users as u", "u.id", "o.user_id")
    .join("subscription_packages as p", "p.id", "o.package_id")
    .leftJoin("properties as pr", "pr.id", "o.property_id")
    .leftJoin("subscription_invoices as i", function joinInvoice() {
      this.on("i.order_id", "o.id").andOn("i.type", db.raw("?", ["invoice"]));
    })
    .leftJoin("subscription_invoices as c", function joinCreditNote() {
      this.on("c.order_id", "o.id").andOn("c.type", db.raw("?", ["credit_note"]));
    });

  if (status) query.where("o.status", status);
  if (userId) query.where("o.user_id", userId);
  if (from) query.where("o.created_at", ">=", from);
  if (to) query.where("o.created_at", "<", to);

  if (search) {
    const pattern = toContainsPattern(search);
    query.where((builder) => {
      builder
        .where("o.order_number", "ilike", pattern)
        .orWhere("u.name", "ilike", pattern)
        .orWhere("u.mobile_number", "ilike", pattern)
        .orWhere("o.razorpay_order_id", "ilike", pattern)
        .orWhere("o.razorpay_payment_id", "ilike", pattern);
    });
  }

  return query;
}

const newestFirst = (query) => query.orderBy("o.created_at", "desc").orderBy("o.id", "desc").select(COLUMNS);

async function findTransactions(filters) {
  const { page, limit } = filters;
  return newestFirst(buildTransactionsQuery(filters)).limit(limit).offset((page - 1) * limit);
}

async function countTransactions(filters) {
  const [{ count }] = await buildTransactionsQuery(filters).count("o.id as count");
  return Number(count);
}

// The export is capped by the caller, so one request can never read the whole table
async function findTransactionsForExport(filters, limit) {
  return newestFirst(buildTransactionsQuery(filters)).limit(limit);
}

module.exports = { buildTransactionsQuery, findTransactions, countTransactions, findTransactionsForExport };
