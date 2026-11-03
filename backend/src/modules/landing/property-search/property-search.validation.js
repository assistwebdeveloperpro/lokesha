const Joi = require("joi");
const c = require("./property-search.constants");

// Query values arrive as comma separated strings
function csvList(itemSchema) {
  return Joi.string()
    .empty("")
    .custom((value, helpers) => {
      const items = [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))];
      if (items.length > c.MAX_LIST_ITEMS) {
        return helpers.message(`"${helpers.state.path.join(".")}" has too many values`);
      }

      const { error, value: converted } = Joi.array().items(itemSchema).validate(items);
      return error ? helpers.message(error.message) : converted;
    })
    .default([]);
}

const rangeMax = (minKey) =>
  Joi.number().when(minKey, { is: Joi.exist(), then: Joi.number().min(Joi.ref(minKey)), otherwise: Joi.number().min(0) });

const textItem = Joi.string().max(100);
const numberItem = Joi.number().integer().min(0).max(9999);

const columnFilters = Object.fromEntries(
  Object.entries(c.COLUMN_FILTERS).map(([key, { numeric }]) => [key, csvList(numeric ? numberItem : textItem)])
);
const selectionFilters = Object.fromEntries(Object.keys(c.SELECTION_FILTERS).map((key) => [key, csvList(textItem)]));
const flagFilters = Object.fromEntries(Object.keys(c.FLAG_FILTERS).map((key) => [key, Joi.boolean()]));

const filterFields = {
  listingType: Joi.string().valid(...c.LISTING_TYPES).required(),
  category: Joi.string().valid(...Object.keys(c.CATEGORY_TO_DB)).required(),
  city: Joi.string().trim().max(100),
  localities: csvList(textItem),
  projects: csvList(textItem),
  bedrooms: csvList(Joi.number().integer().min(1).max(20)),
  subTypes: csvList(Joi.string().max(40)),
  constructionStatuses: csvList(textItem),
  saleTypes: csvList(textItem),
  occupancies: csvList(textItem),
  genders: csvList(textItem),
  postedBy: csvList(Joi.string().valid(...c.POSTING_AS_VALUES)),
  budgetMin: Joi.number().min(0),
  budgetMax: rangeMax("budgetMin"),
  areaMin: Joi.number().min(0),
  areaMax: rangeMax("areaMin"),
  postedSince: Joi.string().valid(...Object.keys(c.POSTED_SINCE_INTERVALS)),
  availableFrom: Joi.string().valid("immediate", ...Object.keys(c.AVAILABLE_WITHIN_DAYS)),
  hasRera: Joi.boolean(),
  hasPhotos: Joi.boolean(),
  hasVideos: Joi.boolean(),
  priceNegotiable: Joi.boolean(),
  carParkingAvailable: Joi.boolean(),
  amenities: csvList(textItem),
  furnishingItems: csvList(textItem),
  facings: csvList(textItem),
  ...columnFilters,
  ...selectionFilters,
  ...flagFilters,
};

const searchQuerySchema = Joi.object({
  ...filterFields,
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(c.MAX_PAGE_SIZE).default(c.DEFAULT_PAGE_SIZE),
  sort: Joi.string().valid(...c.SORTS).default("recent"),
});

const propertyIdParamSchema = Joi.object({
  id: Joi.string().guid().required(),
});

module.exports = { searchQuerySchema, propertyIdParamSchema };
