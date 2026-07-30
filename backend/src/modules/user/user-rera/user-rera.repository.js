const { db } = require("../../../config/db");

const TABLE = "user_rera_details";

async function findAllByUserId(userId) {
  return db(TABLE).where({ user_id: userId }).orderBy("created_at", "asc");
}

async function findByIdForUser(id, userId) {
  return db(TABLE).where({ id, user_id: userId }).first();
}

async function findByUserIdAndState(userId, state, excludeId) {
  const query = db(TABLE).where({ user_id: userId, state });
  if (excludeId) {
    query.whereNot({ id: excludeId });
  }
  return query.first();
}

async function create(userId, data) {
  const [reraDetail] = await db(TABLE)
    .insert({ user_id: userId, ...data })
    .returning("*");
  return reraDetail;
}

async function update(id, data) {
  const [reraDetail] = await db(TABLE)
    .where({ id })
    .update({ ...data, updated_at: db.fn.now() })
    .returning("*");
  return reraDetail;
}

async function remove(id, userId) {
  return db(TABLE).where({ id, user_id: userId }).del();
}

module.exports = {
  findAllByUserId,
  findByIdForUser,
  findByUserIdAndState,
  create,
  update,
  remove,
};
