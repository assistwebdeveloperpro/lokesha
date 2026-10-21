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
  agency_name: Joi.string()
    .trim()
    .max(150)
    .when("role", {
      is: "agent",
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    })
    .messages({
      "string.empty": "Please enter agency name.",
      "string.max": "Agency name must be at most 150 characters long.",
      "any.required": "Please enter agency name.",
    }),
  company_name: Joi.string()
    .trim()
    .max(150)
    .when("role", {
      is: "builder",
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    })
    .messages({
      "string.empty": "Please enter company name.",
      "string.max": "Company name must be at most 150 characters long.",
      "any.required": "Please enter company name.",
    }),
  mobile_number: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.pattern.base": "mobile_number must be exactly 10 digits",
    }),
  agreed_to_terms: Joi.boolean().valid(true).required().messages({
    "any.only": "Please accept the terms and conditions.",
    "any.required": "Please accept the terms and conditions.",
  }),
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
