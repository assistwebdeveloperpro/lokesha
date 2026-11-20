import { getLeadsHref } from "@/components/user/dashboard/leads/leadsShared";
import type { UserNotification } from "@/services/userNotifications.service";

const LEAD_RECEIVED_TYPE = "lead_received";

const SUBSCRIPTION_PATH = "/user/subscription/subscribed-services";
const BUY_PATH = `${SUBSCRIPTION_PATH}#buy-standard`;
const ORDER_HISTORY_PATH = "/user/subscription/order-history";
const PACKAGE_USAGE_PATH = "/user/subscription/package-usage";
const MANAGE_PROPERTIES_PATH = "/user/properties/manage-properties";

// Each subscription notice opens the page where the user can act on it
const SUBSCRIPTION_HREFS: Record<string, string> = {
  free_package_granted: SUBSCRIPTION_PATH,
  payment_success: ORDER_HISTORY_PATH,
  payment_failed: BUY_PATH,
  subscription_ending_soon: BUY_PATH,
  subscription_ended: BUY_PATH,
  credits_low: BUY_PATH,
  lead_limit_near: PACKAGE_USAGE_PATH,
  lead_limit_reached: PACKAGE_USAGE_PATH,
  property_expired: MANAGE_PROPERTIES_PATH,
};

// Lead and subscription notifications link out, review decisions stay informational
export function getUserNotificationHref(notification: Pick<UserNotification, "type" | "leadId">): string | null {
  if (notification.type === LEAD_RECEIVED_TYPE) return getLeadsHref(notification.leadId);

  return SUBSCRIPTION_HREFS[notification.type] ?? null;
}
