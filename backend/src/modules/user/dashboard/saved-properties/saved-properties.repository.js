const { db } = require("../../../../config/db");

const TABLE = "saved_properties";
const PUBLISHED_STATUS = "published";

async function findPublishedProperty(propertyId) {
  return db("properties")
    .where({ id: propertyId, status: PUBLISHED_STATUS })
    .first("id", "user_id");
}

async function insertSaved(userId, propertyId) {
  return db(TABLE)
    .insert({ user_id: userId, property_id: propertyId })
    .onConflict(["user_id", "property_id"])
    .ignore();
}

async function deleteSaved(userId, propertyId) {
  return db(TABLE).where({ user_id: userId, property_id: propertyId }).del();
}

async function findSavedIds(userId) {
  const rows = await db(TABLE)
    .where({ user_id: userId })
    .select("property_id")
    .orderBy("created_at", "desc");

  return rows.map(({ property_id: id }) => id);
}

async function findSavedRows(userId, { page, limit }) {
  return db(`${TABLE} as s`)
    .join("properties as p", "p.id", "s.property_id")
    .where("s.user_id", userId)
    .select(
      "s.id",
      "s.property_id",
      "s.created_at",
      "p.status",
      "p.title",
      "p.listing_number",
      "p.listing_type",
      "p.property_type",
      "p.locality",
      "p.city"
    )
    .orderBy("s.created_at", "desc")
    .orderBy("s.id", "desc")
    .limit(limit)
    .offset((page - 1) * limit);
}

async function countSaved(userId) {
  const row = await db(TABLE).where({ user_id: userId }).count({ total: "id" }).first();
  return Number(row.total);
}

module.exports = {
  findPublishedProperty,
  insertSaved,
  deleteSaved,
  findSavedIds,
  findSavedRows,
  countSaved,
};
