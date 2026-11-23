const Joi = require("joi");
const { PACKAGE_CODES, SUBSCRIPTION_STATUSES } = require("../../../shared/subscription/constants/subscription.constants");

const MAX_PAGE_SIZE = 50;
const MAX_SEARCH_LENGTH = 100;

// A lead purchase creates no subscription, so it is not a package users can be filtered by
const SUBSCRIPTION_PACKAGE_CODES = [PACKAGE_CODES.FREE, PACKAGE_CODES.STANDARD];

const usersListQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(MAX_PAGE_SIZE).default(10),
  search: Joi.string().trim().max(MAX_SEARCH_LENGTH).allow(""),
  package: Joi.string().valid(...SUBSCRIPTION_PACKAGE_CODES),
  status: Joi.string().valid(...Object.values(SUBSCRIPTION_STATUSES)),
});

module.exports = { usersListQuerySchema };
