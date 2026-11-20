const { db } = require("../../../../config/db");

const ORDERS_TABLE = "subscription_orders";

function inRange(query, column, { from, to }) {
  if (from) query.where(column, ">=", from);
  if (to) query.where(column, "<", to);
  return query;
}

const countAs = (alias) => db.raw(`count(*)::int as ${alias}`);
const sumAs = (column, alias) => db.raw(`coalesce(sum(${column}), 0)::bigint as ${alias}`);

async function findPaidTotals(range) {
  return inRange(db(ORDERS_TABLE).where({ status: "paid" }), "paid_at", range).first(
    countAs("orders"),
    sumAs("base_amount", "base_amount"),
    sumAs("gst_amount", "gst_amount"),
    sumAs("total_amount", "total_amount")
  );
}

async function findRefundedTotals(range) {
  return inRange(db(ORDERS_TABLE).where({ status: "refunded" }), "paid_at", range).first(countAs("orders"), sumAs("total_amount", "total_amount"));
}

async function countOrdersByStatus(status, range) {
  const row = await inRange(db(ORDERS_TABLE).where({ status }), "created_at", range).first(countAs("orders"));
  return row.orders;
}

async function countActiveStandardUsers(now) {
  const row = await db("user_subscriptions as s")
    .join("subscription_packages as p", "p.id", "s.package_id")
    .where({ "p.code": "standard", "s.status": "active" })
    .andWhere("s.ends_at", ">", now)
    .first(db.raw("count(distinct s.user_id)::int as users"));
  return row.users;
}

async function countExhaustedFreeUsers() {
  const row = await db("user_subscriptions as s")
    .join("subscription_packages as p", "p.id", "s.package_id")
    .where({ "p.code": "free", "s.status": "exhausted" })
    .first(db.raw("count(distinct s.user_id)::int as users"));
  return row.users;
}

module.exports = {
  findPaidTotals,
  findRefundedTotals,
  countOrdersByStatus,
  countActiveStandardUsers,
  countExhaustedFreeUsers,
};
