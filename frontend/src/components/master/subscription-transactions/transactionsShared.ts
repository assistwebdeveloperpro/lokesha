import type { AdminTransaction, AdminTransactionsQuery } from "@/services/adminSubscription.service";
import type { OrderStatus } from "@/services/userSubscription.service";

export const TRANSACTIONS_PAGE_SIZE = 10;

export type TransactionFilters = {
  search: string;
  status: OrderStatus | "all";
  from: string;
  to: string;
};

export const DEFAULT_TRANSACTION_FILTERS: TransactionFilters = { search: "", status: "all", from: "", to: "" };

export const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "created", label: "Not paid" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
];

// The same grid is used by the table and its skeleton, so loading looks like the final layout
export const TRANSACTION_GRID_CLASS = "grid grid-cols-[1.2fr_1.1fr_1.1fr_1fr_1.2fr_0.9fr_1.1fr] items-start gap-4";
export const TRANSACTION_TABLE_MIN_WIDTH_CLASS = "min-w-[1180px]";
export const TRANSACTION_TABLE_COLUMNS = ["Order", "User", "Plan", "Amount", "Razorpay", "Status", "Actions"] as const;

export const toFilterParams = (filters: TransactionFilters) => ({
  search: filters.search || undefined,
  status: filters.status === "all" ? undefined : filters.status,
  from: filters.from || undefined,
  to: filters.to || undefined,
});

export const toTransactionsQuery = (filters: TransactionFilters, page: number): AdminTransactionsQuery => ({
  page,
  limit: TRANSACTIONS_PAGE_SIZE,
  ...toFilterParams(filters),
});

export const isFiltered = (filters: TransactionFilters) =>
  (Object.keys(DEFAULT_TRANSACTION_FILTERS) as (keyof TransactionFilters)[]).some((key) => filters[key] !== DEFAULT_TRANSACTION_FILTERS[key]);

// Only a paid order with a gateway payment can be refunded
export const canRefund = (transaction: Pick<AdminTransaction, "status" | "razorpayPaymentId">) =>
  transaction.status === "paid" && Boolean(transaction.razorpayPaymentId);

// Long gateway ids are shortened for the table, the full value stays in the tooltip
export const shortenReference = (value: string | null) => (value && value.length > 18 ? `${value.slice(0, 8)}…${value.slice(-6)}` : (value ?? "—"));

export function getRangeError(filters: Pick<TransactionFilters, "from" | "to">): string {
  return filters.from && filters.to && filters.from > filters.to ? "From date cannot be after the to date" : "";
}
