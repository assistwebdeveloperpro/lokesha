const Joi = require("joi");
const { LISTING_TYPES, PROPERTY_TYPES } = require("../../shared/property/constants/property.constants");

const MAX_LOCALITIES = 20;
const MAX_SUB_TYPES = 20;
const REQUIREMENT_MAX_LENGTH = 1000;

const textItem = Joi.string().trim().min(1).max(100);

const createRequirementSchema = Joi.object({
  listingType: Joi.string().valid(...LISTING_TYPES).required(),
  propertyType: Joi.string().valid(...PROPERTY_TYPES).required(),
  city: textItem.required(),
  localities: Joi.array().items(textItem).min(1).max(MAX_LOCALITIES).unique().required().messages({
    "array.min": "Select at least one locality",
  }),
  subTypes: Joi.array().items(Joi.string().trim().lowercase().max(40)).max(MAX_SUB_TYPES).unique().default([]),
  requirement: Joi.string().trim().min(1).max(REQUIREMENT_MAX_LENGTH).required().messages({
    "string.empty": "Describe your requirement",
  }),
});

module.exports = { createRequirementSchema };
