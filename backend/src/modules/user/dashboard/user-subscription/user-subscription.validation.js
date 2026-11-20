const Joi = require("joi");

const MAX_LISTINGS = 1000;
const MAX_MONTHS = 60;
const GSTIN_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

const quoteSchema = Joi.object({
  listings: Joi.number().integer().min(1).max(MAX_LISTINGS).required(),
  months: Joi.number().integer().min(1).max(MAX_MONTHS).required(),
});


const createOrderSchema = quoteSchema.keys({
  gstin: Joi.string().trim().uppercase().pattern(GSTIN_PATTERN).allow("").messages({
    "string.pattern.base": "Enter a valid 15 character GSTIN",
  }),
});

const verifyPaymentSchema = Joi.object({
  razorpay_payment_id: Joi.string().trim().max(64).required(),
  razorpay_signature: Joi.string().trim().max(128).required(),
});

const MAX_PAGE_SIZE = 50;

const pagingQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(MAX_PAGE_SIZE).default(10),
});

module.exports = { quoteSchema, createOrderSchema, verifyPaymentSchema, pagingQuerySchema };
