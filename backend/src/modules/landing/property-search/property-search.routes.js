const express = require("express");
const { validateParams, validateQuery } = require("../../../middlewares/validate.middleware");
const controller = require("./property-search.controller");
const { searchQuerySchema, propertyIdParamSchema } = require("./property-search.validation");

const router = express.Router();

router.get("/", validateQuery(searchQuerySchema), controller.searchProperties);
router.get("/:id", validateParams(propertyIdParamSchema), controller.getPropertyDetails);

module.exports = router;
