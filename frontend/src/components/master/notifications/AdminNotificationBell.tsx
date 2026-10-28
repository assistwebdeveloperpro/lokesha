"use client";

import NotificationBell from "@/components/user/dashboard/notifications/NotificationBell";
import type { NotificationSource } from "@/components/user/dashboard/notifications/useNotifications";
import {
  getAdminNotifications,
  getAdminUnreadNotificationCount,
  markAdminNotificationAsRead,
  markAllAdminNotificationsAsRead,
} from "@/services/adminNotifications.service";
import { getAdminToken } from "@/services/adminSession";
import type { UserNotification } from "@/services/userNotifications.service";

const MANAGE_PROPERTIES_PATH = "/backend/properties/manage-properties";
const REVIEW_NOTIFICATION_TYPES = new Set(["property_submitted", "property_resubmitted"]);

function getAdminReviewPropertyHref(notification: UserNotification) {
  if (!notification.propertyId || !REVIEW_NOTIFICATION_TYPES.has(notification.type)) return null;
  return `${MANAGE_PROPERTIES_PATH}?property=${encodeURIComponent(notification.propertyId)}`;
}

// Defined once so the hook's effects do not restart on every render
const adminNotificationSource: NotificationSource = {
  getToken: getAdminToken,
  getNotifications: getAdminNotifications,
  getUnreadCount: getAdminUnreadNotificationCount,
  markAsRead: markAdminNotificationAsRead,
  markAllAsRead: markAllAdminNotificationsAsRead,
  getNotificationHref: getAdminReviewPropertyHref,
};

export default function AdminNotificationBell() {
  return <NotificationBell source={adminNotificationSource} />;
}
