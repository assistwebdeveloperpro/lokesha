const express = require("express");
const validate = require("../../../../middlewares/validate.middleware");
const authMiddleware = require("../../../../middlewares/auth.middleware");
const controller = require("./saved-properties.controller");
const {
  listQuerySchema,
  savePropertySchema,
  propertyIdParamSchema,
} = require("./saved-properties.validation");

const { validateQuery, validateParams } = validate;

const router = express.Router();

router.use(authMiddleware);

router.get("/", validateQuery(listQuerySchema), controller.listSavedProperties);
router.get("/ids", controller.listSavedPropertyIds);
router.post("/", validate(savePropertySchema), controller.saveProperty);
router.delete("/:propertyId", validateParams(propertyIdParamSchema), controller.unsaveProperty);

module.exports = router;
