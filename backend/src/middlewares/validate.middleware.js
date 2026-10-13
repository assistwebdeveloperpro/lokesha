function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      // First message per field, keyed by field path
      const fields = {};
      for (const detail of error.details) {
        const key = detail.path.join(".");
        if (key && !fields[key]) fields[key] = detail.message;
      }

      return res.status(400).json({
        message: "Validation failed",
        errors: error.details.map((detail) => detail.message),
        fields,
      });
    }

    req.body = value;
    next();
  };
}

module.exports = validate;
