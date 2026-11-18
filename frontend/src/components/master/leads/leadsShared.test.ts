import { describe, expect, it } from "vitest";
import type { AdminLead } from "@/services/adminLeads.service";
import { applySentLead, getLeadSendState } from "./leadsShared";

const lead = (overrides: Partial<Parameters<typeof getLeadSendState>[0]> = {}) => ({
  verificationStatus: "verified" as const,
  distributionStatus: "not_sent" as const,
  canSendToLister: true,
  ...overrides,
});

describe("getLeadSendState", () => {
  it("allows sending a verified, unsent lead that has a user lister", () => {
    expect(getLeadSendState(lead())).toBe("can_send");
  });

  it("shows nothing for a lead that is not verified", () => {
    expect(getLeadSendState(lead({ verificationStatus: "not_verified" }))).toBe("none");
  });

  it("shows the sent state once the lead was distributed", () => {
    expect(getLeadSendState(lead({ distributionStatus: "sent" }))).toBe("sent");
  });

  it("blocks sending when the lead has no user lister", () => {
    expect(getLeadSendState(lead({ canSendToLister: false }))).toBe("no_account");
  });
});

describe("applySentLead", () => {
  const row = (id: string) => ({ id, ...lead(), sentAt: null }) as unknown as AdminLead;
  const sent = { id: "a", distributionStatus: "sent" as const, sentAt: "2026-11-18T10:00:00.000Z" };

  it("marks only the sent lead and keeps the other rows untouched", () => {
    const [first, second] = [row("a"), row("b")];

    const result = applySentLead([first, second], sent);

    expect(result[0]).toMatchObject({ id: "a", distributionStatus: "sent", sentAt: sent.sentAt });
    expect(result[1]).toBe(second);
  });

  it("leaves the list as it is when the lead is not on the page", () => {
    const rows = [row("b")];

    expect(applySentLead(rows, sent)).toEqual(rows);
  });
});
