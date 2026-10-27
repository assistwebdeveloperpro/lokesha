const Joi = require("joi");
const { uuidParamSchema } = require("../../../landing/property/property.validation");

const MAX_PAGE_SIZE = 50;

const notificationListQuerySchema = Joi.object({
  status: Joi.string().valid("unread", "read").default("unread"),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(MAX_PAGE_SIZE).default(20),
});

module.exports = { notificationListQuerySchema, uuidParamSchema };
