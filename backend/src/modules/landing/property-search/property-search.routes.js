const express = require("express");
const { validateParams, validateQuery } = require("../../../middlewares/validate.middleware");
const controller = require("./property-search.controller");
const {
  searchQuerySchema,
  propertyIdParamSchema,
  shortCodeParamSchema,
  suggestionsQuerySchema,
} = require("./property-search.validation");

const router = express.Router();

router.get("/", validateQuery(searchQuerySchema), controller.searchProperties);
router.get("/suggestions", validateQuery(suggestionsQuerySchema), controller.getSearchSuggestions);
router.get("/short/:code", validateParams(shortCodeParamSchema), controller.getPropertyDetailsByShortCode);
router.get("/share/:id", validateParams(propertyIdParamSchema), controller.getPropertyShare);
router.get("/:id", validateParams(propertyIdParamSchema), controller.getPropertyDetails);

module.exports = router;
