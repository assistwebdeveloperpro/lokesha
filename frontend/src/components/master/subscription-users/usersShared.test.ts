import { describe, expect, it } from "vitest";
import { DEFAULT_USER_FILTERS, describeAction, getCreditsLeft, getUserStatus, isFiltered, toUsersQuery } from "./usersShared";

describe("toUsersQuery", () => {
  it("sends only the paging for the default filters", () => {
    expect(toUsersQuery(DEFAULT_USER_FILTERS, 1)).toEqual({ page: 1, limit: 10, search: undefined, package: undefined, status: undefined });
  });

  it("sends the chosen filters and the page", () => {
    expect(toUsersQuery({ search: "Asha", package: "standard", status: "active" }, 2)).toEqual({
      page: 2,
      limit: 10,
      search: "Asha",
      package: "standard",
      status: "active",
    });
  });
});

describe("isFiltered", () => {
  it("is false for the defaults and true when any filter is set", () => {
    expect(isFiltered(DEFAULT_USER_FILTERS)).toBe(false);
    expect(isFiltered({ ...DEFAULT_USER_FILTERS, search: "a" })).toBe(true);
    expect(isFiltered({ ...DEFAULT_USER_FILTERS, package: "free" })).toBe(true);
    expect(isFiltered({ ...DEFAULT_USER_FILTERS, status: "expired" })).toBe(true);
  });
});

describe("getCreditsLeft", () => {
  it("is what was bought minus what was used and never negative", () => {
    expect(getCreditsLeft({ creditsBought: 7, creditsUsed: 3 })).toBe(4);
    expect(getCreditsLeft({ creditsBought: 2, creditsUsed: 5 })).toBe(0);
  });
});

describe("getUserStatus", () => {
  it("tells an active user from one with no running plan", () => {
    expect(getUserStatus({ hasActiveSubscription: true }).label).toBe("Active");
    expect(getUserStatus({ hasActiveSubscription: false }).label).toBe("No active plan");
  });
});

describe("describeAction", () => {
  it("describes gifted credits", () => {
    expect(describeAction({ type: "gift_credits", details: { credits: 3, months: 2 } })).toEqual({
      title: "Credits gifted",
      summary: "3 credits valid for 2 months",
    });
    expect(describeAction({ type: "gift_credits", details: { credits: 1, months: 1 } }).summary).toBe("1 credit valid for 1 month");
  });

  it("describes an extension with the new end date in IST", () => {
    expect(describeAction({ type: "extend", details: { months: 1, endsAt: "2027-01-20T10:00:00.000Z" } })).toEqual({
      title: "Subscription extended",
      summary: "1 month added, now ends 20 Jan 2027",
    });
  });

  it("describes a refund with the amount, the cancelled credits and the credit note", () => {
    expect(describeAction({ type: "refund", details: { amount: 7080, cancelledCredits: 3, creditNoteNumber: "LOK-CN/2026-27/000001" } })).toEqual({
      title: "Order refunded",
      summary: "₹7,080 returned, 3 credits cancelled, credit note LOK-CN/2026-27/000001",
    });
    expect(describeAction({ type: "refund", details: { amount: 1180, cancelledCredits: 0, creditNoteNumber: null } }).summary).toBe(
      "₹1,180 returned, 0 credits cancelled",
    );
  });

  it("describes a lead purchase refund by the leads removed from the property", () => {
    expect(
      describeAction({ type: "refund", details: { amount: 1180, leads: 10, propertyId: "p-1", creditNoteNumber: "LOK-CN/2026-27/000002" } }),
    ).toEqual({
      title: "Order refunded",
      summary: "₹1,180 returned, 10 leads removed, credit note LOK-CN/2026-27/000002",
    });
  });
});
