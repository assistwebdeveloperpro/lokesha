const Joi = require("joi");

const loginDetailsSchema = Joi.object({
  name: Joi.string().max(100).required(),
  alternateEmail: Joi.string().email().max(255).allow("").optional(),
  receiveOnAlternateEmail: Joi.boolean().default(false),
  mobileCountryCode: Joi.string().max(5).default("+91"),
  mobile: Joi.string()
    .pattern(/^\d{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Please enter a valid 10-digit mobile number.",
    }),
  receiveSmsOnMobile: Joi.boolean().default(true),
  displayCountryCode: Joi.string().max(5).allow("").optional(),
  displayNumber: Joi.string().max(20).allow("").optional(),
  isPrimaryMobileVirtual: Joi.boolean().default(false),
  hideContactDetails: Joi.boolean().default(false),
  agreedToTerms: Joi.boolean().valid(true).required().messages({
    "any.only": "Please accept the terms and conditions to continue.",
  }),
});

module.exports = { loginDetailsSchema };
