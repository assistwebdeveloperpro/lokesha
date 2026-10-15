const Joi = require("joi");
const c = require("./property.constants");

const POSSESSION_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const optionalText = (max) => Joi.string().trim().max(max).allow("", null);
const optionalAmount = Joi.number().min(0).max(99999999999999).allow(null);
const uniqueList = (allowed) => Joi.array().items(Joi.string().valid(...allowed)).unique().default([]);

function todayIsoDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function notPastDate(value, helpers) {
  return value < todayIsoDate()
    ? helpers.message("Possession date cannot be in the past")
    : value;
}

function notPastAvailableDate(value, helpers) {
  return value < todayIsoDate()
    ? helpers.message("Available from date cannot be in the past")
    : value;
}

const addressSchema =Joi.object({
  blockNo: optionalText(50),
  flatNumber: optionalText(50),
  projectName: Joi.string().trim().max(255).required(),
  locality: Joi.string().trim().max(255).required(),
  addressLine2: optionalText(255),
  landmark: optionalText(255),
  pinCode: Joi.string()
    .trim()
    .pattern(/^\d{6}$/)
    .required()
    .messages({ "string.pattern.base": "Pincode must be 6 digits" }),
  city: optionalText(100),
  state: Joi.string().trim().max(100).required(),
  propertyDescription: Joi.string().trim().required(),
}).required();

function buildDetailsSchema({ enforceFuturePossession, isRent }) {
  const possessionDateRule = Joi.string().pattern(POSSESSION_DATE_PATTERN);
  const possessionDateWhenNew = enforceFuturePossession
    ? possessionDateRule.custom(notPastDate).required()
    : possessionDateRule.required();
  const availableFromRule = enforceFuturePossession
    ? Joi.string().pattern(POSSESSION_DATE_PATTERN).custom(notPastAvailableDate).required()
    : Joi.string().pattern(POSSESSION_DATE_PATTERN).required();

  const transactionKeys = isRent
    ? {
        propertyTransaction: Joi.any().valid(null).optional(),
        constructionStatus: Joi.any().valid(null).optional(),
        possessionDate: Joi.any().valid(null).optional(),
        ageOfConstruction: Joi.string().valid(...c.AGES_OF_CONSTRUCTION).required(),
      }
    : {
        propertyTransaction: Joi.string().valid(...c.PROPERTY_TRANSACTIONS).required(),
        constructionStatus: Joi.when("propertyTransaction", {
          is: "new",
          then: Joi.string().valid(...c.CONSTRUCTION_STATUSES).required(),
          otherwise: Joi.any().valid(null).optional(),
        }),
        possessionDate: Joi.when("propertyTransaction", {
          is: "new",
          then: possessionDateWhenNew,
          otherwise: Joi.any().valid(null).optional(),
        }),
        ageOfConstruction: Joi.when("propertyTransaction", {
          is: "resale",
          then: Joi.string().valid(...c.AGES_OF_CONSTRUCTION).required(),
          otherwise: Joi.any().valid(null).optional(),
        }),
      };

  const rentKeys = isRent
    ? {
        fullHouse: Joi.boolean().default(false),
        sharingBasis: Joi.boolean().default(false),
        availableFrom: availableFromRule,
        interiorModificationAllowed: Joi.boolean().default(false),
        tenantPreferences: uniqueList(c.TENANT_PREFERENCES).min(1).required(),
      }
    : {
        fullHouse: Joi.boolean().valid(false).default(false),
        sharingBasis: Joi.boolean().valid(false).default(false),
        availableFrom: Joi.any().valid(null).optional(),
        interiorModificationAllowed: Joi.boolean().valid(false).default(false),
        tenantPreferences: Joi.array().max(0).default([]),
      };

  return Joi.object({
    carpetArea: Joi.number().greater(0).max(9999999999).required(),
    carpetAreaUnit: Joi.string().valid(...c.AREA_UNITS).required(),
    superBuildUpArea: Joi.number().greater(0).max(9999999999).allow(null),
    superBuildUpUnit: Joi.string().valid(...c.AREA_UNITS).required(),
    ...transactionKeys,
    ...rentKeys,
    bedrooms: Joi.number().integer().min(1).max(10).required(),
    balconies: Joi.number().integer().min(0).max(10).required(),
    totalFloors: Joi.number().integer().min(1).max(200).required(),
    floorNumber: Joi.number()
      .integer()
      .min(0)
      .max(Joi.ref("totalFloors"))
      .required()
      .messages({ "number.max": "Floor number cannot exceed total floors" }),
    bathrooms: Joi.number().integer().min(1).max(10).required(),
    lift: Joi.number().integer().min(0).max(10).allow(null),
  }).required();
}

