import { describe, expect, it } from "vitest";
import type { ReportsOverview } from "@/services/adminSubscription.service";
import { buildReportGroups, describeRange } from "./reportsShared";

const overview: ReportsOverview = {
  range: { from: null, to: null },
  revenue: { paidOrders: 3, baseAmount: 12000, gstCollected: 2160, totalAmount: 14160, refundedOrders: 1, refundedAmount: 1180 },
  payments: { failed: 4, pending: 0 },
  users: { activeStandard: 7, exhaustedFree: 12 },
};

const tiles = (data: ReportsOverview) => Object.fromEntries(buildReportGroups(data).flatMap((group) => group.tiles).map((tile) => [tile.key, tile]));

describe("buildReportGroups", () => {
  it("groups the figures as revenue, users and payments", () => {
    expect(buildReportGroups(overview).map((group) => group.title)).toEqual(["Revenue", "Users", "Payments to follow up"]);
  });

  it("shows money in rupees with the order counts as hints", () => {
    const { revenue, gst, refunded } = tiles(overview);

    expect(revenue).toMatchObject({ value: "₹14,160", hint: "3 paid orders, GST included", tone: "emerald" });
    expect(gst).toMatchObject({ value: "₹2,160", hint: "On ₹12,000 before GST" });
    expect(refunded).toMatchObject({ value: "₹1,180", hint: "1 refunded order" });
  });

  it("shows the two user counts", () => {
    const { active, exhausted } = tiles(overview);

    expect(active.value).toBe("7");
    expect(exhausted.value).toBe("12");
  });

  it("raises the payment tiles only when there is something to follow up", () => {
    expect(tiles(overview).failed.tone).toBe("red");
    expect(tiles(overview).pending.tone).toBe("slate");

    const busy = { ...overview, payments: { failed: 0, pending: 2 } };
    expect(tiles(busy).failed.tone).toBe("slate");
    expect(tiles(busy).pending.tone).toBe("amber");
  });

  it("handles an empty period", () => {
    const empty: ReportsOverview = {
      ...overview,
      revenue: { paidOrders: 0, baseAmount: 0, gstCollected: 0, totalAmount: 0, refundedOrders: 0, refundedAmount: 0 },
    };

    expect(tiles(empty).revenue).toMatchObject({ value: "₹0", hint: "0 paid orders, GST included" });
  });
});

describe("describeRange", () => {
  it.each([
    [{ from: null, to: null }, "All time"],
    [{ from: "2026-11-01", to: "2026-11-30" }, "2026-11-01 to 2026-11-30"],
    [{ from: "2026-11-20", to: "2026-11-20" }, "2026-11-20"],
    [{ from: "2026-11-01", to: null }, "From 2026-11-01"],
    [{ from: null, to: "2026-11-30" }, "Until 2026-11-30"],
  ])("describes %j as %s", (range, expected) => {
    expect(describeRange(range)).toBe(expected);
  });
});
