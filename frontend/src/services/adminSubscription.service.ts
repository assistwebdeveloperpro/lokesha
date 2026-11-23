import { apiFetch, apiFetchBlob } from "./apiClient";
import type {
  LedgerEntry,
  OrderStatus,
  PagedResponse,
  PagingQuery,
  PaymentRecord,
  SubscriptionOverview,
  UserSubscription,
} from "./userSubscription.service";

export type SubscriptionPackageCode = "free" | "standard";
export type SubscriptionPackageStatus = "active" | "inactive";

// Money is in whole rupees
export type SubscriptionPackage = {
  id: string;
  code: SubscriptionPackageCode;
  name: string;
  displayTitle: string;
  description: string;
  benefits: string[];
  status: SubscriptionPackageStatus;
  displayOrder: number;
  pricePerListingMonth: number;
  gstPercent: number;
  minListings: number;
  maxListings: number;
  minMonths: number;
  maxMonths: number;
  allowCustomQuantity: boolean;
  allowCustomDuration: boolean;
  freeCredits: number | null;
  freeLeadLimit: number | null;
  freePropertyValidityDays: number | null;
  createdAt: string;
  updatedAt: string;
};

export type UpdateSubscriptionPackageInput = Partial<
  Omit<SubscriptionPackage, "id" | "code" | "createdAt" | "updatedAt">
>;

export type PackageChange = { from: unknown; to: unknown };

export type PackageAuditLog = {
  id: string;
  admin: { id: string; name: string } | null;
  changes: Record<string, PackageChange>;
  createdAt: string;
};

export type PackageAuditLogsResponse = {
  items: PackageAuditLog[];
  page: number;
  limit: number;
  total: number;
};

const BASE_PATH = "/master/subscription/packages";

const authHeaders = (token: string) => ({ Authorization: `Bearer ${token}` });

export function fetchSubscriptionPackages(token: string) {
  return apiFetch<{ items: SubscriptionPackage[] }>(BASE_PATH, {
    method: "GET",
    headers: authHeaders(token),
  });
}

export function updateSubscriptionPackage(id: string, input: UpdateSubscriptionPackageInput, token: string) {
  return apiFetch<{ message: string; package: SubscriptionPackage }>(`${BASE_PATH}/${id}`, {
    method: "PATCH",
    body: input,
    headers: authHeaders(token),
  });
}

export function fetchPackageAuditLogs(id: string, query: { page: number; limit: number }, token: string) {
  const params = new URLSearchParams({ page: String(query.page), limit: String(query.limit) });

  return apiFetch<PackageAuditLogsResponse>(`${BASE_PATH}/${id}/audit-logs?${params.toString()}`, {
    method: "GET",
    headers: authHeaders(token),
  });
}

export type AdminUserRow = {
  id: string;
  name: string;
  mobile: string;
  email: string | null;
  packages: SubscriptionPackageCode[];
  creditsBought: number;
  creditsUsed: number;
  startsAt: string;
  endsAt: string | null;
  amountPaid: number;
  paymentStatus: OrderStatus | null;
  hasActiveSubscription: boolean;
};

export type AdminUsersQuery = PagingQuery & {
  search?: string;
  package?: SubscriptionPackageCode;
  status?: "active" | "expired" | "exhausted" | "cancelled" | "refunded";
};

export type AdminUserDetail = SubscriptionOverview & {
  user: { id: string; name: string; mobile: string; email: string | null; role: string; joinedAt: string };
};

export type AdminTransaction = {
  id: string;
  orderNumber: string;
  user: { id: string; name: string; mobile: string };
  packageName: string;
  listings: number;
  months: number;
  pricePerListingMonth: number;
  gstPercent: number;
  baseAmount: number;
  gstAmount: number;
  totalAmount: number;
  status: OrderStatus;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  failureReason: string | null;
  userGstin: string | null;
  paidAt: string | null;
  refundedAt: string | null;
  createdAt: string;
  invoice: { id: string; number: string } | null;
  creditNote: { id: string; number: string } | null;
};

export type AdminTransactionsFilters = {
  search?: string;
  status?: OrderStatus;
  from?: string;
  to?: string;
  userId?: string;
};

export type AdminTransactionsQuery = PagingQuery & AdminTransactionsFilters;

export type ReportsOverview = {
  range: { from: string | null; to: string | null };
  revenue: {
    paidOrders: number;
    baseAmount: number;
    gstCollected: number;
    totalAmount: number;
    refundedOrders: number;
    refundedAmount: number;
  };
  payments: { failed: number; pending: number };
  users: { activeStandard: number; exhaustedFree: number };
};

