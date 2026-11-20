const express = require("express");
const validate = require("../../../../middlewares/validate.middleware");
const adminAuthMiddleware = require("../../../../middlewares/admin-auth.middleware");
const { uuidParamSchema } = require("../../../shared/property/validation/property.validation");
const controller = require("./subscription-packages.controller");
const { updatePackageSchema, auditLogsQuerySchema } = require("./subscription-packages.validation");

const { validateParams, validateQuery } = validate;

const router = express.Router();

router.use(adminAuthMiddleware);

router.get("/", controller.listPackages);
router.get("/:id", validateParams(uuidParamSchema), controller.getPackage);
router.patch("/:id", validateParams(uuidParamSchema), validate(updatePackageSchema), controller.updatePackage);
router.get("/:id/audit-logs", validateParams(uuidParamSchema), validateQuery(auditLogsQuerySchema), controller.listAuditLogs);

module.exports = router;
