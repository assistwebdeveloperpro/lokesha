const Joi = require("joi");

const GSTIN_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const SAC_PATTERN = /^[0-9]{4,8}$/;
const PREFIX_PATTERN = /^[A-Z0-9-]{1,12}$/;

const prefix = (label) =>
  Joi.string().trim().uppercase().pattern(PREFIX_PATTERN).messages({
    "string.pattern.base": `${label} must be 1 to 12 letters, numbers or dashes`,
  });

// Partial update, an empty GSTIN or SAC code clears the value
const updateSettingsSchema = Joi.object({
  legalName: Joi.string().trim().max(160).allow(""),
  address: Joi.string().trim().max(500).allow(""),
  gstin: Joi.string().trim().uppercase().pattern(GSTIN_PATTERN).allow("").messages({
    "string.pattern.base": "Enter a valid 15 character GSTIN",
  }),
  sacCode: Joi.string().trim().pattern(SAC_PATTERN).allow("").messages({
    "string.pattern.base": "SAC code must be 4 to 8 digits",
  }),
  invoicePrefix: prefix("Invoice prefix"),
  creditNotePrefix: prefix("Credit note prefix"),
})
  .min(1)
  .messages({ "object.min": "Send at least one field to update" });

module.exports = { updateSettingsSchema };
