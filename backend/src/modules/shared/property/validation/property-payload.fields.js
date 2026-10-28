const Joi = require("joi");
const c = require("../constants/property.constants");

const MAX_AREA = 9999999999.99;
const MAX_AMOUNT = 999999999999.99;
const ABSENT = ["", null];

const text = (max) => Joi.string().trim().max(max).empty(ABSENT);
const oneOf = (values) => Joi.string().valid(...values).empty(ABSENT);
const flag = Joi.boolean().empty(ABSENT);
const intRange = (min, max) => Joi.number().integer().min(min).max(max).empty(ABSENT);
const area = Joi.number().positive().max(MAX_AREA).precision(2).empty(ABSENT);
const amount = Joi.number().min(0).max(MAX_AMOUNT).precision(2).empty(ABSENT);
const price = Joi.number().positive().max(MAX_AMOUNT).precision(2).empty(ABSENT);
const percent = Joi.number().min(0).max(100).precision(2).empty(ABSENT);
const meters = Joi.number().positive().max(9999.99).precision(2).empty(ABSENT);
const date = Joi.date().iso().raw().empty(ABSENT);
const time = Joi.string().pattern(/^([01]\d|2[0-3]):[0-5]\d$/).empty(ABSENT);
const url = Joi.string().trim().uri().max(500).empty(ABSENT);

const standardUnit = oneOf(c.STANDARD_AREA_UNITS);
const landUnit = oneOf(c.LAND_AREA_UNITS);

const areaPair = (name, unit = standardUnit) => ({ [name]: area, [`${name}Unit`]: unit });

const RESIDENTIAL = {
  furnishingStatus: oneOf(c.FURNISHING_STATUS),
  ...areaPair("carpetArea"),
  ...areaPair("superBuiltUpArea"),
  bedrooms: intRange(1, 10),
  balconies: intRange(0, 10),
  bathrooms: intRange(1, 10),
  lifts: intRange(0, 10),
  totalFloors: intRange(0, 50),
  basementFloors: intRange(0, 3),
  floorNumber: intRange(0, 50),
  ageOfConstruction: oneOf(c.AGE_OF_CONSTRUCTION),
  propertyTransaction: oneOf(c.PROPERTY_TRANSACTION),
  carParkingCount: intRange(0, 20),
  clubMembership: flag,
  openSides: intRange(1, 4),
  isFullHouse: flag,
  isSharingBasis: flag,
  ...areaPair("terraceArea"),
  penthouseType: oneOf(c.PENTHOUSE_TYPE),
};
const PENTHOUSE_KEYS = ["terraceArea", "terraceAreaUnit", "penthouseType"];

const COMMERCIAL = {
  furnishingStatus: oneOf(c.FURNISHING_STATUS),
  ...areaPair("carpetArea"),
  ...areaPair("superBuiltUpArea"),
  totalFloors: intRange(0, 50),
  floorNumber: intRange(0, 50),
  ageOfConstruction: oneOf(c.AGE_OF_CONSTRUCTION),
  propertyTransaction: oneOf(c.PROPERTY_TRANSACTION),
  cabins: intRange(1, 10),
  entranceWidthM: meters,
  washrooms: intRange(1, 8),
  roadFacing: oneOf(c.ROAD_FACING),
  hasPantry: flag,
  hasCafeteria: flag,
  isCornerShop: flag,
  carParkingCount: intRange(0, 20),
  clubMembership: flag,
  openSides: intRange(1, 4),
  managedBy: oneOf(c.MANAGED_BY),
  isLeasedOut: flag,
  leaseContractTill: date,
  leaseAmount: amount,
  leaseYearlyIncrementPercent: percent,
  bedrooms: intRange(1, 10),
  balconies: intRange(0, 10),
  bathrooms: intRange(1, 10),
  foodChargeType: oneOf(c.FOOD_CHARGE_TYPE),
  starCategory: intRange(1, 7),
};
const HOSPITALITY_KEYS = ["bedrooms", "balconies", "bathrooms", "foodChargeType", "starCategory"];

