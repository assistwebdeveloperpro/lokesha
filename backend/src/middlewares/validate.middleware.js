function buildErrorResponse(error) {
  // First message per field, keyed by field path
  const fields = {};
  for (const detail of error.details) {
    const key = detail.path.join(".");
    if (key && !fields[key]) fields[key] = detail.message;
  }

  return {
    message: "Validation failed",
    errors: error.details.map((detail) => detail.message),
    fields,
  };
}

function createValidator(source, assign) {
  return (schema) => (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json(buildErrorResponse(error));
    }

    assign(req, value);
    next();
  };
}

const validate = createValidator("body", (req, value) => {
  req.body = value;
});

// Params keep their own object so route handlers read the converted values
const validateParams = createValidator("params", (req, value) => {
  req.params = value;
});

// req.query is read-only in Express 5, so the converted values go to validatedQuery
const validateQuery = createValidator("query", (req, value) => {
  req.validatedQuery = value;
});

module.exports = validate;
module.exports.validateParams = validateParams;
module.exports.validateQuery = validateQuery;
module.exports.buildErrorResponse = buildErrorResponse;
