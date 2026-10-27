const express = require("express");
const validate = require("../../../middlewares/validate.middleware");
const authMiddleware = require("../../../middlewares/auth.middleware");
const {
  handleDraftFileUpload,
  handlePropertyFileUpload,
  handleFloorPlanUpload,
} = require("../../../middlewares/upload.middleware");
const {
  assertOwnedDraft,
  assertOwnedProperty,
  validateUploadedFile,
} = require("../../../middlewares/property.middleware");
const controller = require("./property.controller");
const {
  uuidParamSchema,
  draftFileParamsSchema,
  draftCreateSchema,
  draftSaveSchema,
  draftCompleteSchema,
  propertyUpdateSchema,
  mediaParamsSchema,
  floorPlanParamsSchema,
  mediaKindQuerySchema,
  listQuerySchema,
  amenityQuerySchema,
  fileKindQuerySchema,
  fileMetaSchema,
} = require("./property.validation");

const { validateParams, validateQuery } = validate;

const router = express.Router();

router.post("/drafts", authMiddleware, validate(draftCreateSchema), controller.createDraft);
router.get("/drafts", authMiddleware, controller.listDrafts);
router.get("/drafts/:id", authMiddleware, validateParams(uuidParamSchema), controller.getDraft);
router.put(
  "/drafts/:id",
  authMiddleware,
  validateParams(uuidParamSchema),
  validate(draftSaveSchema),
  controller.saveDraft
);
router.delete("/drafts/:id", authMiddleware, validateParams(uuidParamSchema), controller.deleteDraft);
router.post(
  "/drafts/:id/complete",
  authMiddleware,
  validateParams(uuidParamSchema),
  validate(draftCompleteSchema),
  controller.completeDraft
);

router.post(
  "/drafts/:id/files",
  authMiddleware,
  validateParams(uuidParamSchema),
  validateQuery(fileKindQuerySchema),
  assertOwnedDraft,
  handleDraftFileUpload,
  validateUploadedFile(fileMetaSchema),
  controller.uploadDraftFile
);
router.get(
  "/drafts/:id/files/:fileName",
  authMiddleware,
  validateParams(draftFileParamsSchema),
  controller.streamDraftFile
);
router.delete(
  "/drafts/:id/files/:fileName",
  authMiddleware,
  validateParams(draftFileParamsSchema),
  controller.deleteDraftFile
);

// Static segments above; /:id last so it never captures them
router.get("/me", authMiddleware, validateQuery(listQuerySchema), controller.listMyProperties);
router.get("/amenities", authMiddleware, validateQuery(amenityQuerySchema), controller.listAmenityOptions);
router.get("/:id", authMiddleware, validateParams(uuidParamSchema), controller.getMyProperty);
router.put(
  "/:id",
  authMiddleware,
  validateParams(uuidParamSchema),
  validate(propertyUpdateSchema),
  controller.updateProperty
);
router.delete("/:id", authMiddleware, validateParams(uuidParamSchema), controller.deleteProperty);
router.post("/:id/submit", authMiddleware, validateParams(uuidParamSchema), controller.submitProperty);
router.post("/:id/close", authMiddleware, validateParams(uuidParamSchema), controller.closeProperty);

router.post(
  "/:id/media",
  authMiddleware,
  validateParams(uuidParamSchema),
  validateQuery(mediaKindQuerySchema),
  assertOwnedProperty,
  handlePropertyFileUpload,
  validateUploadedFile(fileMetaSchema),
  controller.uploadPropertyMedia
);
router.delete(
  "/:id/media/:mediaId",
  authMiddleware,
  validateParams(mediaParamsSchema),
  controller.deleteMedia
);
router.post(
  "/:id/floor-plans",
  authMiddleware,
  validateParams(uuidParamSchema),
  assertOwnedProperty,
  handleFloorPlanUpload,
  validateUploadedFile(fileMetaSchema),
  controller.uploadPropertyFloorPlan
);
router.delete(
  "/:id/floor-plans/:planId",
  authMiddleware,
  validateParams(floorPlanParamsSchema),
  controller.deleteFloorPlan
);

module.exports = router;
