const express = require("express");
const validate = require("../../../../middlewares/validate.middleware");
const adminAuthMiddleware = require("../../../../middlewares/admin-auth.middleware");
const controller = require("./subscription-actions.controller");
const { giftCreditsSchema, extendSchema, refundSchema, actionsListQuerySchema } = require("./subscription-actions.validation");

const { validateQuery } = validate;

const router = express.Router();

router.use(adminAuthMiddleware);

router.get("/", validateQuery(actionsListQuerySchema), controller.listActions);
router.post("/gift-credits", validate(giftCreditsSchema), controller.giftCredits);
router.post("/extend", validate(extendSchema), controller.extendSubscription);
router.post("/refund", validate(refundSchema), controller.refundOrder);

module.exports = router;
