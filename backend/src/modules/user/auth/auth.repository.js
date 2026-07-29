const { db } = require("../../../config/db");

const TABLE = "users";

async function findUserByMobile(mobile_number) {
  return db(TABLE).where({ mobile_number }).first();
}

async function findUserByEmail(email) {
  return db(TABLE).where({ email }).first();
}

async function createUser({ role, name, email, passwordHash, mobile_number }) {
  const [user] = await db(TABLE)
    .insert({
      role,
      name,
      email,
      password: passwordHash,
      mobile_number,
    })
    .returning([
      "id",
      "role",
      "name",
      "email",
      "mobile_number",
      "created_at",
      "updated_at",
    ]);

  return user;
}

async function setOtp(mobile_number, otpCode, otpExpiresAt) {
  return db(TABLE).where({ mobile_number }).update({
    otp_code: otpCode,
    otp_expires_at: otpExpiresAt,
    updated_at: db.fn.now(),
  });
}

async function clearOtp(userId) {
  return db(TABLE).where({ id: userId }).update({
    otp_code: null,
    otp_expires_at: null,
    updated_at: db.fn.now(),
  });
}

async function getUserRoleAndOtp(mobile_number) {
  return db(TABLE)
    .where({ mobile_number })
    .select("id", "role", "name", "otp_code", "otp_expires_at")
    .first();
}

async function findUserById(id) {
  return db(TABLE)
    .where({ id })
    .select("id", "role", "name", "email", "mobile_number", "created_at", "updated_at")
    .first();
}

module.exports = {
  findUserByMobile,
  findUserByEmail,
  createUser,
  setOtp,
  clearOtp,
  getUserRoleAndOtp,
  findUserById,
};
