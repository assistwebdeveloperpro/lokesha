class AppError extends Error {
  // details is merged into the JSON body, e.g. { errors, fields }
  constructor(message, statusCode, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

function validationError(fields) {
  return new AppError("Validation failed", 400, { errors: Object.values(fields), fields });
}

module.exports = { AppError, validationError };
