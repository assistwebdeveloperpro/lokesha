const express = require("express");
const validate = require("../../../middlewares/validate.middleware");
const authMiddleware = require("../../../middlewares/auth.middleware");
const { handleOfficePhotosUpload } = require("../../../middlewares/upload.middleware");
const controller = require("./user-office.controller");
const { officeDetailsSchema } = require("./user-office.validation");

const router = express.Router();

function attachOfficePhotos(req, res, next) {
  if (req.files && req.files.length > 0) {
    req.body.officePhotos = req.files.map((file) => `/uploads/office-photos/${file.filename}`);
  }
  next();
}

router.post(
  "/",
  authMiddleware,
  handleOfficePhotosUpload,
  attachOfficePhotos,
  validate(officeDetailsSchema),
  controller.saveOfficeDetails
);
router.get("/me", authMiddleware, controller.getOfficeDetails);

module.exports = router;