const PG = {
  pgName: text(150).required(),
  pgGender: oneOf(c.PG_GENDER).required(),
  pgPresentIn: oneOf(c.PG_PRESENT_IN),
  operatingSinceYear: intRange(1900, 2100),
  entryTill: time,
  foodChargeType: oneOf(c.FOOD_CHARGE_TYPE),
  managedBy: oneOf(c.MANAGED_BY),
  furnishingStatus: oneOf(c.FURNISHING_STATUS),
  ...areaPair("carpetArea"),
  ...areaPair("superBuiltUpArea"),
  bedrooms: intRange(1, 10),
  balconies: intRange(0, 10),
  bathrooms: intRange(1, 10),
  totalFloors: intRange(0, 50),
  floorNumber: intRange(0, 50),
  ageOfConstruction: oneOf(c.AGE_OF_CONSTRUCTION),
  roadFacing: oneOf(c.ROAD_FACING),
  carParkingCount: intRange(0, 20),
  openSides: intRange(1, 4),
  hasPantry: flag,
  hasCafeteria: flag,
};

const PLOT = {
  propertyTransaction: oneOf(c.PROPERTY_TRANSACTION),
  anyConstruction: flag,
  boundaryWallMade: flag,
  cornerPlot: flag,
  entranceWidthM: meters,
  roadFacing: oneOf(c.ROAD_FACING),
  openSides: intRange(1, 4),
  clubMembership: flag,
  managedBy: oneOf(c.MANAGED_BY),
  isLeasedOut: flag,
  leaseContractTill: date,
};

const LAND = omitKeys(PLOT, ["clubMembership"]);

const PLOT_DETAILS = {
  ...areaPair("plotArea", landUnit),
  ...areaPair("plotLength", landUnit),
  ...areaPair("plotBreadth", landUnit),
  roadWidthM: meters,
  floorsAllowed: intRange(0, 50),
};

const SALE = {
  expectedPrice: price,
  priceNegotiable: flag,
  transferFee: amount,
  bookingAmount: amount,
  maintenanceCharges: amount,
  assuredReturnPercent: percent,
  includesCarParking: flag,
  includesClubMembership: flag,
  includesPlc: flag,
  reraNumber: text(50),
  benefitsRemarks: text(2000),
};

const RENT = {
  monthlyRent: price.required(),
  depositAmount: amount,
  maintenanceCharges: amount,
  noticePeriodMonths: intRange(0, 24),
  yearlyIncrementPercent: percent,
  priceNegotiable: flag,
  interiorModificationAllowed: flag,
  benefitsRemarks: text(2000),
};

// Keys of the type tables that only apply to sale listings
const SALE_ONLY_DETAIL_KEYS = ["propertyTransaction", "isLeasedOut", "leaseContractTill", "leaseAmount", "leaseYearlyIncrementPercent"];

// Keys the builder form never asks for on a listing; units come from variants
const BUILDER_HIDDEN_DETAIL_KEYS = ["bedrooms", "balconies", "bathrooms", "lifts", "floorNumber"];

const BUILDER_LISTING = {
  areaUnit: landUnit,
  avgPrice: price,
  projectSize: area,
  pricePerSqft: price,
  priceMin: price,
  priceMax: price,
  carpetAreaMax: area,
  superBuiltUpMax: area,
  plotAreaMax: area,
  terraceAreaMax: area,
  distanceFromCityKm: Joi.number().min(0).max(999999.99).precision(2).empty(ABSENT),
  conversionStatus: oneOf(c.CONVERSION_STATUS),
  naConversionDone: Joi.boolean().empty(ABSENT),
  storageCapacityTons: area,
  powerLoadKva: area,
  loadingBays: intRange(0, 1000),
  clearHeightFt: meters,
};

const VARIANT = {
  label: text(100),
  size: area,
  sizeUnit: landUnit,
  price,
  unitsAvailable: intRange(0, 100000),
};

