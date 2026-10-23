const repository = require("./user-profile.repository");

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

async function getProfile(userId) {
  const profile = await repository.findProfileByUserId(userId);

  if (!profile) {
    throw new AppError("User not found", 404);
  }

  return profile;
}

async function updateLoginDetails(userId, payload) {
  const existingUser = await repository.findUserByMobileNumber(payload.mobile, userId);
  if (existingUser) {
    throw new AppError("Mobile number is already in use", 409);
  }

  const userData = {
    name: payload.name,
    mobile_number: payload.mobile,
    agreed_to_terms: payload.agreedToTerms,
  };

  const preferencesData = {
    alternate_email: payload.alternateEmail || null,
    receive_on_alternate_email: payload.receiveOnAlternateEmail,
    receive_sms_on_mobile: payload.receiveSmsOnMobile,
    display_number: payload.displayNumber || null,
    is_primary_mobile_virtual: payload.isPrimaryMobileVirtual,
    hide_contact_details: payload.hideContactDetails,
  };

  const updated = await repository.updateLoginDetails(userId, userData, preferencesData);
  if (!updated) {
    throw new AppError("User not found", 404);
  }

  return getProfile(userId);
}

async function updateWhatsappNumber(userId, payload) {
  const profile = await repository.updateWhatsappNumber(userId, payload.whatsappNumber);
  if (!profile) {
    throw new AppError("User not found", 404);
  }

  return profile;
}

module.exports = { getProfile, updateLoginDetails, updateWhatsappNumber, AppError };
