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

// Defined once so the hook's effects do not restart on every render
const adminNotificationSource: NotificationSource = {
  getToken: getAdminToken,
  getNotifications: getAdminNotifications,
  getUnreadCount: getAdminUnreadNotificationCount,
  markAsRead: markAdminNotificationAsRead,
  markAllAsRead: markAllAdminNotificationsAsRead,
};

export default function AdminNotificationBell() {
  return <NotificationBell source={adminNotificationSource} />;
}
