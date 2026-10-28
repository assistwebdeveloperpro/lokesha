const express = require("express");
const validate = require("../../../../middlewares/validate.middleware");
const adminAuthMiddleware = require("../../../../middlewares/admin-auth.middleware");
const {
  handleDraftFileUpload,
  handlePropertyFileUpload,
  handleFloorPlanUpload,
} = require("../../../../middlewares/upload.middleware");
const {
  assertAdminDraft,
  assertPropertyExists,
  validateUploadedFile,
} = require("../../../../middlewares/property.middleware");
const propertyController = require("../../../shared/property/controllers/property.controller");
const controller = require("./admin-post-property.controller");
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
  amenityQuerySchema,
  fileKindQuerySchema,
  fileMetaSchema,
} = require("../../../shared/property/validation/property.validation");

const { validateParams, validateQuery } = validate;

const router = express.Router();

router.use(adminAuthMiddleware);

router.post("/drafts", validate(draftCreateSchema), controller.createDraft);
router.get("/drafts", controller.listDrafts);
router.get("/drafts/:id", validateParams(uuidParamSchema), controller.getDraft);
router.put("/drafts/:id", validateParams(uuidParamSchema), validate(draftSaveSchema), controller.saveDraft);
router.delete("/drafts/:id", validateParams(uuidParamSchema), controller.deleteDraft);
router.post(
  "/drafts/:id/complete",
  validateParams(uuidParamSchema),
  validate(draftCompleteSchema),
  controller.completeDraft
);

router.post(
  "/drafts/:id/files",
  validateParams(uuidParamSchema),
  validateQuery(fileKindQuerySchema),
  assertAdminDraft,
  handleDraftFileUpload,
  validateUploadedFile(fileMetaSchema),
  controller.uploadDraftFile
);
router.get("/drafts/:id/files/:fileName", validateParams(draftFileParamsSchema), controller.streamDraftFile);
router.delete("/drafts/:id/files/:fileName", validateParams(draftFileParamsSchema), controller.deleteDraftFile);

// Static segments above; /:id last so it never captures them
router.get("/amenities", validateQuery(amenityQuerySchema), propertyController.listAmenityOptions);
router.get("/:id", validateParams(uuidParamSchema), controller.getProperty);
router.put("/:id", validateParams(uuidParamSchema), validate(propertyUpdateSchema), controller.updateProperty);
router.post("/:id/publish", validateParams(uuidParamSchema), controller.publishProperty);
router.post("/:id/close", validateParams(uuidParamSchema), controller.closeProperty);
router.delete("/:id", validateParams(uuidParamSchema), controller.deleteProperty);

router.post(
  "/:id/media",
  validateParams(uuidParamSchema),
  validateQuery(mediaKindQuerySchema),
  assertPropertyExists,
  handlePropertyFileUpload,
  validateUploadedFile(fileMetaSchema),
  controller.uploadPropertyMedia
);
router.delete("/:id/media/:mediaId", validateParams(mediaParamsSchema), controller.deleteMedia);
router.post(
  "/:id/floor-plans",
  validateParams(uuidParamSchema),
  assertPropertyExists,
  handleFloorPlanUpload,
  validateUploadedFile(fileMetaSchema),
  controller.uploadPropertyFloorPlan
);
router.delete("/:id/floor-plans/:planId", validateParams(floorPlanParamsSchema), controller.deleteFloorPlan);

module.exports = router;