const detailsSchemaFor = (enforceFuturePossession) =>
  Joi.when("listingType", {
    is: "rent-lease",
    then: buildDetailsSchema({ enforceFuturePossession, isRent: true }),
    otherwise: buildDetailsSchema({ enforceFuturePossession, isRent: false }),
  }).required();

const createDetailsSchema = detailsSchemaFor(true);
const updateDetailsSchema = detailsSchemaFor(false);

const amenitiesSchema = Joi.object({
  furnishingStatus: Joi.string().valid(...c.FURNISHING_STATUSES).allow(null),
  furnishing: Joi.when("furnishingStatus", {
    is: Joi.valid("furnished", "semi-furnished"),
    then: uniqueList(c.FURNISHING_ITEMS),
    otherwise: Joi.array().max(0).default([]),
  }),
  amenities: uniqueList(c.AMENITIES),
  facing: Joi.string().valid(...c.FACINGS).allow(null),
  carParkingAvailable: Joi.boolean().default(false),
  carParking: Joi.when("carParkingAvailable", {
    is: true,
    then: Joi.number()
      .integer()
      .min(1)
      .max(10)
      .required()
      .messages({ "number.base": "Car parking count is required when parking is available" }),
    otherwise: Joi.number().integer().allow(null),
  }),
  clubMembership: Joi.boolean().default(false),
  reraNumber: optionalText(100),
  openSides: Joi.number().integer().min(0).max(20).allow(null),
}).default({});

const salePricingSchema = Joi.object({
  expectedPrice: Joi.number().min(0).max(99999999999999).required(),
  priceInclusion: uniqueList(c.PRICE_INCLUSIONS),
  priceNegotiable: Joi.boolean().default(false),
  transferFee: optionalAmount,
  bookingAmount: Joi.number().min(0).max(99999999999999).required(),
  maintenanceCharges: optionalAmount,
  benefitsRemarks: optionalText(5000),
}).required();

const rentPricingSchema = Joi.object({
  monthlyRent: Joi.number().min(0).max(99999999999999).required(),
  noticePeriod: Joi.number().integer().min(0).max(60).required(),
  depositAmount: Joi.number().min(0).max(99999999999999).required(),
  maintenanceCharges: optionalAmount,
  benefitsRemarks: optionalText(5000),
}).required();

const pricingSchema = Joi.when("listingType", {
  is: "rent-lease",
  then: rentPricingSchema,
  otherwise: salePricingSchema,
});

// Sub type must belong to the property type; PG/Co-Living has none
function validateSubType(value, helpers) {
  const allowed = c.SUB_TYPES_BY_PROPERTY_TYPE[value.propertyType];
  // Multiple sub types arrive comma-separated
  const subTypes = [...new Set((value.propertySubType || "").split(",").filter(Boolean))];

  if (allowed.length === 0 && subTypes.length > 0) {
    return helpers.message("Property sub type is not allowed for this property type");
  }
  if (subTypes.some((subType) => !allowed.includes(subType))) {
    return helpers.message("Property sub type is invalid for the selected property type");
  }
  return { ...value, propertySubType: subTypes.join(",") || null };
}

const propertyBaseKeys = {
  listingType: Joi.string().valid(...c.LISTING_TYPES).required(),
  propertyType: Joi.string().valid(...c.PROPERTY_TYPES).required(),
  propertySubType: Joi.string().max(255).allow("", null),
  address: addressSchema,
  amenities: amenitiesSchema,
  pricing: pricingSchema.required(),
};

const createPropertySchema = Joi.object({
  ...propertyBaseKeys,
  details: createDetailsSchema,
  mediaCategories: Joi.array()
    .items(Joi.string().valid(...c.MEDIA_CATEGORIES))
    .max(c.MAX_MEDIA_FILES)
    .default([]),
}).custom(validateSubType);

const updatePropertySchema = Joi.object({
  ...propertyBaseKeys,
  details: updateDetailsSchema,
}).custom(validateSubType);

const addMediaSchema = Joi.object({
  mediaCategories: Joi.array()
    .items(Joi.string().valid(...c.MEDIA_CATEGORIES))
    .max(c.MAX_MEDIA_FILES)
    .default([]),
});

const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(12),
  listingType: Joi.string().valid(...c.LISTING_TYPES),
  propertyType: Joi.string().valid(...c.PROPERTY_TYPES),
  city: Joi.string().trim().max(100),
  status: Joi.string().valid(...c.PROPERTY_STATUSES),
});

module.exports = {
  createPropertySchema,
  updatePropertySchema,
  addMediaSchema,
  listQuerySchema,
};
