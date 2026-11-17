const Joi = require("joi");

const MAX_PAGE_SIZE = 50;
const MAX_SYNC_ENTRIES = 100;

const propertyId = Joi.string().uuid().required().messages({
  "string.guid": "propertyId must be a valid id.",
  "any.required": "propertyId is required.",
});

const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(MAX_PAGE_SIZE).default(20),
});

const propertyIdParamSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.guid": "id must be a valid id.",
    "any.required": "id is required.",
  }),
});

const syncEntrySchema = Joi.object({
  propertyId,
  viewedAt: Joi.date().iso().required().messages({
    "date.format": "viewedAt must be a valid ISO date.",
    "date.base": "viewedAt must be a valid ISO date.",
    "any.required": "viewedAt is required.",
  }),
});

const syncSchema = Joi.object({
  properties: Joi.array().items(syncEntrySchema).min(1).max(MAX_SYNC_ENTRIES).required().messages({
    "array.min": "properties must contain at least one entry.",
    "array.max": `properties can contain at most ${MAX_SYNC_ENTRIES} entries.`,
    "any.required": "properties is required.",
  }),
});

module.exports = { listQuerySchema, propertyIdParamSchema, syncSchema };
