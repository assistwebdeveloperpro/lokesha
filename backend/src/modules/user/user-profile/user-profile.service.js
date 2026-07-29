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

module.exports = { getProfile, AppError };
