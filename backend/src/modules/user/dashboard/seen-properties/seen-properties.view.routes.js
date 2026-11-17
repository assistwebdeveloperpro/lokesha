const express = require("express");
const { validateParams } = require("../../../../middlewares/validate.middleware");
const optionalAuthMiddleware = require("../../../../middlewares/optional-auth.middleware");
const controller = require("./seen-properties.controller");
const { propertyIdParamSchema } = require("./seen-properties.validation");

const router = express.Router();

router.post("/:id/view", optionalAuthMiddleware, validateParams(propertyIdParamSchema), controller.recordView);

module.exports = router;
