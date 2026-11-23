const repository = require("./auth.repository");
const { grantFreePackage } = require("../../shared/subscription/services/subscription-grant.service");
const { generateOtp, getOtpExpiry, OTP_EXPIRY_SECONDS } = require("../../../utils/otp");
const {
  signToken,
  signRegistrationToken,
  verifyRegistrationToken,
} = require("../../../utils/jwt");

class AppError extends Error {
  constructor(message, statusCode, details = {}) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

const RESEND_COOLDOWN_SECONDS = 60;
const UNIQUE_VIOLATION_CODE = "23505";

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

  return repository.runInTransaction(async (trx) => {
    const user = await repository.createUser(
      { role, name, agency_name, company_name, email, mobile_number, agreed_to_terms },
      trx,
    );
    await grantFreePackage(trx, user);
    return user;
  });
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

  return repository.runInTransaction(async (trx) => {
    const user = await repository.createUser(
      {
        role: CONNECT_SELLER_ROLE,
        name: pending.name,
        email: pending.email,
        mobile_number,
        agreed_to_terms: pending.agreed_to_terms,
      },
      trx,
    );
    await grantFreePackage(trx, user);
    await repository.deletePendingRegistration(mobile_number);
    return user;
  });
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

  return buildSession(user);
}

function buildSession(user) {
  const token = signToken({ id: user.id, role: user.role });

  return { token, role: user.role, name: user.name };
}

function assertResendAllowed(lastSentAt) {
  if (!lastSentAt) return;

  const elapsedSeconds = (Date.now() - new Date(lastSentAt).getTime()) / 1000;
  const retryAfter = Math.ceil(RESEND_COOLDOWN_SECONDS - elapsedSeconds);

  if (retryAfter > 0) {
    throw new AppError(`Please wait ${retryAfter} seconds before requesting another OTP.`, 429, {
      retryAfter,
    });
  }
}

// users rows only store the expiry, so the send time is derived from it.
function getUserOtpSentAt(user) {
  if (!user.otp_expires_at) return null;

  return new Date(new Date(user.otp_expires_at).getTime() - OTP_EXPIRY_SECONDS * 1000);
}

async function sendOtp({ mobile_number }) {
  const existingUser = await repository.getUserRoleAndOtp(mobile_number);

  if (existingUser) {
    assertResendAllowed(getUserOtpSentAt(existingUser));
    const result = await issueOtp(mobile_number);

    return { ...result, is_registered: true };
  }

  const pendingOtp = await repository.findMobileOtp(mobile_number);
  assertResendAllowed(pendingOtp?.last_sent_at);

  await repository.upsertMobileOtp({
    mobile_number,
    otpCode: generateOtp(),
    otpExpiresAt: getOtpExpiry(),
  });

  return {
    message: "OTP sent successfully.",
    otp_expires_in: OTP_EXPIRY_SECONDS,
    is_registered: false,
  };
}

async function verifyMobileOtp({ mobile_number, otp }) {
  const existingUser = await repository.getUserRoleAndOtp(mobile_number);

  if (existingUser) {
    if (!isOtpValid(existingUser, otp)) {
      throw new AppError("Invalid or expired OTP", 400);
    }
    await repository.clearOtp(existingUser.id);

    return { is_new_user: false, ...buildSession(existingUser) };
  }

  const pendingOtp = await repository.findMobileOtp(mobile_number);
  if (!pendingOtp || !isOtpValid(pendingOtp, otp)) {
    throw new AppError("Invalid or expired OTP", 400);
  }
  await repository.deleteMobileOtp(mobile_number);

  return { is_new_user: true, registration_token: signRegistrationToken(mobile_number) };
}

async function registerWithOtp({ registration_token, name, email, agreed_to_terms }) {
  const mobile_number = verifyRegistrationToken(registration_token);
  if (!mobile_number) {
    throw new AppError("Registration session expired. Please verify your mobile number again.", 401);
  }

  await assertMobileAvailable(mobile_number);
  await assertEmailAvailable(email);

  try {
    // The Free package is granted with the account or not at all
    const user = await repository.runInTransaction(async (trx) => {
      const createdUser = await repository.createUser(
        { role: CONNECT_SELLER_ROLE, name, email, mobile_number, agreed_to_terms },
        trx,
      );
      await grantFreePackage(trx, createdUser);
      return createdUser;
    });

    return buildSession(user);
  } catch (error) {
    if (error.code === UNIQUE_VIOLATION_CODE) {
      throw new AppError("Email or mobile number is already registered", 409);
    }
    throw error;
  }
}

async function getMe(userId) {
  const user = await repository.findUserById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
}

module.exports = {
  signup,
  login,
  connectSeller,
  verifyOtp,
  sendOtp,
  verifyMobileOtp,
  registerWithOtp,
  getMe,
  AppError,
};
