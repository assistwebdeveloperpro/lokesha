const Joi = require("joi");
const c = require("./property.constants");
const f = require("./property-payload.fields");

const { text } = f;

const MAX_FLOOR_PLANS = 20;
const MAX_SPECIFICATIONS = 200;
const MAX_VARIANTS = 50;
const MAX_PROJECT_ITEMS = 50;

const listOf = (item, max) => Joi.array().items(item).max(max).default([]);
const keyList = Joi.array().items(Joi.string().trim().max(50)).unique().max(100).default([]);

const filesSchema = Joi.object({
  media: listOf(
    Joi.object({
      path: Joi.string().max(255).required(),
      category: Joi.string().valid(...c.MEDIA_CATEGORIES).required(),
      originalName: text(255),
    }),
    c.LIMITS.maxMediaPerDraft
  ),
  floorPlans: listOf(
    Joi.object({
      path: Joi.string().max(255).required(),
      label: text(100),
      planType: Joi.string().valid(...c.FLOOR_PLAN_TYPES).default("2d"),
      originalName: text(255),
    }),
    MAX_FLOOR_PLANS
  ),
  brochure: Joi.object({
    path: Joi.string().max(255).required(),
    originalName: text(255),
  }),
}).default({ media: [], floorPlans: [] });

const projectSchema = Joi.object({
  ...f.PROJECT,
  highlights: listOf(Joi.object({ text: text(255).required() }), MAX_PROJECT_ITEMS),
  primeLocations: listOf(
    Joi.object({ text: text(255).required(), distance: text(50) }),
    MAX_PROJECT_ITEMS
  ),
  faqs: listOf(
    Joi.object({ question: text(300).required(), answer: text(5000).required() }),
    MAX_PROJECT_ITEMS
  ),
});

const builderBlockSchema = Joi.object({
  listing: Joi.object(f.BUILDER_LISTING).default({}),
  specifications: listOf(
    Joi.object({
      groupTitle: text(100).required(),
      label: text(150).required(),
      value: text(500).required(),
      isCustom: Joi.boolean().default(false),
    }),
    MAX_SPECIFICATIONS
  ),
}).default({ listing: {}, specifications: [] });

function buildEnvelopeSchema(isBuilderPost) {
  return Joi.object({
    listingType: Joi.string().valid(...c.LISTING_TYPES).required(),
    propertyType: Joi.string().valid(...c.PROPERTY_TYPES).required(),
    postingAs: Joi.string().valid("builder"),
    address: Joi.object(f.ADDRESS).required(),
    project: isBuilderPost ? projectSchema.required() : Joi.forbidden().messages({
      "any.unknown": "Project details are only allowed for builder listings",
    }),
    listings: Joi.array()
      .items(Joi.object().unknown(true))
      .min(1)
      .max(isBuilderPost ? c.LIMITS.maxListingsPerSubmission : 1)
      .required(),
  });
}

function buildDetailFields(rule, { listingType, builder }) {
  let fields = { ...f.TYPE_FIELDS[rule.typeTable] };
  const hidden = [];

  if (!rule.penthouse) hidden.push(...f.PENTHOUSE_KEYS);
  if (rule.typeTable === "commercial" && !rule.hospitality) hidden.push(...f.HOSPITALITY_KEYS);
  if (rule.bedrooms === "forbidden") hidden.push("bedrooms");
  if (!rule.floorNumber) hidden.push("floorNumber");
  if (listingType === "rent-lease") hidden.push(...f.SALE_ONLY_DETAIL_KEYS);
  if (builder) hidden.push(...f.BUILDER_HIDDEN_DETAIL_KEYS);

  fields = f.omitKeys(fields, hidden);

  if (rule.bedrooms === "required" && !builder) {
    fields.bedrooms = fields.bedrooms.required();
  }
  return fields;
}

function buildSelectionsSchema(rule) {
  const keys = Object.entries(c.OPTION_GROUPS)
    .filter(([, group]) => rule.selections.includes(group))
    .map(([key]) => [key, keyList]);

  return Joi.object(Object.fromEntries(keys)).default({});
}

function buildVariantSchema(rule) {
  return Joi.object({
    ...f.VARIANT,
    details: Joi.object(f.VARIANT_TYPE[rule.typeTable] ?? {}).default({}),
    charges: Joi.object(f.VARIANT_CHARGES),
  });
}

