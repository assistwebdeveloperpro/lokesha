const { db } = require("../../../../config/db");

const TABLE = "recent_searches";
const MERGE_COLUMNS = ["search_criteria", "search_title", "search_subtitle", "search_url", "searched_at", "updated_at"];

function runInTransaction(callback) {
  return db.transaction(callback);
}

// Row lock serialises concurrent writes of the same user
async function lockUser(trx, userId) {
  return trx("users").where({ id: userId }).forUpdate().first("id");
}

async function upsertSearches(trx, rows) {
  return trx(TABLE)
    .insert(rows)
    .onConflict(["user_id", "criteria_hash"])
    .merge(MERGE_COLUMNS)
    .returning("*");
}

async function findExistingByHashes(trx, userId, hashes) {
  return trx(TABLE)
    .where({ user_id: userId })
    .whereIn("criteria_hash", hashes)
    .select("criteria_hash", "searched_at");
}

async function trimToLimit(trx, userId, limit) {
  const newestIds = trx(TABLE)
    .where({ user_id: userId })
    .orderBy("searched_at", "desc")
    .orderBy("id", "desc")
    .limit(limit)
    .select("id");

  return trx(TABLE).where({ user_id: userId }).whereNotIn("id", newestIds).del();
}

async function findSearches(userId, limit) {
  return db(TABLE)
    .where({ user_id: userId })
    .orderBy("searched_at", "desc")
    .orderBy("id", "desc")
    .limit(limit)
    .select("id", "search_criteria", "search_title", "search_subtitle", "search_url", "searched_at");
}

async function countSearches(userId) {
  const row = await db(TABLE).where({ user_id: userId }).count({ total: "id" }).first();
  return Number(row.total);
}

// Ownership is part of the query, so another user's id deletes nothing
async function deleteSearch(userId, id) {
  return db(TABLE).where({ id, user_id: userId }).del();
}

async function deleteAllSearches(userId) {
  return db(TABLE).where({ user_id: userId }).del();
}

module.exports = {
  runInTransaction,
  lockUser,
  upsertSearches,
  findExistingByHashes,
  trimToLimit,
  findSearches,
  countSearches,
  deleteSearch,
  deleteAllSearches,
};
