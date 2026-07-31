const repository = require("./user-saved-messages.repository");
const { SAVED_MESSAGE_CATEGORIES } = require("./user-saved-messages.validation");

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

function toSavedMessagesMap(rows) {
  const savedMessages = Object.fromEntries(
    SAVED_MESSAGE_CATEGORIES.map((category) => [category, ""])
  );

  for (const row of rows) {
    savedMessages[row.category] = row.message;
  }

  return savedMessages;
}

async function getSavedMessages(userId) {
  const rows = await repository.findAllByUserId(userId);
  return toSavedMessagesMap(rows);
}

async function saveMessage(userId, category, message) {
  if (message.trim() === "") {
    await repository.deleteMessage(userId, category);
  } else {
    await repository.upsertMessage(userId, category, message);
  }

  return getSavedMessages(userId);
}

module.exports = { getSavedMessages, saveMessage, AppError };
