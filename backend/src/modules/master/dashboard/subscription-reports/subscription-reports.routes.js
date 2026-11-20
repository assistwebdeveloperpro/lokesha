const express = require("express");
const validate = require("../../../../middlewares/validate.middleware");
const adminAuthMiddleware = require("../../../../middlewares/admin-auth.middleware");
const controller = require("./subscription-reports.controller");
const { reportsQuerySchema } = require("./subscription-reports.validation");

const { validateQuery } = validate;

const router = express.Router();

router.use(adminAuthMiddleware);

router.get("/overview", validateQuery(reportsQuerySchema), controller.getOverview);

module.exports = router;
