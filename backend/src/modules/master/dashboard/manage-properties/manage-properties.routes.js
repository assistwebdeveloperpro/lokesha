const express = require("express");
const validate = require("../../../../middlewares/validate.middleware");
const adminAuthMiddleware = require("../../../../middlewares/admin-auth.middleware");
const controller = require("./manage-properties.controller");
const { manageListQuerySchema } = require("./manage-properties.validation");

const router = express.Router();

router.use(adminAuthMiddleware);

router.get("/", validate.validateQuery(manageListQuerySchema), controller.listProperties);

module.exports = router;
