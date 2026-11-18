const Joi = require("joi");

const MAX_PAGE_SIZE = 50;

const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(MAX_PAGE_SIZE).default(10),
  leadId: Joi.string().uuid(),
});

module.exports = { listQuerySchema };
