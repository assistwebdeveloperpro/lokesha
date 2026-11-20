const express = require("express");
const validate = require("../../../../middlewares/validate.middleware");
const adminAuthMiddleware = require("../../../../middlewares/admin-auth.middleware");
const { uuidParamSchema } = require("../../../shared/property/validation/property.validation");
const { pagingQuerySchema } = require("../../../user/dashboard/user-subscription/user-subscription.validation");
const controller = require("./subscription-users.controller");
const { usersListQuerySchema } = require("./subscription-users.validation");

const { validateParams, validateQuery } = validate;

const router = express.Router();

router.use(adminAuthMiddleware);

router.get("/", validateQuery(usersListQuerySchema), controller.listUsers);
router.get("/:id", validateParams(uuidParamSchema), controller.getUserDetail);
router.get("/:id/history", validateParams(uuidParamSchema), validateQuery(pagingQuerySchema), controller.listUserHistory);
router.get("/:id/payments", validateParams(uuidParamSchema), validateQuery(pagingQuerySchema), controller.listUserPayments);
router.get("/:id/ledger", validateParams(uuidParamSchema), validateQuery(pagingQuerySchema), controller.listUserLedger);

module.exports = router;