function buildListingSchema(propertyType, subType, rule, listingType, builder) {
  const plotFields = { ...f.PLOT_DETAILS };
  if (rule.plotArea === "required" && !builder) {
    plotFields.plotArea = plotFields.plotArea.required();
  }

  const saleFields = { ...f.SALE };
  if (!builder) {
    saleFields.expectedPrice = saleFields.expectedPrice.required();
  }

  const shape = {
    propertySubType: Joi.string().valid(subType).required(),
    description: Joi.string().trim().min(1).max(5000).required(),
    facing: f.oneOf(c.FACING),
    availableFrom: f.date,
    construction: Joi.object({
      status: f.oneOf(c.CONSTRUCTION_STATUS),
      possessionDate: f.date,
    }).default({}),
    details: Joi.object(buildDetailFields(rule, { listingType, builder })).default({}),
    pricing: Joi.object(listingType === "sale" ? saleFields : f.RENT).required(),
    selections: buildSelectionsSchema(rule),
    amenities: Joi.object({ amenities: keyList, furnishing: keyList }).default({
      amenities: [],
      furnishing: [],
    }),
    files: filesSchema,
  };

  if (rule.plotDetails) {
    shape.plotDetails = Joi.object(plotFields).default({});
  }
  if (builder) {
    shape.variants = Joi.array().items(buildVariantSchema(rule)).min(1).max(MAX_VARIANTS).required();
    shape.builder = builderBlockSchema;
  }

  return Joi.object(shape);
}

const listingSchemaCache = new Map();

function getListingSchema(propertyType, subType, rule, listingType, builder) {
  const key = `${propertyType}:${subType}:${listingType}:${builder}`;
  if (!listingSchemaCache.has(key)) {
    listingSchemaCache.set(key, buildListingSchema(propertyType, subType, rule, listingType, builder));
  }
  return listingSchemaCache.get(key);
}

function collectErrors(error, prefix, fields) {
  if (!error) return;

  for (const detail of error.details) {
    const key = [...prefix, ...detail.path].join(".");
    if (key && !fields[key]) fields[key] = detail.message;
  }
}

// Rules that span several fields and cannot be expressed per key
function crossCheckListing(listing, { listingType, builder }, prefix, fields) {
  const { details = {}, builder: builderBlock } = listing;
  const add = (path, message) => {
    fields[[...prefix, path].join(".")] = message;
  };

  if (details.floorNumber !== undefined && details.totalFloors !== undefined && details.floorNumber > details.totalFloors) {
    add("details.floorNumber", "Floor number cannot be more than total floors");
  }
  if (listingType === "sale" && details.isLeasedOut && !details.leaseContractTill) {
    add("details.leaseContractTill", "Lease contract till is required when leased out");
  }
  if (builder) {
    const { priceMin, priceMax } = builderBlock.listing;
    if (priceMin !== undefined && priceMax !== undefined && priceMin > priceMax) {
      add("builder.listing.priceMin", "Minimum price cannot be more than maximum price");
    }
  }
}

// Returns the cleaned payload and a { path: message } map of every problem found
function validateCompletePayload(payload, { isBuilderPost }) {
  const fields = {};
  const { error, value } = buildEnvelopeSchema(isBuilderPost).validate(payload, {
    abortEarly: false,
    stripUnknown: true,
  });
  collectErrors(error, [], fields);

  const { listingType, propertyType } = value ?? {};
  const typesAreValid = c.LISTING_TYPES.includes(listingType) && c.PROPERTY_TYPES.includes(propertyType);
  if (!typesAreValid || !Array.isArray(value.listings)) {
    return { value: null, fields };
  }

  if (isBuilderPost && !c.isBuilderAllowed(propertyType, listingType)) {
    fields.listingType = "Builder listings are only available for sale of non PG properties";
    return { value: null, fields };
  }

  const seenSubTypes = new Set();
  const listings = value.listings.map((listing, index) => {
    const prefix = ["listings", index];
    const subType = listing?.propertySubType ?? (propertyType === "pg-co-living" ? c.DEFAULT_PG_SUB_TYPE : undefined);
    const rule = c.getRule(propertyType, subType);

    if (!rule) {
      fields[`listings.${index}.propertySubType`] = "Invalid property sub type";
      return listing;
    }
    if (!rule.listingTypes.includes(listingType)) {
      fields[`listings.${index}.propertySubType`] = "This sub type is not available for the selected listing type";
      return listing;
    }
    if (seenSubTypes.has(subType)) {
      fields[`listings.${index}.propertySubType`] = "Each sub type can be added only once";
      return listing;
    }
    seenSubTypes.add(subType);

    const context = { listingType, builder: isBuilderPost };
    const schema = getListingSchema(propertyType, subType, rule, listingType, isBuilderPost);
    const result = schema.validate({ ...listing, propertySubType: subType }, { abortEarly: false, stripUnknown: true });

    collectErrors(result.error, prefix, fields);
    if (result.value) crossCheckListing(result.value, context, prefix, fields);
    return result.value;
  });

  return { value: { ...value, listings }, fields };
}

module.exports = { validateCompletePayload };
