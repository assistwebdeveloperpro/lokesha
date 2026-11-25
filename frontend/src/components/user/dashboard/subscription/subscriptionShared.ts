import { formatRupees } from "@/lib/currency";
import type {
  LedgerEntry,
  OrderStatus,
  OrderType,
  PropertyLeadUsage,
  PurchasablePackage,
  UserSubscription,
} from "@/services/userSubscription.service";

export const SUBSCRIPTION_PAGE_SIZE = 8;

type OrderQuantity = {
  orderType: OrderType;
  listings: number | null;
  months: number | null;
  leads: number | null;
  property: { title: string } | null;
};

export type PriceBreakdown = { baseAmount: number; gstAmount: number; totalAmount: number };

export function calculatePreview(pkg: PurchasablePackage, listings: number, months: number): PriceBreakdown {
  const baseAmount = listings * months * pkg.pricePerListingMonth;
  const gstAmount = Math.round((baseAmount * pkg.gstPercent) / 100);
  return { baseAmount, gstAmount, totalAmount: baseAmount + gstAmount };
}

export const clampQuantity = (value: number, min: number, max: number) =>
  Number.isFinite(value) ? Math.min(max, Math.max(min, Math.trunc(value))) : min;

// Without the custom option the user can only buy the package's own minimum
export const getListingChoices = (pkg: PurchasablePackage) =>
  pkg.allowCustomQuantity ? { min: pkg.minListings, max: pkg.maxListings } : { min: pkg.minListings, max: pkg.minListings };

export const getMonthChoices = (pkg: PurchasablePackage) =>
  pkg.allowCustomDuration ? { min: pkg.minMonths, max: pkg.maxMonths } : { min: pkg.minMonths, max: pkg.minMonths };

export const plural = (count: number, singular: string, pluralForm = `${singular}s`) =>
  `${count} ${count === 1 ? singular : pluralForm}`;

// A missing bound only means the package is not set up, so the range collapses to one lead
export const getLeadChoices = (pkg: PurchasablePackage) => {
  const min = pkg.minLeads ?? 1;
  return { min, max: Math.max(min, pkg.maxLeads ?? min) };
};

export const formatLeadPrice = (pkg: PurchasablePackage) =>
  pkg.pricePerLead === null ? "" : `${formatRupees(pkg.pricePerLead)} per lead`;

// Only a live property that has used its limit has something to buy
export const canBuyMoreLeads = (property: Pick<PropertyLeadUsage, "status" | "isLimitReached">) =>
  property.isLimitReached && property.status === "published";

export const getPayLabel =(phase: "idle" | "quoting" | "paying" | "verifying", totalAmount: number) => {
  if (phase === "verifying") return "Confirming payment...";
  if (phase === "paying") return "Opening payment...";
  return `Pay ${formatRupees(totalAmount)}`;
};

export const getOrderTitle =(orderType: OrderType) => (orderType === "lead_pack" ? "Extra leads" : "Standard package");

// What the order bought: leads for a property, or listings for a period
export function describeOrderQuantity({ orderType, listings, months, leads, property }: OrderQuantity): string {
  if (orderType === "lead_pack") {
    const bought = plural(leads ?? 0, "lead");
    return property ? `${bought} · ${property.title}` : bought;
  }

  return `${plural(listings ?? 0, "listing")} · ${plural(months ?? 0, "month")}`;
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}

export function formatDateTimeWithSeconds(value: string): string {
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}

export function formatDaysLeft(days: number | null): string {
  if (days === null) return "No end date";
  if (days === 0) return "Ends today";
  return `${plural(days, "day")} left`;
}

type Tone = { label: string; className: string };

export const ORDER_STATUS_TONES: Record<OrderStatus, Tone> = {
  paid: { label: "Paid", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  pending: { label: "Pending", className: "bg-amber-50 text-amber-700 ring-amber-200" },
  created: { label: "Not paid", className: "bg-slate-100 text-slate-600 ring-slate-200" },
  failed: { label: "Failed", className: "bg-red-50 text-red-700 ring-red-200" },
  cancelled: { label: "Cancelled", className: "bg-slate-100 text-slate-600 ring-slate-200" },
  refunded: { label: "Refunded", className: "bg-sky-50 text-sky-700 ring-sky-200" },
};

export const SUBSCRIPTION_STATUS_TONES: Record<UserSubscription["status"], Tone> = {
  active: { label: "Active", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  exhausted: { label: "All used", className: "bg-slate-100 text-slate-600 ring-slate-200" },
  expired: { label: "Expired", className: "bg-amber-50 text-amber-700 ring-amber-200" },
  cancelled: { label: "Cancelled", className: "bg-slate-100 text-slate-600 ring-slate-200" },
  refunded: { label: "Refunded", className: "bg-sky-50 text-sky-700 ring-sky-200" },
};

export const SOURCE_LABELS: Record<UserSubscription["source"], string> = {
  free_signup: "Included with your account",
  launch_backfill: "Included with your account",
  purchase: "Purchased online",
  admin_gift: "Added by Lokesha",
};

export const LEDGER_TONES: Record<LedgerEntry["type"], Tone> = {
  granted: { label: "Credits added", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  admin_added: { label: "Credits added", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  used: { label: "Listing published", className: "bg-sky-50 text-sky-700 ring-sky-200" },
  expired: { label: "Credits expired", className: "bg-amber-50 text-amber-700 ring-amber-200" },
  cancelled: { label: "Credits cancelled", className: "bg-slate-100 text-slate-600 ring-slate-200" },
};

export const formatCreditChange = (credits: number) => (credits > 0 ? `+${credits}` : String(credits));

export const isValidGstin = (value: string) => /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(value);

export const getInvoiceFileName = (invoiceNumber: string) => `Invoice-${invoiceNumber.replaceAll("/", "-")}.pdf`;
