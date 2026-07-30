const express = require("express");
const validate = require("../../../middlewares/validate.middleware");
const authMiddleware = require("../../../middlewares/auth.middleware");
const controller = require("./user-password.controller");
const { changePasswordSchema } = require("./user-password.validation");

const router = express.Router();

router.post(
 "/change",
  authMiddleware,
  validate(changePasswordSchema),
  controller.changePassword
);

module.exports = router;