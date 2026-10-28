const Joi = require("joi");
const { STATUSES, LISTING_TYPES, PROPERTY_TYPES } = require("../../../landing/property/property.constants");

const MAX_PAGE_SIZE = 50;
const MANAGE_STATUSES = ["published", "rejected", "closed"];

const manageListQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(MAX_PAGE_SIZE).default(10),
  status: Joi.string().when("source", {
    is: "admin",
    then: Joi.valid(...STATUSES),
    otherwise: Joi.valid(...MANAGE_STATUSES),
  }),
  listingType: Joi.string().valid(...LISTING_TYPES),
  propertyType: Joi.string().valid(...PROPERTY_TYPES),
  source: Joi.string().valid("admin", "user"),
});

module.exports = { manageListQuerySchema, MANAGE_STATUSES };
