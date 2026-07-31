const express = require("express");
const validate = require("../../../middlewares/validate.middleware");
const authMiddleware = require("../../../middlewares/auth.middleware");
const controller = require("./user-profile.controller");
const { loginDetailsSchema } = require("./user-profile.validation");

const router = express.Router();

router.get("/me", authMiddleware, controller.getProfile);
router.put(
  "/login-details",
  authMiddleware,
  validate(loginDetailsSchema),
  controller.updateLoginDetails
);

module.exports = router;
