const Joi = require("joi");

const MAX_PAGE_SIZE = 50;
const AVAILABILITY_FILTERS = ["all", "available", "unavailable"];

const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(MAX_PAGE_SIZE).default(10),
  availability: Joi.string().valid(...AVAILABILITY_FILTERS).default("all"),
});

module.exports = { listQuerySchema, AVAILABILITY_FILTERS };
