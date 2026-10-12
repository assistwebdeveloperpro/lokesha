const Joi = require("joi");
const c = require("./property.constants");

const POSSESSION_DATE_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

const optionalText = (max) => Joi.string().trim().max(max).allow("", null);
const optionalAmount = Joi.number().min(0).max(99999999999999).allow(null);
const uniqueList = (allowed) => Joi.array().items(Joi.string().valid(...allowed)).unique().default([]);

// Possession month must not be in the past
function notPastMonth(value, helpers) {
  const now = new Date();
  const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  return value < current ? helpers.message("Possession date cannot be in the past") : value;
}

const addressSchema = Joi.object({
  blockNo: optionalText(50),
  flatNumber: optionalText(50),
  societyName: Joi.string().trim().max(255).required(),
  locality: Joi.string().trim().max(255).required(),
  addressLine2: optionalText(255),
  landmark: optionalText(255),
  pinCode: Joi.string().trim().max(10).required(),
  city: optionalText(100),
  state: Joi.string().trim().max(100).required(),
  propertyDescription: Joi.string().trim().required(),
}).required();

const detailsSchema = Joi.object({
  carpetArea: Joi.number().greater(0).max(9999999999).required(),
  carpetAreaUnit: Joi.string().valid(...c.AREA_UNITS).required(),
  superBuildUpArea: Joi.number().greater(0).max(9999999999).allow(null),
  superBuildUpUnit: Joi.string().valid(...c.AREA_UNITS).allow(null),
  propertyTransaction: Joi.string().valid(...c.PROPERTY_TRANSACTIONS).required(),
  constructionStatus: Joi.when("propertyTransaction", {
    is: "new",
    then: Joi.string().valid(...c.CONSTRUCTION_STATUSES).required(),
    otherwise: Joi.any().valid(null).optional(),
  }),
  possessionDate: Joi.when("propertyTransaction", {
    is: "new",
    then: Joi.string().pattern(POSSESSION_DATE_PATTERN).custom(notPastMonth).required(),
    otherwise: Joi.any().valid(null).optional(),
  }),
  ageOfConstruction: Joi.when("propertyTransaction", {
    is: "resale",
    then: Joi.string().valid(...c.AGES_OF_CONSTRUCTION).required(),
    otherwise: Joi.any().valid(null).optional(),
  }),
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

const pricingSchema = Joi.object({
  expectedPrice: Joi.number().min(0).max(99999999999999).required(),
  priceInclusion: uniqueList(c.PRICE_INCLUSIONS),
  priceNegotiable: Joi.boolean().default(false),
  transferFee: optionalAmount,
  bookingAmount: Joi.number().min(0).max(99999999999999).required(),
  maintenanceCharges: optionalAmount,
  benefitsRemarks: optionalText(5000),
}).required();

// Sub type must belong to the property type; PG/Co-Living has none
function validateSubType(value, helpers) {
  const allowed = c.SUB_TYPES_BY_PROPERTY_TYPE[value.propertyType];
  const subType = value.propertySubType || "";

  if (allowed.length === 0 && subType) {
    return helpers.message("Property sub type is not allowed for this property type");
  }
  if (allowed.length > 0 && !allowed.includes(subType)) {
    return helpers.message("Property sub type is invalid for the selected property type");
  }
  return { ...value, propertySubType: subType || null };
}

const propertyBaseKeys = {
  listingType: Joi.string().valid(...c.LISTING_TYPES).required(),
  propertyType: Joi.string().valid(...c.PROPERTY_TYPES).required(),
  propertySubType: Joi.string().allow("", null),
  address: addressSchema,
  details: detailsSchema,
  amenities: amenitiesSchema,
  pricing: pricingSchema,
};

const createPropertySchema = Joi.object({
  ...propertyBaseKeys,
  mediaCategories: Joi.array()
    .items(Joi.string().valid(...c.MEDIA_CATEGORIES))
    .max(c.MAX_MEDIA_FILES)
    .default([]),
}).custom(validateSubType);

const updatePropertySchema = Joi.object(propertyBaseKeys).custom(validateSubType);

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
