import Joi from "../joi";

// Mirrors backend/src/modules/user/auth/auth.validation.js
export const SIGNUP_ROLES = ["buyer_owner_tenant", "agent", "builder"] as const;

export type SignupRole = (typeof SIGNUP_ROLES)[number];

const MOBILE_MIN_DIGITS = 10;
const MOBILE_MAX_DIGITS = 15;

export const loginSchema = Joi.object({
  mobile_number: Joi.string()
    .pattern(/^\d+$/)
    .min(MOBILE_MIN_DIGITS)
    .max(MOBILE_MAX_DIGITS)
    .required()
    .messages({
      "string.empty": "Please enter your mobile number.",
      "any.required": "Please enter your mobile number.",
      "string.pattern.base": "Please enter a valid mobile number.",
      "string.min": "Mobile number should be of min. 10 digits. Please re-enter.",
      "string.max": "Mobile number can have at most 15 digits. Please re-enter.",
    }),
});

const organisationName = (role: SignupRole, label: string) =>
  Joi.string()
    .trim()
    .max(150)
    .when("role", {
      is: role,
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    })
    .messages({
      "string.empty": `Please enter ${label} name.`,
      "any.required": `Please enter ${label} name.`,
      "string.max": `${label[0].toUpperCase()}${label.slice(1)} name must be at most 150 characters long.`,
    });

export const signupSchema = Joi.object({
  role: Joi.string()
    .valid(...SIGNUP_ROLES)
    .required(),
  name: Joi.string().trim().min(3).max(100).required().messages({
    "string.empty": "Please enter your name.",
    "any.required": "Please enter your name.",
    "string.min": "Name must be at least 3 characters long.",
    "string.max": "Name must be at most 100 characters long.",
  }),
  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.empty": "Please enter your email id.",
      "any.required": "Please enter your email id.",
      "string.email": "Please enter a valid email id.",
    }),
  agency_name: organisationName("agent", "agency"),
  company_name: organisationName("builder", "company"),
  mobile_number: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.empty": "Please enter mobile number.",
      "any.required": "Please enter mobile number.",
      "string.pattern.base": "Mobile number must be exactly 10 digits.",
    }),
  agreed_to_terms: Joi.boolean().valid(true).required().messages({
    "any.only": "Please accept the terms and conditions.",
    "any.required": "Please accept the terms and conditions.",
    "boolean.base": "Please accept the terms and conditions.",
  }),
});
