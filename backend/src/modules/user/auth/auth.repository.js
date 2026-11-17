const { db } = require("../../../config/db");

const TABLE = "users";
const PENDING_TABLE = "pending_user_registrations";
const OTP_TABLE = "otp_verifications";

async function findUserByMobile(mobile_number) {
  return db(TABLE).where({ mobile_number }).first();
}

async function findUserByEmail(email) {
  return db(TABLE).where({ email }).first();
}

async function createUser({
  role,
  name,
  agency_name,
  company_name,
  email,
  mobile_number,
  agreed_to_terms,
}) {
  const [user] = await db(TABLE)
    .insert({
      role,
      name,
      agency_name: agency_name ?? null,
      company_name: company_name ?? null,
      email,
      mobile_number,
      agreed_to_terms,
    })
    .returning([
      "id",
      "role",
      "name",
      "agency_name",
      "company_name",
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

async function upsertPendingRegistration({
  mobile_number,
  name,
  email,
  agreed_to_terms,
  otpCode,
  otpExpiresAt,
}) {
  return db(PENDING_TABLE)
    .insert({
      mobile_number,
      name,
      email,
      agreed_to_terms,
      otp_code: otpCode,
      otp_expires_at: otpExpiresAt,
    })
    .onConflict("mobile_number")
    .merge({
      name,
      email,
      agreed_to_terms,
      otp_code: otpCode,
      otp_expires_at: otpExpiresAt,
      updated_at: db.fn.now(),
    });
}

async function findPendingRegistration(mobile_number) {
  return db(PENDING_TABLE).where({ mobile_number }).first();
}

async function deletePendingRegistration(mobile_number) {
  return db(PENDING_TABLE).where({ mobile_number }).del();
}

async function upsertMobileOtp({ mobile_number, otpCode, otpExpiresAt }) {
  return db(OTP_TABLE)
    .insert({ mobile_number, otp_code: otpCode, otp_expires_at: otpExpiresAt })
    .onConflict("mobile_number")
    .merge({
      otp_code: otpCode,
      otp_expires_at: otpExpiresAt,
      last_sent_at: db.fn.now(),
      updated_at: db.fn.now(),
    });
}

async function findMobileOtp(mobile_number) {
  return db(OTP_TABLE).where({ mobile_number }).first();
}

async function deleteMobileOtp(mobile_number) {
  return db(OTP_TABLE).where({ mobile_number }).del();
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
  upsertPendingRegistration,
  findPendingRegistration,
  deletePendingRegistration,
  upsertMobileOtp,
  findMobileOtp,
  deleteMobileOtp,
  findUserById,
};
