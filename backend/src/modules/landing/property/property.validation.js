const Joi = require("joi");
const {
  FILE_KINDS,
  FILE_NAME_PATTERN,
  FLOOR_PLAN_TYPES,
  LIMITS,
  LISTING_TYPES,
  MEDIA_CATEGORIES,
  PROPERTY_TYPES,
  STATUSES,
} = require("./property.constants");

const MIN_STEP = 1;
const MAX_STEP = 5;

const formDataSchema = Joi.object()
  .unknown(true)
  .custom((value, helpers) => {
    if (Buffer.byteLength(JSON.stringify(value)) > LIMITS.maxFormDataBytes) {
      return helpers.error("object.tooLarge");
    }
    return value;
  })
  .messages({ "object.tooLarge": "Form data is too large" });

const currentStepSchema = Joi.number().integer().min(MIN_STEP).max(MAX_STEP);

const uuidParamSchema = Joi.object({
  id: Joi.string().guid({ version: "uuidv4" }).required(),
});

const draftFileParamsSchema = Joi.object({
  id: Joi.string().guid({ version: "uuidv4" }).required(),
  fileName: Joi.string().pattern(FILE_NAME_PATTERN).required(),
});

const draftCreateSchema = Joi.object({
  currentStep: currentStepSchema.default(MIN_STEP),
  formData: formDataSchema.default({}),
});

const draftSaveSchema = Joi.object({
  currentStep: currentStepSchema.required(),
  formData: formDataSchema.required(),
});


const draftCompleteSchema = Joi.object({
  payload: Joi.object().unknown(true).required(),
  submit: Joi.boolean().default(false),
});

const propertyUpdateSchema = Joi.object({
  payload: Joi.object().unknown(true).required(),
});

const mediaParamsSchema = Joi.object({
  id: Joi.string().guid({ version: "uuidv4" }).required(),
  mediaId: Joi.string().guid({ version: "uuidv4" }).required(),
});

const floorPlanParamsSchema = Joi.object({
  id: Joi.string().guid({ version: "uuidv4" }).required(),
  planId: Joi.string().guid({ version: "uuidv4" }).required(),
});

// Floor plans have their own endpoint, so only these kinds go to /media
const mediaKindQuerySchema = Joi.object({
  kind: Joi.string().valid("media", "brochure").required(),
});

const MAX_PAGE_SIZE = 50;

const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(MAX_PAGE_SIZE).default(10),
  status: Joi.string().valid(...STATUSES),
  listingType: Joi.string().valid(...LISTING_TYPES),
  propertyType: Joi.string().valid(...PROPERTY_TYPES),
});

const amenityQuerySchema = Joi.object({
  listingType: Joi.string()
    .valid(...LISTING_TYPES)
    .required(),
  propertyType: Joi.string()
    .valid(...PROPERTY_TYPES)
    .required(),
  // Property types without sub types (PG) send none
  subType: Joi.string()
    .pattern(/^[a-z0-9-]{1,40}$/)
    .empty(""),
});

const fileKindQuerySchema = Joi.object({
  kind: Joi.string()
    .valid(...FILE_KINDS)
    .required(),
});

const fileMetaSchema = Joi.object({
  category: Joi.string().valid(...MEDIA_CATEGORIES),
  planType: Joi.string().valid(...FLOOR_PLAN_TYPES),
  label: Joi.string().trim().max(100).allow(""),
});

module.exports = {
  uuidParamSchema,
  draftFileParamsSchema,
  draftCreateSchema,
  draftSaveSchema,
  draftCompleteSchema,
  propertyUpdateSchema,
  mediaParamsSchema,
  floorPlanParamsSchema,
  mediaKindQuerySchema,
  listQuerySchema,
  amenityQuerySchema,
  fileKindQuerySchema,
  fileMetaSchema,
};
