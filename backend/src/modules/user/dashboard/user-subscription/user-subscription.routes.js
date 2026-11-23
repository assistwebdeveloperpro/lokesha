const express = require("express");
const validate = require("../../../../middlewares/validate.middleware");
const authMiddleware = require("../../../../middlewares/auth.middleware");
const { uuidParamSchema } = require("../../../shared/property/validation/property.validation");
const controller = require("./user-subscription.controller");
const {
  quoteSchema,
  createOrderSchema,
  leadQuoteSchema,
  createLeadOrderSchema,
  verifyPaymentSchema,
  pagingQuerySchema,
} = require("./user-subscription.validation");

const { validateParams, validateQuery } = validate;

const router = express.Router();

router.use(authMiddleware);

router.get("/me", controller.getOverview);
router.get("/credits", controller.getCredits);
router.get("/history", validateQuery(pagingQuerySchema), controller.listHistory);
router.get("/payments", validateQuery(pagingQuerySchema), controller.listPayments);
router.get("/usage/ledger", validateQuery(pagingQuerySchema), controller.listLedger);
router.get("/usage/properties", validateQuery(pagingQuerySchema), controller.listPropertyUsage);
router.get("/packages", controller.listPackages);
router.post("/quote", validate(quoteSchema), controller.getQuote);
router.post("/orders", validate(createOrderSchema), controller.createOrder);
router.post("/lead-pack/quote", validate(leadQuoteSchema), controller.getLeadPackQuote);
router.post("/lead-pack/orders", validate(createLeadOrderSchema), controller.createLeadPackOrder);
router.post("/orders/:id/verify", validateParams(uuidParamSchema), validate(verifyPaymentSchema), controller.verifyPayment);
router.get("/invoices/:id/download", validateParams(uuidParamSchema), controller.downloadInvoice);

module.exports = router;
