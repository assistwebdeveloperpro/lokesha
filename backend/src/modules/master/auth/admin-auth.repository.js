const { db } = require("../../../config/db");

const TABLE = "admins";

async function findAdminByMobile(mobile_number) {
  return db(TABLE).where({ mobile_number }).first();
}

async function setOtp(mobile_number, otpCode, otpExpiresAt) {
  return db(TABLE).where({ mobile_number }).update({
    otp_code: otpCode,
    otp_expires_at: otpExpiresAt,
    updated_at: db.fn.now(),
  });
}

async function clearOtp(adminId) {
  return db(TABLE).where({ id: adminId }).update({
    otp_code: null,
    otp_expires_at: null,
    updated_at: db.fn.now(),
  });
}

async function getAdminAndOtp(mobile_number) {
  return db(TABLE)
    .where({ mobile_number })
    .select("id", "name", "otp_code", "otp_expires_at")
    .first();
}

async function findAdminById(id) {
  return db(TABLE)
    .where({ id })
    .select("id", "name", "mobile_number", "created_at", "updated_at")
    .first();
}

module.exports = {
  findAdminByMobile,
  setOtp,
  clearOtp,
  getAdminAndOtp,
  findAdminById,
};
