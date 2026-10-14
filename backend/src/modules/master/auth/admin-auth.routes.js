const express = require("express");
const validate = require("../../../middlewares/validate.middleware");
const adminAuthMiddleware = require("../../../middlewares/admin-auth.middleware");
const controller = require("./admin-auth.controller");
const { adminLoginSchema, adminVerifyOtpSchema } = require("./admin-auth.validation");

const router = express.Router();

router.post("/login", validate(adminLoginSchema), controller.login);
router.post("/verify-otp", validate(adminVerifyOtpSchema), controller.verifyOtp);
router.get("/me", adminAuthMiddleware, controller.getMe);

module.exports = router;
