const express = require("express");
const authMiddleware = require("../../../middlewares/auth.middleware");
const controller = require("./user-profile.controller");

const router = express.Router();

router.get("/me", authMiddleware, controller.getProfile);

module.exports = router;
