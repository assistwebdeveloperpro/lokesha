const express = require("express");
const validate = require("../../../middlewares/validate.middleware");
const authMiddleware = require("../../../middlewares/auth.middleware");
const { handleReraDocumentUpload } = require("../../../middlewares/upload.middleware");
const controller = require("./user-rera.controller");
const { reraDetailsSchema } = require("./user-rera.validation");

const router = express.Router();

router.get("/", authMiddleware, controller.getReraDetails);
router.post(
  "/",
  authMiddleware,
  handleReraDocumentUpload,
  validate(reraDetailsSchema),
  controller.createReraDetail
);
router.put(
  "/:id",
  authMiddleware,
  handleReraDocumentUpload,
  validate(reraDetailsSchema),
  controller.updateReraDetail
);
router.delete("/:id", authMiddleware, controller.deleteReraDetail);

module.exports = router;
