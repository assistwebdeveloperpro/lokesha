const express = require("express");
const validate = require("../../../../middlewares/validate.middleware");
const authMiddleware = require("../../../../middlewares/auth.middleware");
const controller = require("./seen-properties.controller");
const { listQuerySchema, syncSchema } = require("./seen-properties.validation");

const { validateQuery } = validate;

const router = express.Router();

router.use(authMiddleware);

router.get("/", validateQuery(listQuerySchema), controller.listViewedProperties);
router.post("/sync", validate(syncSchema), controller.syncViews);

module.exports = router;
