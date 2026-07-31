const express = require("express");
const validate = require("../../../middlewares/validate.middleware");
const authMiddleware = require("../../../middlewares/auth.middleware");
const controller = require("./user-saved-messages.controller");
const { saveMessageSchema } = require("./user-saved-messages.validation");

const router = express.Router();

router.get("/me", authMiddleware, controller.getSavedMessages);
router.post("/", authMiddleware, validate(saveMessageSchema), controller.saveMessage);

module.exports = router;
