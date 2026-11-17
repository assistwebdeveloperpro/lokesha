const { db } = require("../../../../config/db");

const TABLE = "recently_viewed_properties";
const PUBLISHED_STATUS = "published";

function runInTransaction(callback) {
  return db.transaction(callback);
}

async function findPublishedProperty(propertyId) {
  return db("properties")
    .where({ id: propertyId, status: PUBLISHED_STATUS })
    .first("id", "user_id");
}

async function findPublishedProperties(propertyIds) {
  return db("properties")
    .where({ status: PUBLISHED_STATUS })
    .whereIn("id", propertyIds)
    .select("id", "user_id");
}

// Row lock serialises concurrent writes of the same user
async function lockUser(trx, userId) {
  return trx("users").where({ id: userId }).forUpdate().first("id");
}

async function findExistingViews(trx, userId, propertyIds) {
  return trx(TABLE)
    .where({ user_id: userId })
    .whereIn("property_id", propertyIds)
    .select("property_id", "viewed_at");
}

async function upsertViews(trx, rows) {
  return trx(TABLE)
    .insert(rows)
    .onConflict(["user_id", "property_id"])
    .merge(["viewed_at", "updated_at"]);
}

async function trimToLimit(trx, userId, limit) {
  const newestIds = trx(TABLE)
    .where({ user_id: userId })
    .orderBy("viewed_at", "desc")
    .orderBy("id", "desc")
    .limit(limit)
    .select("id");

  return trx(TABLE).where({ user_id: userId }).whereNotIn("id", newestIds).del();
}

function publishedViewsQuery(userId) {
  return db(`${TABLE} as r`)
    .join("properties as p", "p.id", "r.property_id")
    .where({ "r.user_id": userId, "p.status": PUBLISHED_STATUS });
}

async function findViewedRows(userId, { page, limit }) {
  return publishedViewsQuery(userId)
    .select(
      "r.id",
      "r.property_id",
      "r.viewed_at",
      "p.status",
      "p.title",
      "p.listing_number",
      "p.listing_type",
      "p.property_type",
      "p.locality",
      "p.city"
    )
    .orderBy("r.viewed_at", "desc")
    .orderBy("r.id", "desc")
    .limit(limit)
    .offset((page - 1) * limit);
}

async function countViewed(userId) {
  const row = await publishedViewsQuery(userId).count({ total: "r.id" }).first();
  return Number(row.total);
}

module.exports = {
  runInTransaction,
  findPublishedProperty,
  findPublishedProperties,
  lockUser,
  findExistingViews,
  upsertViews,
  trimToLimit,
  findViewedRows,
  countViewed,
};
