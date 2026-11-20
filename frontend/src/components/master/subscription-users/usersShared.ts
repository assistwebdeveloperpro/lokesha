import { formatRupees } from "@/lib/currency";
import { formatDate, plural } from "@/components/user/dashboard/subscription/subscriptionShared";
import type { AdminAction, AdminUserRow, AdminUsersQuery } from "@/services/adminSubscription.service";

export const USERS_PAGE_SIZE = 10;

export type UserFilters = {
  search: string;
  package: "all" | "free" | "standard";
  status: "all" | "active" | "expired" | "exhausted" | "cancelled" | "refunded";
};

export const DEFAULT_USER_FILTERS: UserFilters = { search: "", package: "all", status: "all" };

export const PACKAGE_FILTER_OPTIONS = [
  { value: "all", label: "All packages" },
  { value: "free", label: "Free" },
  { value: "standard", label: "Standard" },
];

export const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "exhausted", label: "All used" },
  { value: "expired", label: "Expired" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
];


export const USER_GRID_CLASS = "grid grid-cols-[1.6fr_1fr_0.9fr_1.2fr_0.9fr_0.9fr_0.9fr_0.7fr] items-center gap-4";
export const USER_TABLE_MIN_WIDTH_CLASS = "min-w-[1120px]";
export const USER_TABLE_COLUMNS = ["User", "Packages", "Credits", "Validity", "Paid", "Payment", "Status", ""] as const;

export const toUsersQuery = (filters: UserFilters, page: number): AdminUsersQuery => ({
  page,
  limit: USERS_PAGE_SIZE,
  search: filters.search || undefined,
  package: filters.package === "all" ? undefined : filters.package,
  status: filters.status === "all" ? undefined : filters.status,
});

export const isFiltered = (filters: UserFilters) =>
  (Object.keys(DEFAULT_USER_FILTERS) as (keyof UserFilters)[]).some((key) => filters[key] !== DEFAULT_USER_FILTERS[key]);

export const getCreditsLeft = (user: Pick<AdminUserRow, "creditsBought" | "creditsUsed">) => Math.max(0, user.creditsBought - user.creditsUsed);

export const PACKAGE_LABELS: Record<AdminUserRow["packages"][number], string> = { free: "Free", standard: "Standard" };

// A user is active while any of their subscriptions is still running
export const getUserStatus = (user: Pick<AdminUserRow, "hasActiveSubscription">) =>
  user.hasActiveSubscription
    ? { label: "Active", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" }
    : { label: "No active plan", className: "bg-slate-100 text-slate-600 ring-slate-200" };

const asNumber = (value: unknown) => Number(value ?? 0);

// Reads the details an admin action was saved with and says what happened in one line
export function describeAction({ type, details }: Pick<AdminAction, "type" | "details">): { title: string; summary: string } {
  if (type === "gift_credits") {
    return {
      title: "Credits gifted",
      summary: `${plural(asNumber(details.credits), "credit")} valid for ${plural(asNumber(details.months), "month")}`,
    };
  }

  if (type === "extend") {
    return {
      title: "Subscription extended",
      summary: `${plural(asNumber(details.months), "month")} added, now ends ${formatDate(String(details.endsAt))}`,
    };
  }

  const creditNote = details.creditNoteNumber ? `, credit note ${String(details.creditNoteNumber)}` : "";
  return {
    title: "Order refunded",
    summary: `${formatRupees(asNumber(details.amount))} returned, ${plural(asNumber(details.cancelledCredits), "credit")} cancelled${creditNote}`,
  };
}
