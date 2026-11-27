const Joi = require("joi");
const { PROPERTY_TYPES } = require("../../../shared/property/constants/property.constants");
const c = require("./newly-launched-projects.constants");

const text = (max) => Joi.string().trim().max(max).allow("");

const searchQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(c.MAX_PAGE_SIZE).default(c.DEFAULT_PAGE_SIZE),
  keyword: text(150),
  city: text(100),
  locality: text(150),
  builder: text(150),
  propertyType: Joi.string().valid(...PROPERTY_TYPES),
  bhk: Joi.number().integer().min(1).max(20),
  priceMin: Joi.number().min(0),
  priceMax: Joi.number().when("priceMin", {
    is: Joi.exist(),
    then: Joi.number().min(Joi.ref("priceMin")),
    otherwise: Joi.number().min(0),
  }),
  possessionStatus: Joi.string().valid(...c.POSSESSION_STATUSES),
  listedBy: Joi.string().valid(...Object.keys(c.LISTED_BY_FILTERS)),
  launchPeriod: Joi.string().valid(...Object.keys(c.LAUNCH_PERIOD_FILTERS)),
});

const projectIdList = Joi.array()
  .items(Joi.string().guid().required())
  .min(1)
  .max(c.MAX_PROJECTS_PER_REQUEST)
  .unique()
  .required();

const addProjectsSchema = Joi.object({ projectIds: projectIdList });
const reorderSchema = Joi.object({ projectIds: projectIdList });

const projectIdParamSchema = Joi.object({ projectId: Joi.string().guid().required() });

module.exports = { searchQuerySchema, addProjectsSchema, reorderSchema, projectIdParamSchema };
