const Joi = require("joi");
const { ORDER_STATUSES } = require("../../../shared/subscription/constants/subscription.constants");
const { istDayField, assertRangeOrder } = require("../../../shared/subscription/validation/date-range.validation");

const MAX_PAGE_SIZE = 50;
const MAX_SEARCH_LENGTH = 100;

// Shared by the list and the export, which ignores the paging
const transactionsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(MAX_PAGE_SIZE).default(10),
  search: Joi.string().trim().max(MAX_SEARCH_LENGTH).allow(""),
  status: Joi.string().valid(...Object.values(ORDER_STATUSES)),
  userId: Joi.string().uuid(),
  from: istDayField("From date"),
  to: istDayField("To date"),
}).custom(assertRangeOrder);

module.exports = { transactionsQuerySchema };
