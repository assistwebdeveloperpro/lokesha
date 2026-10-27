const Joi = require("joi");
const { STATUSES, LISTING_TYPES, PROPERTY_TYPES } = require("../../../landing/property/property.constants");

const MAX_PAGE_SIZE = 50;
const MIN_REASON_LENGTH = 5;
const MAX_REASON_LENGTH = 500;

const reviewListQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(MAX_PAGE_SIZE).default(10),
  status: Joi.string()
    .valid(...STATUSES.filter((status) => status !== "draft"))
    .default("pending"),
  listingType: Joi.string().valid(...LISTING_TYPES),
  propertyType: Joi.string().valid(...PROPERTY_TYPES),
});

const rejectSchema = Joi.object({
  reason: Joi.string().trim().min(MIN_REASON_LENGTH).max(MAX_REASON_LENGTH).required().messages({
    "string.empty": "Please tell the owner why the property is rejected",
    "string.min": `Reason must be at least ${MIN_REASON_LENGTH} characters`,
    "any.required": "Please tell the owner why the property is rejected",
  }),
});

module.exports = { reviewListQuerySchema, rejectSchema };
