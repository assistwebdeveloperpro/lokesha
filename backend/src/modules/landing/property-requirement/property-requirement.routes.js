const express = require("express");
const validate = require("../../../middlewares/validate.middleware");
const authMiddleware = require("../../../middlewares/auth.middleware");
const controller = require("./property-requirement.controller");
const { createRequirementSchema } = require("./property-requirement.validation");

const router = express.Router();

router.post("/", authMiddleware, validate(createRequirementSchema), controller.createRequirement);

module.exports = router;
