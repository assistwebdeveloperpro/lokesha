const { db } = require("../../../config/db");

const TABLE = "user_saved_messages";

async function findAllByUserId(userId) {
  return db(TABLE).where({ user_id: userId });
}

async function upsertMessage(userId, category, message) {
  const existing = await db(TABLE).where({ user_id: userId, category }).first();

  if (existing) {
    const [savedMessage] = await db(TABLE)
      .where({ id: existing.id })
      .update({ message, updated_at: db.fn.now() })
      .returning("*");
    return savedMessage;
  }

  const [savedMessage] = await db(TABLE)
    .insert({ user_id: userId, category, message })
    .returning("*");
  return savedMessage;
}

async function deleteMessage(userId, category) {
  return db(TABLE).where({ user_id: userId, category }).del();
}

module.exports = { findAllByUserId, upsertMessage, deleteMessage };
