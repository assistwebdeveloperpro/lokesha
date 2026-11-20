const { db } = require("../../../../config/db");
const { toContainsPattern } = require("../../../shared/subscription/utils/search.util");

const STAFF_ROLE = "lokesha_staff";

const subscriptionTotals = () =>
  db("user_subscriptions as s")
    .join("subscription_packages as p", "p.id", "s.package_id")
    .groupBy("s.user_id")
    .select(
      "s.user_id",
      db.raw("sum(s.total_credits)::int as credits_bought"),
      db.raw("sum(s.used_credits)::int as credits_used"),
      db.raw("min(s.starts_at) as first_start"),
      db.raw("max(s.ends_at) as last_end"),
      db.raw("bool_or(s.status = 'active' and (s.ends_at is null or s.ends_at > now())) as has_active"),
      db.raw("array_agg(distinct p.code) as package_codes"),
      db.raw("array_agg(distinct s.status) as statuses")
    );

const paidTotals = () =>
  db("subscription_orders").where({ status: "paid" }).groupBy("user_id").select("user_id", db.raw("sum(total_amount)::bigint as amount_paid"));

const latestOrders = () =>
  db("subscription_orders").distinctOn("user_id").orderBy([{ column: "user_id" }, { column: "created_at", order: "desc" }]).select("user_id", "status");

function listQuery({ search, package: packageCode, status }) {
  const query = db("users as u")
    .join(subscriptionTotals().as("t"), "t.user_id", "u.id")
    .leftJoin(paidTotals().as("pt"), "pt.user_id", "u.id")
    .leftJoin(latestOrders().as("lo"), "lo.user_id", "u.id")
    .whereNot("u.role", STAFF_ROLE);

  if (packageCode) query.whereRaw("? = any(t.package_codes)", [packageCode]);
  if (status === "active") query.where("t.has_active", true);
  else if (status) query.whereRaw("? = any(t.statuses)", [status]);

  if (search) {
    const pattern = toContainsPattern(search);
    query.where((builder) => builder.where("u.name", "ilike", pattern).orWhere("u.mobile_number", "ilike", pattern));
  }

  return query;
}

async function findUsers(filters) {
  const { page, limit } = filters;

  return listQuery(filters)
    .orderBy("t.first_start", "desc")
    .orderBy("u.id", "asc")
    .limit(limit)
    .offset((page - 1) * limit)
    .select(
      "u.id",
      "u.name",
      "u.mobile_number",
      "u.email",
      "t.credits_bought",
      "t.credits_used",
      "t.first_start",
      "t.last_end",
      "t.has_active",
      "t.package_codes",
      "pt.amount_paid",
      "lo.status as payment_status"
    );
}

async function countUsers(filters) {
  const [{ count }] = await listQuery(filters).count("u.id as count");
  return Number(count);
}

async function findUser(id) {
  return db("users").where({ id }).first("id", "name", "email", "mobile_number", "role", "created_at");
}

module.exports = { buildUsersQuery: listQuery, findUsers, countUsers, findUser };
