"use client";

import { getLeadsHref } from "@/components/master/leads/leadsShared";
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

const REVIEW_PROPERTIES_PATH = "/backend/properties/review-properties";
const REVIEW_NOTIFICATION_TYPES = new Set(["property_submitted", "property_resubmitted"]);

const TRANSACTIONS_PATH = "/backend/subscription-transactions";
const SUBSCRIPTION_PURCHASED_TYPE = "subscription_purchased";

const LEAD_RECEIVED_TYPE = "lead_received";
// Held leads of the property are sent from the Leads screen
const LEAD_PACK_PURCHASED_TYPE = "lead_pack_purchased";

function getAdminNotificationHref(notification: UserNotification) {
  if (notification.type === LEAD_RECEIVED_TYPE) return getLeadsHref(notification.leadId);
  if (notification.type === LEAD_PACK_PURCHASED_TYPE) return getLeadsHref();
  if (notification.type === SUBSCRIPTION_PURCHASED_TYPE) return TRANSACTIONS_PATH;
  if (!notification.propertyId || !REVIEW_NOTIFICATION_TYPES.has(notification.type)) return null;
  return `${REVIEW_PROPERTIES_PATH}?property=${encodeURIComponent(notification.propertyId)}`;
}

// Defined once so the hook's effects do not restart on every render
const adminNotificationSource: NotificationSource = {
  getToken: getAdminToken,
  getNotifications: getAdminNotifications,
  getUnreadCount: getAdminUnreadNotificationCount,
  markAsRead: markAdminNotificationAsRead,
  markAllAsRead: markAllAdminNotificationsAsRead,
  getNotificationHref: getAdminNotificationHref,
};

export default function AdminNotificationBell() {
  return <NotificationBell source={adminNotificationSource} />;
}
