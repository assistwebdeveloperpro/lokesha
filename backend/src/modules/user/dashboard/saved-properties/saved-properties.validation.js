const Joi = require("joi");

const MAX_PAGE_SIZE = 50;

const propertyId = Joi.string().uuid().required().messages({
  "string.guid": "propertyId must be a valid id.",
  "any.required": "propertyId is required.",
});

const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(MAX_PAGE_SIZE).default(10),
});

const savePropertySchema = Joi.object({ propertyId });

const propertyIdParamSchema = Joi.object({ propertyId });

module.exports = { listQuerySchema, savePropertySchema, propertyIdParamSchema };
