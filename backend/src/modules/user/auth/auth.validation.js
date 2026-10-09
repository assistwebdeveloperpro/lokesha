const Joi = require("joi");

const SIGNUP_ROLE_VALUES = ["buyer_owner_tenant", "agent", "builder"];

const mobileNumber = Joi.string()
  .pattern(/^[0-9]{10,15}$/)
  .required()
  .messages({
    "string.pattern.base": "mobile_number must contain at least 10 digits",
  });

const signupSchema = Joi.object({
  role: Joi.string()
    .valid(...SIGNUP_ROLE_VALUES)
    .required(),
  name: Joi.string().min(3).max(100).required(),
  email: Joi.string().email({ tlds: { allow: false } }).required(),
  password: Joi.string().required(),
  mobile_number: mobileNumber,
});

const loginSchema = Joi.object({
  mobile_number: mobileNumber,
});

const verifyOtpSchema = Joi.object({
  mobile_number: mobileNumber,
  otp: Joi.string()
    .pattern(/^[0-9]{4}$/)
    .required()
    .messages({
      "string.pattern.base": "otp must be exactly 4 digits",
    }),
});

module.exports = {
  signupSchema,
  loginSchema,
  verifyOtpSchema,
  SIGNUP_ROLE_VALUES,
};
