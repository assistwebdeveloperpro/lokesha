const express = require("express");
const validate = require("../../../../middlewares/validate.middleware");
const adminAuthMiddleware = require("../../../../middlewares/admin-auth.middleware");
const controller = require("./subscription-settings.controller");
const { updateSettingsSchema } = require("./subscription-settings.validation");

const router = express.Router();

router.use(adminAuthMiddleware);

router.get("/", controller.getSettings);
router.patch("/", validate(updateSettingsSchema), controller.updateSettings);

module.exports = router;
