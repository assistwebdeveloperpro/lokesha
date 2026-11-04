import Joi from "../joi";

// Mirrors OWNER_CONTACT in backend/src/modules/shared/property/validation/property-payload.fields.js
const MOBILE_PATTERN = /^\d{10}$/;

// promptLabel reads inside a sentence, so it keeps the casing of the middle of a sentence
const mobileField = (label: string, promptLabel: string) =>
  Joi.string()
    .trim()
    .pattern(MOBILE_PATTERN)
    .messages({
      "string.empty": `Please enter ${promptLabel}`,
      "any.required": `Please enter ${promptLabel}`,
      "string.pattern.base": `${label} must be 10 digits`,
    });

export function createOwnerContactSchema() {
  return Joi.object({
    fullName: Joi.string()
      .trim()
      .max(150)
      .required()
      .messages({
        "string.empty": "Please enter owner full name",
        "any.required": "Please enter owner full name",
        "string.max": "Full name must be at most 150 characters long",
      }),
    mobileNumber: mobileField("Mobile number", "mobile number").required(),
    alternateMobileNumber: mobileField("Alternate mobile number", "alternate mobile number").allow(""),
    email: Joi.string()
      .trim()
      .max(150)
      .email({ tlds: { allow: false } })
      .allow("")
      .messages({
        "string.email": "Please enter a valid email address",
        "string.max": "Email address must be at most 150 characters long",
      }),
    whatsappNumber: mobileField("WhatsApp number", "WhatsApp number").allow(""),
  });
}
