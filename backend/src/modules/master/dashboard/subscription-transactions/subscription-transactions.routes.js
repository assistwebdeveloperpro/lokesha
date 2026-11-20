const express = require("express");
const validate = require("../../../../middlewares/validate.middleware");
const adminAuthMiddleware = require("../../../../middlewares/admin-auth.middleware");
const controller = require("./subscription-transactions.controller");
const { transactionsQuerySchema } = require("./subscription-transactions.validation");

const { validateQuery } = validate;

const router = express.Router();

router.use(adminAuthMiddleware);

router.get("/", validateQuery(transactionsQuerySchema), controller.listTransactions);
router.get("/export", validateQuery(transactionsQuerySchema), controller.exportTransactions);

module.exports = router;
