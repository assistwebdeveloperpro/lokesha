const repository = require("./auth.repository");
const { hashPassword } = require("../../../utils/bcrypt");
const { generateOtp, getOtpExpiry, OTP_EXPIRY_SECONDS } = require("../../../utils/otp");
const { signToken } = require("../../../utils/jwt");

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const NOT_REGISTERED_MESSAGE =
  "This mobile number isn't registered with us yet. Please sign up first.";

async function signup({ role, name, email, password, mobile_number }) {
  const existingEmail = await repository.findUserByEmail(email);
  if (existingEmail) {
    throw new AppError("Email is already registered", 409);
  }

  const existingMobile = await repository.findUserByMobile(mobile_number);
  if (existingMobile) {
    throw new AppError("Mobile number is already registered", 409);
  }

  const passwordHash = await hashPassword(password);

  const user = await repository.createUser({
    role,
    name,
    email,
    passwordHash,
    mobile_number,
  });

  return user;
}

async function login({ mobile_number }) {
  const user = await repository.findUserByMobile(mobile_number);

  if (!user) {
    throw new AppError(NOT_REGISTERED_MESSAGE, 404);
  }

  const otpCode = generateOtp();
  const otpExpiresAt = getOtpExpiry();
  await repository.setOtp(mobile_number, otpCode, otpExpiresAt);

  return { message: "OTP sent successfully.", otp_expires_in: OTP_EXPIRY_SECONDS };
}

async function verifyOtp({ mobile_number, otp }) {
  const user = await repository.getUserRoleAndOtp(mobile_number);

  if (!user) {
    throw new AppError(
      "No account found with this mobile number. Please register to continue.",
      404
    );
  }

  const isExpired =
    !user.otp_expires_at || new Date(user.otp_expires_at) < new Date();

  if (!user.otp_code || user.otp_code !== otp || isExpired) {
    throw new AppError("Invalid or expired OTP", 400);
  }

  await repository.clearOtp(user.id);

  const token = signToken({ id: user.id, role: user.role });

  return { token, role: user.role, name: user.name };
}

async function getMe(userId) {
  const user = await repository.findUserById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
}

module.exports = { signup, login, verifyOtp, getMe, AppError };
