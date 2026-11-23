const Joi = require("joi");
const { PACKAGE_STATUSES } = require("../../../shared/subscription/constants/subscription.constants");

const MAX_PAGE_SIZE = 50;
const MAX_BENEFITS = 10;
const MAX_PRICE = 100000;
const MAX_LISTINGS = 1000;
const MAX_MONTHS = 60;
const MAX_LEADS = 1000;
const MAX_FREE_VALUE = 1000;
const MAX_VALIDITY_DAYS = 3650;

const positiveInt = (max) => Joi.number().integer().min(1).max(max);

// Partial update: every field is optional but at least one must be sent
const updatePackageSchema = Joi.object({
  name: Joi.string().trim().min(1).max(80),
  displayTitle: Joi.string().trim().min(1).max(120),
  description: Joi.string().trim().max(1000).allow(""),
  benefits: Joi.array().items(Joi.string().trim().min(1).max(150)).max(MAX_BENEFITS),
  status: Joi.string().valid(...PACKAGE_STATUSES),
  displayOrder: Joi.number().integer().min(0).max(1000),
  pricePerListingMonth: Joi.number().integer().min(0).max(MAX_PRICE),
  pricePerLead: Joi.number().integer().min(0).max(MAX_PRICE),
  gstPercent: Joi.number().min(0).max(100).precision(2),
  minLeads: positiveInt(MAX_LEADS),
  maxLeads: positiveInt(MAX_LEADS),
  minListings: positiveInt(MAX_LISTINGS),
  maxListings: positiveInt(MAX_LISTINGS),
  minMonths: positiveInt(MAX_MONTHS),
  maxMonths: positiveInt(MAX_MONTHS),
  allowCustomQuantity: Joi.boolean(),
  allowCustomDuration: Joi.boolean(),
  freeCredits: positiveInt(MAX_FREE_VALUE),
  freeLeadLimit: positiveInt(MAX_FREE_VALUE),
  freePropertyValidityDays: positiveInt(MAX_VALIDITY_DAYS),
})
  .min(1)
  .messages({ "object.min": "Send at least one field to update" });

const auditLogsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(MAX_PAGE_SIZE).default(10),
});

module.exports = { updatePackageSchema, auditLogsQuerySchema };
