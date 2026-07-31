const express = require("express");
const validate = require("../../../middlewares/validate.middleware");
const authMiddleware = require("../../../middlewares/auth.middleware");
const { handleCompanyLogoUpload } = require("../../../middlewares/upload.middleware");
const controller = require("./user-company.controller");
const { businessDetailsSchema } = require("./user-company.validation");

const router = express.Router();

router.post("/", authMiddleware, validate(businessDetailsSchema), controller.saveBusinessDetails);
router.get("/me", authMiddleware, controller.getBusinessDetails);
router.post(
  "/company-logo",
  authMiddleware,
  handleCompanyLogoUpload,
  controller.uploadCompanyLogo
);

module.exports = router;
