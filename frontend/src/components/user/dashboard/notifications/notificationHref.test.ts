import { describe, expect, it } from "vitest";
import { LEADS_PATH } from "@/components/user/dashboard/leads/leadsShared";
import { getUserNotificationHref } from "./notificationHref";

describe("getUserNotificationHref", () => {
  it("links a lead notification to its lead on the Leads page", () => {
    expect(getUserNotificationHref({ type: "lead_received", leadId: "lead-1" })).toBe(`${LEADS_PATH}?lead=lead-1`);
  });

  it("falls back to the Leads page when the lead id is missing", () => {
    expect(getUserNotificationHref({ type: "lead_received", leadId: null })).toBe(LEADS_PATH);
  });

  it.each([
    ["free_package_granted", "/user/subscription/subscribed-services"],
    ["payment_success", "/user/subscription/order-history"],
    ["payment_failed", "/user/subscription/subscribed-services#buy-standard"],
    ["subscription_ending_soon", "/user/subscription/subscribed-services#buy-standard"],
    ["subscription_ended", "/user/subscription/subscribed-services#buy-standard"],
    ["credits_low", "/user/subscription/subscribed-services#buy-standard"],
    ["lead_limit_near", "/user/subscription/package-usage"],
    ["lead_limit_reached", "/user/subscription/package-usage"],
    ["lead_pack_purchased", "/user/subscription/package-usage"],
    ["property_expired", "/user/properties/manage-properties"],
  ])("opens the page where a %s notice can be acted on", (type, href) => {
    expect(getUserNotificationHref({ type, leadId: null })).toBe(href);
  });

  it("leaves other notification types without a link", () => {
    expect(getUserNotificationHref({ type: "property_approved", leadId: null })).toBeNull();
    expect(getUserNotificationHref({ type: "property_rejected", leadId: null })).toBeNull();
  });
});
