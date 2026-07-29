const Joi = require("joi");

const DEALING_IN_VALUES = ["sale", "rent"];
const PROPERTY_TYPE_VALUES = ["residential", "commercial"];
const YES_NO_VALUES = ["yes", "no"];

const clientSchema = Joi.object({
  name: Joi.string().allow("").max(255),
  dealValue: Joi.string().allow("").max(255),
});

const businessDetailsSchema = Joi.object({
  dealingIn: Joi.array()
    .items(Joi.string().valid(...DEALING_IN_VALUES))
    .min(1)
    .required(),
  propertyType: Joi.array()
    .items(Joi.string().valid(...PROPERTY_TYPE_VALUES))
    .min(1)
    .required(),
  transactionType: Joi.array().items(Joi.string()).min(1).required(),
  transactionTypeOthers: Joi.array().items(Joi.string()).default([]),
  residentialProperty: Joi.array().items(Joi.string()).default([]),
  residentialPropertyOthers: Joi.array().items(Joi.string()).default([]),
  commercialProperty: Joi.array().items(Joi.string()).default([]),
  commercialPropertyOthers: Joi.array().items(Joi.string()).default([]),
  operatingSince: Joi.string()
    .pattern(/^[0-9]{4}$/)
    .required()
    .messages({
      "string.pattern.base": "operatingSince must be a 4 digit year",
    }),
  expertiseIn: Joi.string().required(),
  businessDescription: Joi.string()
    .trim()
    .min(100)
    .max(3000)
    .required()
    .messages({
      "string.min": "Business description must be at least 100 characters.",
      "string.max": "Business description must not exceed 3000 characters.",
      "any.required": "Business description is required.",
    }),
  authorizedAgents: Joi.string().max(3000).allow("").optional(),
  propertyRegistry: Joi.string().valid(...YES_NO_VALUES).optional(),
  loanFacility: Joi.string().valid(...YES_NO_VALUES).optional(),
  clients: Joi.array().items(clientSchema).default([]),
});

module.exports = { businessDetailsSchema };
