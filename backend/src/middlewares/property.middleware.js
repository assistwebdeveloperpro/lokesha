const fs = require("fs");
const { listQuerySchema } = require("../modules/property/property.validation");

// Deletes uploaded files when the request ends with an error response
function cleanupUploadsOnError(req, res, next) {
  res.on("finish", () => {
    if (res.statusCode < 400) return;

    Object.values(req.files || {})
      .flat()
      .forEach((file) => fs.unlink(file.path, () => {}));
  });
  next();
}

// Multipart sends the JSON fields as a single "data" string
function parsePropertyPayload(req, res, next) {
  try {
    req.body = JSON.parse(req.body.data);
    return next();
  } catch (error) {
    return res.status(400).json({ message: "Invalid property data" });
  }
}

function validatePropertyQuery(req, res, next) {
  const { error, value } = listQuerySchema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.details.map((detail) => detail.message),
    });
  }

  // req.query is read-only in Express 5, so overwrite its properties
  Object.keys(req.query).forEach((key) => delete req.query[key]);
  Object.assign(req.query, value);
  next();
}

module.exports = { cleanupUploadsOnError, parsePropertyPayload, validatePropertyQuery };
