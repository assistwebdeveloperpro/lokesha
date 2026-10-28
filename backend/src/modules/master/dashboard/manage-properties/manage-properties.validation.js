const Joi = require("joi");
const { STATUSES, LISTING_TYPES, PROPERTY_TYPES } = require("../../../shared/property/constants/property.constants");

const MAX_PAGE_SIZE = 50;
const MANAGE_STATUSES = ["published", "rejected", "closed"];
const LISTED_BY_ROLES = ["buyer_owner_tenant", "agent", "builder", "lokesha_staff", "admin"];

const manageListQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(MAX_PAGE_SIZE).default(10),
  status: Joi.string().when("source", {
    is: "admin",
    then: Joi.valid(...STATUSES),
    otherwise: Joi.valid(...MANAGE_STATUSES),
  }),
  listingType: Joi.string().valid(...LISTING_TYPES),
  propertyType: Joi.string().valid(...PROPERTY_TYPES),
  source: Joi.string().valid("admin", "user"),
  projectName: Joi.string().trim().max(150).allow(""),
  role: Joi.string().valid(...LISTED_BY_ROLES),
});

module.exports = { manageListQuerySchema, MANAGE_STATUSES };
