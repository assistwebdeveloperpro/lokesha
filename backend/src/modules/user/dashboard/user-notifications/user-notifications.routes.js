const express = require("express");
const validate = require("../../../../middlewares/validate.middleware");
const authMiddleware = require("../../../../middlewares/auth.middleware");
const controller = require("./user-notifications.controller");
const { notificationListQuerySchema, uuidParamSchema } = require("./user-notifications.validation");

const { validateParams, validateQuery } = validate;

const router = express.Router();

router.use(authMiddleware);

router.get("/", validateQuery(notificationListQuerySchema), controller.listNotifications);
router.get("/unread-count", controller.getUnreadCount);
router.post("/read-all", controller.markAllAsRead);
router.post("/:id/read", validateParams(uuidParamSchema), controller.markAsRead);

module.exports = router;
