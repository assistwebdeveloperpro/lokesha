const express = require("express");
const validate = require("../../../../middlewares/validate.middleware");
const adminAuthMiddleware = require("../../../../middlewares/admin-auth.middleware");
const controller = require("./admin-notifications.controller");
const { notificationListQuerySchema, uuidParamSchema } = require("./admin-notifications.validation");

const { validateParams, validateQuery } = validate;

const router = express.Router();

router.use(adminAuthMiddleware);

router.get("/", validateQuery(notificationListQuerySchema), controller.listNotifications);
router.get("/unread-count", controller.getUnreadCount);
router.post("/read-all", controller.markAllAsRead);
router.post("/:id/read", validateParams(uuidParamSchema), controller.markAsRead);

module.exports = router;
