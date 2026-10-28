const Joi = require("joi");
const { LISTING_TYPES, PROPERTY_TYPES, STATUSES } = require("../../../shared/property/constants/property.constants");

const MAX_PAGE_SIZE = 50;

const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(MAX_PAGE_SIZE).default(10),
  status: Joi.string().valid(...STATUSES),
  listingType: Joi.string().valid(...LISTING_TYPES),
  propertyType: Joi.string().valid(...PROPERTY_TYPES),
});

module.exports = { listQuerySchema };
