const Joi = require("joi");

const MAX_LIMIT = 20;
const MAX_SYNC_ENTRIES = 20;
const MAX_ITEMS = 50;
const MAX_TEXT = 100;
const MAX_URL_LENGTH = 2000;
const MAX_NUMBER = 1000000000000;

const TRANSACTIONS = ["property-for-sale", "property-for-rent", "property-for-lease"];
const CATEGORIES = ["residential-real-estate", "commercial-real-estate", "pg-co-living", "plot", "land"];

const MORE_TEXT_KEYS = ["postedSince", "availableFrom"];
const MORE_FLAG_KEYS = [
  "hasRera",
  "hasPhotos",
  "hasVideos",
  "boundaryWallMade",
  "cornerPlot",
  "anyConstruction",
  "carParkingAvailable",
  "clubMembership",
  "priceNegotiable",
  "pantry",
  "cafeteria",
  "cornerShop",
];
const MORE_LIST_KEYS = [
  "balconies",
  "bathroomCounts",
  "ageOfConstruction",
  "lifts",
  "cabins",
  "totalFloors",
  "floorNumbers",
  "floorsAllowed",
  "furnishingStatuses",
  "furnishingItems",
  "amenities",
  "facings",
  "washrooms",
  "roadFacings",
  "businessTypes",
  "tenantPreferences",
  "pgRules",
  "foods",
  "openSides",
  "carParkings",
  "priceInclusion",
  "managedBy",
  "penthouseTypes",
  "terraceEntries",
  "pgGenders",
  "pgOperationSince",
  "pgPresentIn",
  "entryTill",
];

const text = Joi.string().trim().max(MAX_TEXT);
const optionalTextList = Joi.array().items(text).max(MAX_ITEMS);
const textList = optionalTextList.default([]);
const amount = Joi.number().min(0).max(MAX_NUMBER);

// Upper bound of a range, never below its lower bound when that is set
const rangeMax = (minKey) =>
  amount.when(minKey, { is: Joi.exist(), then: Joi.number().min(Joi.ref(minKey)) });

const buildKeys = (keys, schema) => Object.fromEntries(keys.map((key) => [key, schema]));

const moreSchema = Joi.object({
  ...buildKeys(MORE_TEXT_KEYS, text.allow("")),
  ...buildKeys(MORE_FLAG_KEYS, Joi.boolean()),
  ...buildKeys(MORE_LIST_KEYS, optionalTextList),
}).default({});

const searchCriteriaSchema = Joi.object({
  transaction: Joi.string()
    .valid(...TRANSACTIONS)
    .required(),
  category: Joi.string()
    .valid(...CATEGORIES)
    .required(),
  cityName: text,
  localities: textList,
  projects: textList,
  bedrooms: Joi.array().items(Joi.number().integer().min(1).max(MAX_ITEMS)).max(MAX_ITEMS).default([]),
  propertyTypes: textList,
  constructionStatuses: textList,
  saleTypes: textList,
  occupancies: textList,
  genders: textList,
  postedBy: textList,
  budgetMin: amount,
  budgetMax: rangeMax("budgetMin"),
  areaMin: amount,
  areaMax: rangeMax("areaMin"),
  more: moreSchema,
}).required();

// Stored for reference only, so it must be a same-origin relative path
const searchUrl = Joi.string()
  .max(MAX_URL_LENGTH)
  .pattern(/^\/(?!\/)/)
  .required()
  .messages({ "string.pattern.base": "searchUrl must be a relative path." });

const createSchema = Joi.object({
  searchCriteria: searchCriteriaSchema,
  searchUrl,
});

const syncEntrySchema = Joi.object({
  searchCriteria: searchCriteriaSchema,
  searchUrl,
  searchedAt: Joi.date().iso().required().messages({
    "date.format": "searchedAt must be a valid ISO date.",
    "date.base": "searchedAt must be a valid ISO date.",
    "any.required": "searchedAt is required.",
  }),
});

// Entries are validated one by one in the service, so one bad entry never blocks the rest
const syncSchema = Joi.object({
  searches: Joi.array().items(Joi.any()).min(1).max(MAX_SYNC_ENTRIES).required().messages({
    "array.min": "searches must contain at least one entry.",
    "array.max": `searches can contain at most ${MAX_SYNC_ENTRIES} entries.`,
    "any.required": "searches is required.",
  }),
});

const idParamSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.guid": "id must be a valid id.",
    "any.required": "id is required.",
  }),
});

const listQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(MAX_LIMIT).default(MAX_LIMIT),
});

module.exports = {
  MAX_RECENT_SEARCHES: MAX_LIMIT,
  searchCriteriaSchema,
  createSchema,
  syncEntrySchema,
  syncSchema,
  idParamSchema,
  listQuerySchema,
};