export type AdminActionType = "gift_credits" | "extend" | "refund";

export type AdminAction = {
  id: string;
  type: AdminActionType;
  reason: string;
  details: Record<string, unknown>;
  subscriptionId: string | null;
  orderId: string | null;
  admin: { id: string; name: string } | null;
  createdAt: string;
};

export type InvoiceSettings = {
  legalName: string;
  address: string;
  gstin: string;
  sacCode: string;
  invoicePrefix: string;
  creditNotePrefix: string;
  updatedAt: string | null;
  isInvoiceReady: boolean;
};

export type UpdateInvoiceSettingsInput = Partial<Omit<InvoiceSettings, "updatedAt" | "isInvoiceReady">>;

const SUBSCRIPTION_PATH = "/master/subscription";

function toQueryString(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  return query.toString();
}

const get = <TResponse>(path: string, token: string) =>
  apiFetch<TResponse>(path, { method: "GET", headers: authHeaders(token) });

const send = <TResponse>(method: "POST" | "PATCH", path: string, body: unknown, token: string) =>
  apiFetch<TResponse>(path, { method, body, headers: authHeaders(token) });

export const fetchSubscriptionUsers = (query: AdminUsersQuery, token: string) =>
  get<PagedResponse<AdminUserRow>>(`${SUBSCRIPTION_PATH}/users?${toQueryString(query)}`, token);

export const fetchSubscriptionUserDetail = (userId: string, token: string) =>
  get<AdminUserDetail>(`${SUBSCRIPTION_PATH}/users/${userId}`, token);

export const fetchUserSubscriptionHistory = (userId: string, query: PagingQuery, token: string) =>
  get<PagedResponse<UserSubscription>>(`${SUBSCRIPTION_PATH}/users/${userId}/history?${toQueryString(query)}`, token);

export const fetchUserPayments = (userId: string, query: PagingQuery, token: string) =>
  get<PagedResponse<PaymentRecord>>(`${SUBSCRIPTION_PATH}/users/${userId}/payments?${toQueryString(query)}`, token);

export const fetchUserLedger = (userId: string, query: PagingQuery, token: string) =>
  get<PagedResponse<LedgerEntry>>(`${SUBSCRIPTION_PATH}/users/${userId}/ledger?${toQueryString(query)}`, token);

export const fetchUserActions = (userId: string, query: PagingQuery, token: string) =>
  get<PagedResponse<AdminAction>>(`${SUBSCRIPTION_PATH}/actions?${toQueryString({ userId, ...query })}`, token);

export const fetchAdminTransactions = (query: AdminTransactionsQuery, token: string) =>
  get<PagedResponse<AdminTransaction>>(`${SUBSCRIPTION_PATH}/transactions?${toQueryString(query)}`, token);

// The file needs the login token, so it is fetched as a blob and saved by the page
export const exportAdminTransactions = (filters: AdminTransactionsFilters, token: string) =>
  apiFetchBlob(`${SUBSCRIPTION_PATH}/transactions/export?${toQueryString(filters)}`, token);

export const downloadAdminInvoicePdf = (invoiceId: string, token: string) =>
  apiFetchBlob(`${SUBSCRIPTION_PATH}/invoices/${invoiceId}/download`, token);

export const fetchReportsOverview = (range: { from?: string; to?: string }, token: string) =>
  get<ReportsOverview>(`${SUBSCRIPTION_PATH}/reports/overview?${toQueryString(range)}`, token);

export const giftCredits = (input: { userId: string; credits: number; months: number; reason: string }, token: string) =>
  send<{ message: string; subscriptionId: string; credits: number; endsAt: string }>("POST", `${SUBSCRIPTION_PATH}/actions/gift-credits`, input, token);

export const extendSubscription = (input: { subscriptionId: string; months: number; reason: string }, token: string) =>
  send<{ message: string; subscriptionId: string; endsAt: string }>("POST", `${SUBSCRIPTION_PATH}/actions/extend`, input, token);

export const refundOrder = (input: { orderId: string; reason: string }, token: string) =>
  send<{ message: string; orderId: string; cancelledCredits: number; creditNote: { id: string; number: string } | null }>(
    "POST",
    `${SUBSCRIPTION_PATH}/actions/refund`,
    input,
    token,
  );

export const fetchInvoiceSettings = (token: string) => get<InvoiceSettings>(`${SUBSCRIPTION_PATH}/settings`, token);

export const updateInvoiceSettings = (input: UpdateInvoiceSettingsInput, token: string) =>
  send<{ message: string; settings: InvoiceSettings }>("PATCH", `${SUBSCRIPTION_PATH}/settings`, input, token);
