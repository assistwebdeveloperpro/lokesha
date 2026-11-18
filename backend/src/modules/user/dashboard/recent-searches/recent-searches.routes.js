const express = require("express");
const validate = require("../../../../middlewares/validate.middleware");
const authMiddleware = require("../../../../middlewares/auth.middleware");
const controller = require("./recent-searches.controller");
const {
  createSchema,
  syncSchema,
  idParamSchema,
  listQuerySchema,
} = require("./recent-searches.validation");

const { validateParams, validateQuery } = validate;

const router = express.Router();

router.use(authMiddleware);

router.get("/", validateQuery(listQuerySchema), controller.listSearches);
router.post("/", validate(createSchema), controller.recordSearch);
router.post("/sync", validate(syncSchema), controller.syncSearches);
router.delete("/", controller.clearSearches);
router.delete("/:id", validateParams(idParamSchema), controller.deleteSearch);

module.exports = router;
