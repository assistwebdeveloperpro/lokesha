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

  const data = {
    name: payload.name,
    mobile_number: payload.mobile,
    mobile_country_code: payload.mobileCountryCode,
    alternate_email: payload.alternateEmail || null,
    receive_on_alternate_email: payload.receiveOnAlternateEmail,
    receive_sms_on_mobile: payload.receiveSmsOnMobile,
    display_country_code: payload.displayCountryCode || null,
    display_number: payload.displayNumber || null,
    is_primary_mobile_virtual: payload.isPrimaryMobileVirtual,
    hide_contact_details: payload.hideContactDetails,
    agreed_to_terms: payload.agreedToTerms,
  };

  const profile = await repository.updateLoginDetails(userId, data);
  if (!profile) {
    throw new AppError("User not found", 404);
  }

  return profile;
}

module.exports = { getProfile, updateLoginDetails, AppError };
