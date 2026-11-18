import { getLeadsHref } from "@/components/user/dashboard/leads/leadsShared";
import type { UserNotification } from "@/services/userNotifications.service";

const LEAD_RECEIVED_TYPE = "lead_received";

// Only lead notifications link out, other types stay informational
export function getUserNotificationHref(notification: Pick<UserNotification, "type" | "leadId">): string | null {
  return notification.type === LEAD_RECEIVED_TYPE ? getLeadsHref(notification.leadId) : null;
}