const VARIANT_TYPE = {
  residential: {
    bhk: intRange(1, 10),
    bathrooms: intRange(1, 10),
    ...areaPair("carpetArea"),
    carpetAreaMax: area,
    ...areaPair("superBuiltUpArea"),
    superBuiltUpAreaMax: area,
  },
  commercial: {
    ...areaPair("carpetArea"),
    cabins: intRange(1, 10),
    washrooms: intRange(1, 8),
  },
  plot: {
    ...areaPair("plotLength", landUnit),
    ...areaPair("plotBreadth", landUnit),
    facing: oneOf(c.FACING),
  },
  land: {
    ...areaPair("plotLength", landUnit),
    ...areaPair("plotBreadth", landUnit),
  },
};

const VARIANT_CHARGES = {
  carParkingAvailable: flag,
  carParkingCount: intRange(0, 20),
  clubMembership: flag,
  transferFee: amount,
  bookingAmount: amount,
  maintenanceCharges: amount,
  benefitsRemarks: text(2000),
};

const PROJECT = {
  projectName: text(150).required(),
  projectType: oneOf(c.PROJECT_TYPE),
  developerName: text(150),
  launchDate: date,
  totalUnits: intRange(1, 1000000),
  totalBlocks: intRange(1, 100000),
  projectAreaAcres: area,
  openSpacePercent: percent,
  approvedBy: text(150),
  reraLink: url,
  virtualTourLink: url,
  videoLink: url,
  paymentPlan: oneOf(c.PAYMENT_PLAN),
  approvedBanks: text(1000),
};

const ADDRESS = {
  projectName: text(150),
  blockNo: text(50),
  flatNumber: text(50),
  locality: text(150).required(),
  addressLine2: text(255),
  landmark: text(150),
  pinCode: Joi.string().trim().pattern(/^[0-9]{6}$/).required().messages({
    "string.pattern.base": "Pin code must be 6 digits",
  }),
  city: text(100),
  state: text(100).required(),
};

const toSnakeCase = (key) => key.replace(/[A-Z0-9]+/g, (match) => `_${match.toLowerCase()}`);

// Validated camelCase object to a column map; undefined keys fall back to column defaults
function toRow(source = {}) {
  return Object.fromEntries(
    Object.entries(source)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [toSnakeCase(key), value])
  );
}

const TYPE_FIELDS = { residential: RESIDENTIAL, commercial: COMMERCIAL, pg: PG, plot: PLOT, land: LAND };

// pg returns date columns as local-midnight Date objects
function formatDate(value) {
  if (!(value instanceof Date)) return String(value).slice(0, 10);

  const pad = (part) => String(part).padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
}

function fromColumn(schema, value) {
  if (schema.type === "number") return Number(value);
  if (schema.type === "date") return formatDate(value);
  // time columns come back as HH:MM:SS
  if (schema === PG.entryTill) return String(value).slice(0, 5);
  return value;
}

// Inverse of toRow: only the columns named in fields are read, nulls are left out
function fromRow(row, fields) {
  if (!row) return {};

  return Object.fromEntries(
    Object.entries(fields)
      .map(([key, schema]) => [key, row[toSnakeCase(key)]])
      .filter(([, value]) => value !== null && value !== undefined)
      .map(([key, value]) => [key, fromColumn(fields[key], value)])
  );
}

function omitKeys(fields, keys) {
  return Object.fromEntries(Object.entries(fields).filter(([key]) => !keys.includes(key)));
}

module.exports = {
  RESIDENTIAL,
  COMMERCIAL,
  PG,
  PLOT,
  LAND,
  PLOT_DETAILS,
  SALE,
  RENT,
  PENTHOUSE_KEYS,
  HOSPITALITY_KEYS,
  SALE_ONLY_DETAIL_KEYS,
  BUILDER_HIDDEN_DETAIL_KEYS,
  BUILDER_LISTING,
  VARIANT,
  VARIANT_TYPE,
  VARIANT_CHARGES,
  PROJECT,
  ADDRESS,
  text,
  oneOf,
  date,
  TYPE_FIELDS,
  toSnakeCase,
  toRow,
  fromRow,
  omitKeys,
};
