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

  it("leaves other notification types without a link", () => {
    expect(getUserNotificationHref({ type: "property_approved", leadId: null })).toBeNull();
    expect(getUserNotificationHref({ type: "property_rejected", leadId: null })).toBeNull();
  });
});
