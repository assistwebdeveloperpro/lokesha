const Joi = require("joi");
const { CATEGORY_TO_DB } = require("../property-search/property-search.constants");
const { LISTING_TYPES } = require("../../shared/property/constants/property.constants");

const DEFAULT_PAGE_SIZE = 30;
const MAX_PAGE_SIZE = 50;

const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
  listingType: Joi.string().valid(...LISTING_TYPES),
  category: Joi.string().valid(...Object.keys(CATEGORY_TO_DB)),
  city: Joi.string().trim().max(100),
});

module.exports = { listQuerySchema };
