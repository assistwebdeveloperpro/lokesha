const { db } = require("../../../config/db");

const TABLE = "users";

async function findPasswordById(userId) {
  return db(TABLE).where({ id: userId }).select("id", "password").first();
}

async function updatePassword(userId, passwordHash) {
  return db(TABLE).where({ id: userId }).update({
    password: passwordHash,
    updated_at: db.fn.now(),
  });
}

module.exports = { findPasswordById, updatePassword };
