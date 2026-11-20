import { apiFetch, apiFetchBlob } from "./apiClient";

// Money is in paise, the smallest currency unit
export type PurchasablePackage = {
  id: string;
  code: "free" | "standard";
  name: string;
  displayTitle: string;
  description: string;
  benefits: string[];
  pricePerListingMonth: number;
  gstPercent: number;
  minListings: number;
  maxListings: number;
  minMonths: number;
  maxMonths: number;
  allowCustomQuantity: boolean;
  allowCustomDuration: boolean;
};

export type SubscriptionQuote = {
  packageId: string;
  listings: number;
  months: number;
  pricePerListingMonth: number;
  gstPercent: number;
  baseAmount: number;
  gstAmount: number;
  totalAmount: number;
  startsAt: string;
  endsAt: string;
  benefits: string[];
};

export type OrderSummary = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  listings: number;
  months: number;
  baseAmount: number;
  gstAmount: number;
  totalAmount: number;
  paidAt: string | null;
};

export type OrderStatus = "created" | "pending" | "paid" | "failed" | "cancelled" | "refunded";

export type CheckoutDetails = {
  keyId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill: { name: string; email: string | null; contact: string };
};

export type CreatedOrder = { order: OrderSummary; quote: SubscriptionQuote; checkout: CheckoutDetails };

export type VerifyPaymentResult = { status: "paid" | "pending"; order: OrderSummary };

export type SubscriptionState = "active" | "low" | "ended" | "none";

export type UserSubscription = {
  id: string;
  packageCode: "free" | "standard";
  packageName: string;
  source: "free_signup" | "purchase" | "admin_gift" | "launch_backfill";
  status: "active" | "exhausted" | "expired" | "cancelled" | "refunded";
  totalCredits: number;
  usedCredits: number;
  remainingCredits: number;
  leadLimit: number | null;
  startsAt: string;
  endsAt: string | null;
  daysLeft: number | null;
};

export type PaymentNotice = { type: "pending" | "failed"; orderId: string; orderNumber: string; createdAt: string };

export type SubscriptionOverview = {
  summary: {
    state: SubscriptionState;
    totalCredits: number;
    usedCredits: number;
    remainingCredits: number;
    reservedCredits: number;
    submittableCredits: number;
    nextEndsAt: string | null;
    daysLeft: number | null;
  };
  subscriptions: UserSubscription[];
  notice: PaymentNotice | null;
};

export type CreditAvailability = { available: number; reserved: number; submittable: number };

export type PaymentRecord = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  listings: number;
  months: number;
  pricePerListingMonth: number;
  gstPercent: number;
  baseAmount: number;
  gstAmount: number;
  totalAmount: number;
  failureReason: string | null;
  paidAt: string | null;
  createdAt: string;
  invoice: { id: string; number: string } | null;
};

export type LedgerEntry = {
  id: string;
  type: "granted" | "used" | "expired" | "admin_added" | "cancelled";
  credits: number;
  reason: string | null;
  createdAt: string;
  property: { id: string; title: string; listingNumber: number } | null;
};

export type PropertyLeadUsage = {
  id: string;
  title: string;
  listingNumber: number;
  status: string;
  leadLimit: number | null;
  leadsReceived: number;
  isLimitReached: boolean;
  expiresAt: string | null;
};

export type PagedResponse<TItem> = { items: TItem[]; page: number; limit: number; total: number };

export type PagingQuery = { page: number; limit: number };

export const SUBSCRIPTION_ERROR_CODES = {
  NO_CREDITS: "SUBSCRIPTION_NO_CREDITS",
  LEAD_LIMIT_REACHED: "PROPERTY_LEAD_LIMIT_REACHED",
} as const;

const BASE_PATH = "/user/subscription";

const authHeaders = (token: string) => ({ Authorization: `Bearer ${token}` });

const pagedPath = (path: string, { page, limit }: PagingQuery) =>
  `${BASE_PATH}/${path}?${new URLSearchParams({ page: String(page), limit: String(limit) }).toString()}`;

const get = <TResponse>(path: string, token: string) =>
  apiFetch<TResponse>(path, { method: "GET", headers: authHeaders(token) });

const post = <TResponse>(path: string, body: unknown, token: string) =>
  apiFetch<TResponse>(path, { method: "POST", body, headers: authHeaders(token) });

export const fetchPackages = (token: string) => get<{ items: PurchasablePackage[] }>(`${BASE_PATH}/packages`, token);

export const fetchSubscriptionOverview = (token: string) => get<SubscriptionOverview>(`${BASE_PATH}/me`, token);

export const fetchCreditAvailability = (token: string) => get<CreditAvailability>(`${BASE_PATH}/credits`, token);

export const fetchSubscriptionHistory = (query: PagingQuery, token: string) =>
  get<PagedResponse<UserSubscription>>(pagedPath("history", query), token);

export const fetchPayments = (query: PagingQuery, token: string) =>
  get<PagedResponse<PaymentRecord>>(pagedPath("payments", query), token);

export const fetchCreditLedger = (query: PagingQuery, token: string) =>
  get<PagedResponse<LedgerEntry>>(pagedPath("usage/ledger", query), token);

export const fetchPropertyLeadUsage = (query: PagingQuery, token: string) =>
  get<PagedResponse<PropertyLeadUsage>>(pagedPath("usage/properties", query), token);

export const requestQuote = (input: { listings: number; months: number }, token: string) =>
  post<SubscriptionQuote>(`${BASE_PATH}/quote`, input, token);

export const createSubscriptionOrder = (input: { listings: number; months: number; gstin?: string }, token: string) =>
  post<CreatedOrder>(`${BASE_PATH}/orders`, input, token);

export const verifySubscriptionPayment = (
  orderId: string,
  payment: { razorpay_payment_id: string; razorpay_signature: string },
  token: string,
) => post<VerifyPaymentResult>(`${BASE_PATH}/orders/${orderId}/verify`, payment, token);

export const downloadInvoicePdf = (invoiceId: string, token: string) =>
  apiFetchBlob(`${BASE_PATH}/invoices/${invoiceId}/download`, token);
