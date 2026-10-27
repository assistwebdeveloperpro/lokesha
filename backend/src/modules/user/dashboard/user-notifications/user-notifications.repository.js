const { db } = require("../../../../config/db");

const TABLE = "property_status_notifications";
const COLUMNS = ["id", "type", "title", "message", "property_id", "read_at", "created_at"];

// trx is the caller's transaction, so a notification exists only if its cause was saved
async function insertNotification(trx, row) {
  await trx(TABLE).insert(row);
}

function applyStatus(query, status) {
  return status === "read" ? query.whereNotNull("read_at") : query.whereNull("read_at");
}

async function findByUser(userId, { status, page, limit }) {
  return applyStatus(db(TABLE).where({ user_id: userId }), status)
    .select(COLUMNS)
    .orderBy("created_at", "desc")
    .orderBy("id", "desc")
    .limit(limit)
    .offset((page - 1) * limit);
}

async function countByUser(userId, status) {
  const [{ count }] = await applyStatus(db(TABLE).where({ user_id: userId }), status).count("id as count");
  return Number(count);
}

// A read row keeps its first read time, so repeating the call changes nothing
async function markRead(id, userId) {
  const [row] = await db(TABLE)
    .where({ id, user_id: userId })
    .update({ read_at: db.raw("coalesce(read_at, now())") })
    .returning(["id", "read_at"]);
  return row;
}

async function markAllRead(userId) {
  return db(TABLE).where({ user_id: userId }).whereNull("read_at").update({ read_at: db.fn.now() });
}

module.exports = { insertNotification, findByUser, countByUser, markRead, markAllRead };
