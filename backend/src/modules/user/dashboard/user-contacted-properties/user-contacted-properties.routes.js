const express = require("express");
const validate = require("../../../../middlewares/validate.middleware");
const authMiddleware = require("../../../../middlewares/auth.middleware");
const controller = require("./user-contacted-properties.controller");
const { listQuerySchema } = require("./user-contacted-properties.validation");

const { validateQuery } = validate;

const router = express.Router();

router.get("/", authMiddleware, validateQuery(listQuerySchema), controller.listContactedProperties);

module.exports = router;
