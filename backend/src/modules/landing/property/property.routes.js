const express = require("express");
const validate = require("../../../middlewares/validate.middleware");
const authMiddleware = require("../../../middlewares/auth.middleware");
const optionalAuthMiddleware = require("../../../middlewares/optional-auth.middleware");
const { handlePropertyUpload } = require("../../../middlewares/upload.middleware");
const {cleanupUploadsOnError, parsePropertyPayload, validatePropertyQuery} = require("../../../middlewares/property.middleware");
const controller = require("./property.controller");
const {createPropertySchema, updatePropertySchema, addMediaSchema} = require("./property.validation");

const router = express.Router();

const uploadChain = [cleanupUploadsOnError, handlePropertyUpload, parsePropertyPayload];

router.post(
  "/",
  authMiddleware,
  ...uploadChain,
  validate(createPropertySchema),
  controller.createProperty
);
router.get("/", validatePropertyQuery, controller.listPublished);
router.get("/me", authMiddleware, validatePropertyQuery, controller.listMine);
router.get("/:id", optionalAuthMiddleware, controller.getProperty);
router.put("/:id", authMiddleware, validate(updatePropertySchema), controller.updateProperty);
router.post("/:id/media", authMiddleware, ...uploadChain, validate(addMediaSchema), controller.addMedia);
router.delete("/:id/media/:mediaId", authMiddleware, controller.deleteMedia);
router.delete("/:id", authMiddleware, controller.deleteProperty);

module.exports = router;