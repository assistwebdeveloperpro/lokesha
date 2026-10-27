const { db } = require("../../../../config/db");

const TABLE = "admin_notifications";
const COLUMNS = ["id", "type", "title", "message", "property_id", "read_at", "created_at"];

// trx is the caller's transaction, so a notification exists only if its cause was saved
async function insertNotification(trx, row) {
  await trx(TABLE).insert(row);
}

function applyStatus(query, status) {
  return status === "read" ? query.whereNotNull("read_at") : query.whereNull("read_at");
}

async function findAll({ status, page, limit }) {
  return applyStatus(db(TABLE), status)
    .select(COLUMNS)
    .orderBy("created_at", "desc")
    .orderBy("id", "desc")
    .limit(limit)
    .offset((page - 1) * limit);
}

async function countAll(status) {
  const [{ count }] = await applyStatus(db(TABLE), status).count("id as count");
  return Number(count);
}

// A read row keeps its first read time, so repeating the call changes nothing
async function markRead(id) {
  const [row] = await db(TABLE)
    .where({ id })
    .update({ read_at: db.raw("coalesce(read_at, now())") })
    .returning(["id", "read_at"]);
  return row;
}

async function markAllRead() {
  return db(TABLE).whereNull("read_at").update({ read_at: db.fn.now() });
}

module.exports = { insertNotification, findAll, countAll, markRead, markAllRead };
