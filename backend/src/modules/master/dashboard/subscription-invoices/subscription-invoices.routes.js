const express = require("express");
const validate = require("../../../../middlewares/validate.middleware");
const adminAuthMiddleware = require("../../../../middlewares/admin-auth.middleware");
const { uuidParamSchema } = require("../../../shared/property/validation/property.validation");
const invoiceService = require("../../../shared/subscription/services/invoice.service");
const { downloadInvoice } = require("../../../shared/subscription/controllers/invoice-download.controller");

const { validateParams } = validate;

const router = express.Router();

router.use(adminAuthMiddleware);

router.get("/:id/download", validateParams(uuidParamSchema), downloadInvoice((req) => invoiceService.getInvoiceForAdmin(req.params.id)));

module.exports = router;
