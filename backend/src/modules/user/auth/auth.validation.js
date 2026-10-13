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
  name: Joi.string().min(3).max(100).required().messages({
    "string.empty": "Please enter your name.",
    "string.min": "Name must be at least 3 characters long.",
    "string.max": "Name must be at most 100 characters long.",
    "any.required": "Please enter your name.",
  }),
  email: Joi.string().email({ tlds: { allow: false } }).required().messages({
    "string.empty": "Please enter your email id.",
    "string.email": "Please enter a valid email id.",
    "any.required": "Please enter your email id.",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Please enter password.",
    "any.required": "Please enter password.",
  }),
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
