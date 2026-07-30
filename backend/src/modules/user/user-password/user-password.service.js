const repository = require("./user-password.repository");
const { hashPassword, comparePassword } = require("../../../utils/bcrypt");

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

async function changePassword(userId, { oldPassword, newPassword }) {
  const user = await repository.findPasswordById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const isMatch = await comparePassword(oldPassword, user.password);
  if (!isMatch) {
    throw new AppError("Old password is incorrect", 400);
  }

  const isSameAsOld = await comparePassword(newPassword, user.password);
  if (isSameAsOld) {
    throw new AppError("New password must be different from old password", 400);
  }

  const passwordHash = await hashPassword(newPassword);
  await repository.updatePassword(userId, passwordHash);

  return { message: "Password changed successfully" };
}

module.exports = { changePassword, AppError };
