const repository = require("./admin-auth.repository");
const { generateOtp, getOtpExpiry, OTP_EXPIRY_SECONDS } = require("../../../utils/otp");
const { signToken } = require("../../../utils/jwt");
const { AppError } = require("../../user/auth/auth.service");

const NOT_REGISTERED_MESSAGE = "This mobile number is not registered with an admin account. Please check your number and try again.";

async function login({ mobile_number }) {
  const admin = await repository.findAdminByMobile(mobile_number);

  if (!admin) {
    throw new AppError(NOT_REGISTERED_MESSAGE, 404);
  }

  const otpCode = generateOtp();
  const otpExpiresAt = getOtpExpiry();
  await repository.setOtp(mobile_number, otpCode, otpExpiresAt);

  return { message: "OTP sent successfully.", otp_expires_in: OTP_EXPIRY_SECONDS };
}

async function verifyOtp({ mobile_number, otp }) {
  const admin = await repository.getAdminAndOtp(mobile_number);

  const isExpired =
    !admin || !admin.otp_expires_at || new Date(admin.otp_expires_at) < new Date();

  if (!admin || !admin.otp_code || admin.otp_code !== otp || isExpired) {
    throw new AppError("Invalid or expired OTP", 400);
  }

  await repository.clearOtp(admin.id);

  const token = signToken({ id: admin.id, role: "admin", type: "admin" });

  return { token, name: admin.name };
}

async function getMe(adminId) {
  const admin = await repository.findAdminById(adminId);

  if (!admin) {
    throw new AppError("Admin not found", 404);
  }

  return admin;
}

module.exports = { login, verifyOtp, getMe };
