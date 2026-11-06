const Joi = require("joi");
const { CONTACT_ROLES } = require("../../../landing/property-contact/property-contact.validation");

const MAX_PAGE_SIZE = 50;
const MAX_SEARCH_LENGTH = 100;

const leadsListQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(MAX_PAGE_SIZE).default(10),
  search: Joi.string().trim().max(MAX_SEARCH_LENGTH).allow(""),
  role: Joi.string().valid(...CONTACT_ROLES),
  phoneRevealed: Joi.boolean(),
});

module.exports = { leadsListQuerySchema };
