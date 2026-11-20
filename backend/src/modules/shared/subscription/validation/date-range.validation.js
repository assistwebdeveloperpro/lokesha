const Joi = require("joi");
const { isValidIstDay } = require("../utils/subscription-dates.util");

const istDayField = (label) =>
  Joi.string()
    .custom((value, helpers) => (isValidIstDay(value) ? value : helpers.error("any.invalid")))
    .messages({ "any.invalid": `${label} must be a valid date like 2026-11-20` });

const assertRangeOrder = (value, helpers) =>
  value.from && value.to && value.from > value.to ? helpers.message("From date cannot be after the to date") : value;

module.exports = { istDayField, assertRangeOrder };
