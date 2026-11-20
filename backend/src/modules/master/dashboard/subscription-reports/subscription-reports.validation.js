const Joi = require("joi");
const { istDayField, assertRangeOrder } = require("../../../shared/subscription/validation/date-range.validation");

const reportsQuerySchema = Joi.object({
  from: istDayField("From date"),
  to: istDayField("To date"),
}).custom(assertRangeOrder);

module.exports = { reportsQuerySchema };
