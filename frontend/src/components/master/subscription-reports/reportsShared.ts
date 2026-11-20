import { formatRupees } from "@/lib/currency";
import type { ReportsOverview } from "@/services/adminSubscription.service";

export type ReportTone = "sky" | "emerald" | "amber" | "red" | "slate";

export type ReportTile = {
  key: string;
  label: string;
  value: string;
  hint: string;
  tone: ReportTone;
};

export type ReportGroup = { title: string; text: string; tiles: ReportTile[] };

const plural = (count: number, singular: string, pluralForm = `${singular}s`) => `${count} ${count === 1 ? singular : pluralForm}`;

// Builds the figures shown on the page; money is in paise
export function buildReportGroups({ revenue, payments, users }: ReportsOverview): ReportGroup[] {
  return [
    {
      title: "Revenue",
      text: "Paid orders in the chosen dates",
      tiles: [
        { key: "revenue", label: "Total revenue", value: formatRupees(revenue.totalAmount), hint: `${plural(revenue.paidOrders, "paid order")}, GST included`, tone: "emerald" },
        { key: "gst", label: "GST collected", value: formatRupees(revenue.gstCollected), hint: `On ${formatRupees(revenue.baseAmount)} before GST`, tone: "sky" },
        { key: "refunded", label: "Refunded", value: formatRupees(revenue.refundedAmount), hint: plural(revenue.refundedOrders, "refunded order"), tone: "slate" },
      ],
    },
    {
      title: "Users",
      text: "How things stand right now",
      tiles: [
        { key: "active", label: "Active Standard users", value: String(users.activeStandard), hint: "With a running paid subscription", tone: "emerald" },
        { key: "exhausted", label: "Free credits used up", value: String(users.exhaustedFree), hint: "Likely to buy next", tone: "amber" },
      ],
    },
    {
      title: "Payments to follow up",
      text: "Created in the chosen dates",
      tiles: [
        { key: "failed", label: "Failed payments", value: String(payments.failed), hint: "The user may need help", tone: payments.failed > 0 ? "red" : "slate" },
        { key: "pending", label: "Pending payments", value: String(payments.pending), hint: "Waiting for the bank", tone: payments.pending > 0 ? "amber" : "slate" },
      ],
    },
  ];
}

export function describeRange({ from, to }: ReportsOverview["range"]): string {
  if (from && to) return from === to ? from : `${from} to ${to}`;
  if (from) return `From ${from}`;
  if (to) return `Until ${to}`;
  return "All time";
}
