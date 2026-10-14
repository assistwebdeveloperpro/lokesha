const Joi = require("joi");

const mobileNumber = Joi.string()
  .pattern(/^[0-9]{10,15}$/)
  .required()
  .messages({
    "string.pattern.base": "mobile_number must contain at least 10 digits",
  });

const adminLoginSchema = Joi.object({
  mobile_number: mobileNumber,
});

const adminVerifyOtpSchema = Joi.object({
  mobile_number: mobileNumber,
  otp: Joi.string()
    .pattern(/^[0-9]{4}$/)
    .required()
    .messages({
      "string.pattern.base": "otp must be exactly 4 digits",
    }),
});

module.exports = { adminLoginSchema, adminVerifyOtpSchema };
