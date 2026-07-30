const Joi = require("joi");

const reraDetailsSchema = Joi.object({
  state: Joi.string().max(100).required(),
  reraId: Joi.string().max(50).required(),
  validityMonth: Joi.string()
    .pattern(/^(0[1-9]|1[0-2])$/)
    .required(),
  validityYear: Joi.string()
    .pattern(/^\d{4}$/)
    .required(),
  verificationLink: Joi.string().max(500).allow("").optional(),
});

module.exports = { reraDetailsSchema };
