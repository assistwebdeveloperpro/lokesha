const express = require("express");
const validate = require("../../../../middlewares/validate.middleware");
const adminAuthMiddleware = require("../../../../middlewares/admin-auth.middleware");
const { cleanupUploadsOnError, parsePropertyPayload } = require("../../../../middlewares/property.middleware");
const { handleAdminPropertyUpload } = require("./admin-post-property.upload");
const { adminCreatePropertySchema, normalizeProjectDetails } = require("./admin-post-property.validation");
const controller = require("./admin-post-property.controller");

const router = express.Router();

router.post(
  "/",
  adminAuthMiddleware,
  cleanupUploadsOnError,
  handleAdminPropertyUpload,
  parsePropertyPayload,
  normalizeProjectDetails,
  validate(adminCreatePropertySchema),
  controller.createProperty
);

module.exports = router;
