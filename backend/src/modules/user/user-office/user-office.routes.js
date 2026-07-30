const express = require("express");
const validate = require("../../../middlewares/validate.middleware");
const authMiddleware = require("../../../middlewares/auth.middleware");
const { handleOfficePhotosUpload } = require("../../../middlewares/upload.middleware");
const controller = require("./user-office.controller");
const { officeDetailsSchema } = require("./user-office.validation");

const router = express.Router();

function attachOfficePhotos(req, res, next) {
  const existingPhotos = req.body.officePhotos
    ? Array.isArray(req.body.officePhotos)
      ? req.body.officePhotos
      : [req.body.officePhotos]
    : [];
  const uploadedPhotos = (req.files || []).map(
    (file) => `/uploads/office-photos/${file.filename}`
  );
  req.body.officePhotos = [...existingPhotos, ...uploadedPhotos];
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
