const Joi = require("joi");
const { CONTACT_ROLES } = require("../../../landing/property-contact/property-contact.validation");
const { LISTING_TYPES, LISTED_BY } = require("../../../shared/property/constants/property.constants");

const MAX_PAGE_SIZE = 50;
const MAX_SEARCH_LENGTH = 100;
const MIN_SEARCH_LENGTH = 3;

const DB_PROPERTY_TYPES = ["residential", "commercial", "pg", "plot", "land"];

const leadsListQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(MAX_PAGE_SIZE).default(10),
  search: Joi.string().trim().min(MIN_SEARCH_LENGTH).max(MAX_SEARCH_LENGTH),
  role: Joi.string().valid(...CONTACT_ROLES),
  listedBy: Joi.string().valid(...LISTED_BY),
  phoneRevealed: Joi.boolean(),
  verificationStatus: Joi.string().valid("verified", "not_verified"),
  propertyType: Joi.string().valid(...DB_PROPERTY_TYPES),
  listingType: Joi.string().valid(...LISTING_TYPES),
  leadId: Joi.string().uuid(),
});

const leadIdParamSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

module.exports = { leadsListQuerySchema, leadIdParamSchema };
