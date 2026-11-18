const express = require("express");
const { validateParams, validateQuery } = require("../../../../middlewares/validate.middleware");
const adminAuthMiddleware = require("../../../../middlewares/admin-auth.middleware");
const controller = require("./leads.controller");
const { leadsListQuerySchema, leadIdParamSchema } = require("./leads.validation");

const router = express.Router();

router.use(adminAuthMiddleware);

router.get("/", validateQuery(leadsListQuerySchema), controller.listLeads);
router.post("/:id/send", validateParams(leadIdParamSchema), controller.sendLead);

module.exports = router;
