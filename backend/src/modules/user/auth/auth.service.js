const repository = require("./auth.repository");
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

const CONNECT_SELLER_ROLE = "buyer_owner_tenant";

function isOtpValid(record, otp) {
  const isExpired = !record.otp_expires_at || new Date(record.otp_expires_at) < new Date();

  return Boolean(record.otp_code) && record.otp_code === otp && !isExpired;
}

async function assertEmailAvailable(email) {
  const existingEmail = await repository.findUserByEmail(email);
  if (existingEmail) {
    throw new AppError("Email is already registered with another mobile number", 409);
  }
}

async function assertMobileAvailable(mobile_number) {
  const existingMobile = await repository.findUserByMobile(mobile_number);
  if (existingMobile) {
    throw new AppError("Mobile number is already registered", 409);
  }
}

async function signup({
  role,
  name,
  agency_name,
  company_name,
  email,
  mobile_number,
  agreed_to_terms,
}) {
  const existingEmail = await repository.findUserByEmail(email);
  if (existingEmail) {
    throw new AppError("Email is already registered", 409);
  }

  const existingMobile = await repository.findUserByMobile(mobile_number);
  if (existingMobile) {
    throw new AppError("Mobile number is already registered", 409);
  }

  const user = await repository.createUser({
    role,
    name,
    agency_name,
    company_name,
    email,
    mobile_number,
    agreed_to_terms,
  });

  return user;
}

async function issueOtp(mobile_number) {
  const otpCode = generateOtp();
  const otpExpiresAt = getOtpExpiry();
  await repository.setOtp(mobile_number, otpCode, otpExpiresAt);

  return { message: "OTP sent successfully.", otp_expires_in: OTP_EXPIRY_SECONDS };
}

async function login({ mobile_number }) {
  const user = await repository.findUserByMobile(mobile_number);

  if (!user) {
    throw new AppError(NOT_REGISTERED_MESSAGE, 404);
  }

  return issueOtp(mobile_number);
}

async function connectSeller({ name, email, mobile_number, agreed_to_terms }) {
  const existingMobile = await repository.findUserByMobile(mobile_number);

  if (existingMobile) {
    return issueOtp(mobile_number);
  }

  await assertEmailAvailable(email);

  const otpCode = generateOtp();
  const otpExpiresAt = getOtpExpiry();

  await repository.upsertPendingRegistration({
    mobile_number,
    name,
    email,
    agreed_to_terms,
    otpCode,
    otpExpiresAt,
  });

  return { message: "OTP sent successfully.", otp_expires_in: OTP_EXPIRY_SECONDS };
}

async function verifyPendingRegistration({ mobile_number, otp }) {
  const pending = await repository.findPendingRegistration(mobile_number);

  if (!pending) {
    throw new AppError(
      "No account found with this mobile number. Please register to continue.",
      404
    );
  }

  if (!isOtpValid(pending, otp)) {
    throw new AppError("Invalid or expired OTP", 400);
  }

  await assertMobileAvailable(mobile_number);
  await assertEmailAvailable(pending.email);

  const user = await repository.createUser({
    role: CONNECT_SELLER_ROLE,
    name: pending.name,
    email: pending.email,
    mobile_number,
    agreed_to_terms: pending.agreed_to_terms,
  });

  await repository.deletePendingRegistration(mobile_number);

  return user;
}

async function verifyOtp({ mobile_number, otp }) {
  const existingUser = await repository.getUserRoleAndOtp(mobile_number);

  let user;
  if (existingUser) {
    if (!isOtpValid(existingUser, otp)) {
      throw new AppError("Invalid or expired OTP", 400);
    }
    await repository.clearOtp(existingUser.id);
    user = existingUser;
  } else {
    user = await verifyPendingRegistration({ mobile_number, otp });
  }

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

module.exports = { signup, login, connectSeller, verifyOtp, getMe, AppError };
