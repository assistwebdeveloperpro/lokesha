const express = require("express");
const { validateQuery } = require("../../../../middlewares/validate.middleware");
const adminAuthMiddleware = require("../../../../middlewares/admin-auth.middleware");
const controller = require("./leads.controller");
const { leadsListQuerySchema } = require("./leads.validation");

const router = express.Router();

router.use(adminAuthMiddleware);

router.get("/", validateQuery(leadsListQuerySchema), controller.listLeads);

module.exports = router;
