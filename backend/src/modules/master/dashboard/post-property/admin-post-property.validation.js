const Joi = require("joi");
const { createPropertySchema } = require("../../../landing/property/property.validation");
const c = require("./admin-post-property.constants");

const LAUNCH_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const optionalText = (max) => Joi.string().trim().max(max).allow("", null);
const optionalCount = Joi.number().integer().min(0).max(1000000).allow(null);
const optionalDecimal = (max) => Joi.number().min(0).max(max).allow(null);
const optionalAmount = optionalDecimal(99999999999999);

// Unit type is a residential type or a commercial/plot/land sub type label; BHK is residential only
const unitTypeSchema = Joi.string().trim().max(100);

const configurationSchema = Joi.object({
  unitType: unitTypeSchema.required(),
  bhk: Joi.string().valid(...c.BHK_OPTIONS).allow(null),
});

const availableSizeSchema = Joi.object({
  bhk: Joi.string().valid(...c.BHK_OPTIONS).allow(null),
  unitType: unitTypeSchema.allow(null),
  size: optionalDecimal(9999999999),
  price: optionalAmount,
});

const primeLocationSchema = Joi.object({
  place: Joi.string().trim().max(255).required(),
  distance: optionalText(50),
});

const highlightSchema = Joi.object({
  text: Joi.string().trim().max(255).required(),
});

const faqSchema = Joi.object({
  question: Joi.string().trim().max(500).required(),
  answer: Joi.string().trim().max(5000).required(),
});

const list = (itemSchema) => Joi.array().items(itemSchema).max(c.MAX_LIST_ITEMS).default([]);

const projectDetailsSchema = Joi.object({
  developerName: optionalText(255),
  launchDate: Joi.string().pattern(LAUNCH_DATE_PATTERN).allow(null),
  totalUnits: optionalCount,
  totalBlocks: optionalCount,
  projectArea: optionalDecimal(9999999999),
  openSpacePercent: Joi.number().min(0).max(100).allow(null),
  carpetAreaMax: optionalDecimal(9999999999),
  superBuildUpMax: optionalDecimal(9999999999),
  priceMin: optionalAmount,
  priceMax: optionalAmount,
  pricePerSqft: optionalAmount,
  paymentPlan: Joi.string().valid(...c.PAYMENT_PLANS).allow(null),
  approvedBanks: optionalText(500),
  videoLink: Joi.string().trim().uri({ scheme: ["http", "https"] }).max(500).allow("", null),
  configurations: list(configurationSchema),
  availableSizes: list(availableSizeSchema),
  primeLocationHighlights: list(primeLocationSchema),
  projectHighlights: list(highlightSchema),
  faqs: list(faqSchema),
}).default({});

// Cross-field rules that depend on the standard property payload
function validateProjectRules(value, helpers) {
  const project = value.projectDetails || {};
  const isRent = value.listingType === "rent-lease";

  if (isRent && c.SALE_ONLY_PROJECT_FIELDS.some((key) => project[key] !== null && project[key] !== undefined && project[key] !== "")) {
    return helpers.message("Project pricing is only allowed for sale listings");
  }
  if (project.priceMin != null && project.priceMax != null && project.priceMax < project.priceMin) {
    return helpers.message("Maximum price cannot be less than minimum price");
  }
  if (project.carpetAreaMax != null && project.carpetAreaMax < value.details.carpetArea) {
    return helpers.message("Carpet area maximum cannot be less than carpet area");
  }
  if (
    project.superBuildUpMax != null &&
    value.details.superBuildUpArea != null &&
    project.superBuildUpMax < value.details.superBuildUpArea
  ) {
    return helpers.message("Super built-up maximum cannot be less than super built-up area");
  }
  return value;
}

const adminCreatePropertySchema = createPropertySchema
  .keys({
    projectDetails: projectDetailsSchema,
    floorPlanLabels: Joi.array()
      .items(Joi.string().trim().max(100).allow(""))
      .max(c.MAX_FLOOR_PLANS)
      .default([]),
  })
  .custom(validateProjectRules);

const isBlank = (value) => value === undefined || value === null || String(value).trim() === "";

const SCALAR_KEYS = [
  "developerName", "launchDate", "totalUnits", "totalBlocks", "projectArea", "openSpacePercent",
  "carpetAreaMax", "superBuildUpMax", "priceMin", "priceMax", "pricePerSqft", "paymentPlan",
  "approvedBanks", "videoLink",
];
const LIST_KEYS = [
  "configurations", "availableSizes", "primeLocationHighlights", "projectHighlights", "faqs",
];

// Blank scalars become null and fully blank list rows are dropped before Joi runs
function normalizeProjectDetails(req, res, next) {
  const project = req.body?.projectDetails;
  if (!project || typeof project !== "object" || Array.isArray(project)) return next();

  SCALAR_KEYS.forEach((key) => {
    if (isBlank(project[key])) project[key] = null;
  });

  LIST_KEYS.forEach((key) => {
    if (!Array.isArray(project[key])) return;
    project[key] = project[key]
      .filter((row) => row && typeof row === "object")
      .map((row) => Object.fromEntries(Object.entries(row).map(([k, v]) => [k, isBlank(v) ? null : v])))
      .filter((row) => Object.values(row).some((v) => v !== null));
  });

  next();
}

module.exports = { adminCreatePropertySchema, normalizeProjectDetails };
