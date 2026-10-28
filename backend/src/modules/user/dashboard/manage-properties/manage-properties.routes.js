const express = require("express");
const validate = require("../../../../middlewares/validate.middleware");
const authMiddleware = require("../../../../middlewares/auth.middleware");
const { uuidParamSchema } = require("../../../shared/property/validation/property.validation");
const controller = require("./manage-properties.controller");
const { listQuerySchema } = require("./manage-properties.validation");

const { validateParams, validateQuery } = validate;

const router = express.Router();

router.get("/me", authMiddleware, validateQuery(listQuerySchema), controller.listMyProperties);
router.post("/:id/submit", authMiddleware, validateParams(uuidParamSchema), controller.submitProperty);
router.post("/:id/close", authMiddleware, validateParams(uuidParamSchema), controller.closeProperty);
router.delete("/:id", authMiddleware, validateParams(uuidParamSchema), controller.deleteProperty);

module.exports = router;
