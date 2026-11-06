const express = require("express");
const validate = require("../../../middlewares/validate.middleware");
const authMiddleware = require("../../../middlewares/auth.middleware");
const controller = require("./auth.controller");
const {
  signupSchema,
  loginSchema,
  connectSellerSchema,
  verifyOtpSchema,
} = require("./auth.validation");

const router = express.Router();

router.post("/signup", validate(signupSchema), controller.signup);
router.post("/login", validate(loginSchema), controller.login);
router.post("/connect-seller", validate(connectSellerSchema), controller.connectSeller);
router.post("/verify-otp", validate(verifyOtpSchema), controller.verifyOtp);
router.get("/me", authMiddleware, controller.getMe);

module.exports = router;
