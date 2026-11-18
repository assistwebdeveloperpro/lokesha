const express = require("express");
const { validateQuery } = require("../../../../middlewares/validate.middleware");
const authMiddleware = require("../../../../middlewares/auth.middleware");
const controller = require("./user-leads.controller");
const { listQuerySchema } = require("./user-leads.validation");

const router = express.Router();

router.get("/", authMiddleware, validateQuery(listQuerySchema), controller.listLeads);

module.exports = router;
