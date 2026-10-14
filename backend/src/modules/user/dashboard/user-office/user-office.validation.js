const Joi = require("joi");

const officeDetailsSchema = Joi.object({
  state: Joi.string().max(100).required(),
  city: Joi.string().max(100).required(),
  locality: Joi.string().max(255).required(),
  address: Joi.string().allow("").optional(),
  postalCode: Joi.string().max(20).allow("").optional(),
  contactPersonName: Joi.string().max(100).required(),
  hidePersonName: Joi.boolean().default(false),
  agencyCompanyName: Joi.string().max(255).required(),
  companyWebsite: Joi.string().max(255).allow("").optional(),
  officePhotos: Joi.array().items(Joi.string()).max(10).optional(),
});

module.exports = { officeDetailsSchema };
