const express = require("express");
const validate = require("../../../middlewares/validate.middleware");
const authMiddleware = require("../../../middlewares/auth.middleware");
const controller = require("./user-business.controller");
const { businessDetailsSchema } = require("./user-business.validation");

const router = express.Router();

router.post("/", authMiddleware, validate(businessDetailsSchema), controller.saveBusinessDetails);
router.get("/me", authMiddleware, controller.getBusinessDetails);

module.exports = router;
