const Joi = require("joi");

const MAX_CREDITS = 1000;
const MAX_MONTHS = 60;
const MAX_PAGE_SIZE = 50;
const MIN_REASON_LENGTH = 5;
const MAX_REASON_LENGTH = 500;

// Every admin action is recorded with the reason, so it is required
const reason = Joi.string()
  .trim()
  .min(MIN_REASON_LENGTH)
  .max(MAX_REASON_LENGTH)
  .required()
  .messages({
    "string.empty": "Please give a reason for this action",
    "string.min": `Reason must be at least ${MIN_REASON_LENGTH} characters`,
    "any.required": "Please give a reason for this action",
  });

const giftCreditsSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  credits: Joi.number().integer().min(1).max(MAX_CREDITS).required(),
  months: Joi.number().integer().min(1).max(MAX_MONTHS).required(),
  reason,
});

const extendSchema = Joi.object({
  subscriptionId: Joi.string().uuid().required(),
  months: Joi.number().integer().min(1).max(MAX_MONTHS).required(),
  reason,
});

const refundSchema = Joi.object({
  orderId: Joi.string().uuid().required(),
  reason,
});

const actionsListQuerySchema = Joi.object({
  userId: Joi.string().uuid().required(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(MAX_PAGE_SIZE).default(10),
});

module.exports = { giftCreditsSchema, extendSchema, refundSchema, actionsListQuerySchema };
