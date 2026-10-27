const express = require("express");
const validate = require("../../../../middlewares/validate.middleware");
const adminAuthMiddleware = require("../../../../middlewares/admin-auth.middleware");
const { uuidParamSchema } = require("../../../landing/property/property.validation");
const controller = require("./property-review.controller");
const { reviewListQuerySchema, rejectSchema } = require("./property-review.validation");

const { validateParams, validateQuery } = validate;

const router = express.Router();

router.use(adminAuthMiddleware);

router.get("/", validateQuery(reviewListQuerySchema), controller.listProperties);
router.get("/:id", validateParams(uuidParamSchema), controller.getProperty);
router.post("/:id/approve", validateParams(uuidParamSchema), controller.approveProperty);
router.post("/:id/reject", validateParams(uuidParamSchema), validate(rejectSchema), controller.rejectProperty);

module.exports = router;
