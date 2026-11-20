"use client";

import { ReceiptText } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { fetchPayments, fetchSubscriptionHistory } from "@/services/userSubscription.service";
import PagedSection from "./PagedSection";
import PaymentsTable from "./PaymentsTable";
import PaymentsTableSkeleton from "./PaymentsTableSkeleton";
import SubscriptionHistoryList from "./SubscriptionHistoryList";
import SubscriptionHistorySkeleton from "./SubscriptionHistorySkeleton";
import { usePagedList } from "./usePagedList";

type HistoryTab = "payments" | "subscriptions";

const TABS: { id: HistoryTab; label: string }[] = [
  { id: "payments", label: "Payment history" },
  { id: "subscriptions", label: "Subscription history" },
];

const PAYMENTS_ERROR = "We could not load your payments. Please try again.";
const SUBSCRIPTIONS_ERROR = "We could not load your subscriptions. Please try again.";

function PaymentsTab() {
  const { page, items, total, isLoading, error, changePage, reload } = usePagedList(fetchPayments, PAYMENTS_ERROR);

  return (
    <PagedSection
      isLoading={isLoading}
      error={error}
      total={total}
      page={page}
      skeleton={<PaymentsTableSkeleton />}
      emptyTitle="No payments yet"
      emptyText="Your Standard package purchases and their invoices will appear here."
      onRetry={reload}
      onPageChange={changePage}
    >
      <PaymentsTable payments={items} />
    </PagedSection>
  );
}

function SubscriptionsTab() {
  const { page, items, total, isLoading, error, changePage, reload } = usePagedList(fetchSubscriptionHistory, SUBSCRIPTIONS_ERROR);

  return (
    <PagedSection
      isLoading={isLoading}
      error={error}
      total={total}
      page={page}
      skeleton={<SubscriptionHistorySkeleton />}
      emptyTitle="No subscriptions yet"
      emptyText="Your Free and Standard packages will be listed here."
      onRetry={reload}
      onPageChange={changePage}
    >
      <SubscriptionHistoryList subscriptions={items} />
    </PagedSection>
  );
}

export default function OrderHistoryContent() {
  const [activeTab, setActiveTab] = useState<HistoryTab>("payments");

  return (
    <div className="w-full px-1 py-0 sm:px-6 lg:px-6">
      <header className="flex items-center gap-3">
        <span className="bg-linear-to-r-navy-blue flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md">
          <ReceiptText className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </span>
        <div>
          <h1 className="font-display text-lg font-bold text-slate-800 lg:text-xl">Order History</h1>
          <p className="text-sm text-slate-500">Your payments, invoices and subscriptions</p>
        </div>
      </header>

      <div role="tablist" aria-label="Order history" className="mt-6 inline-flex rounded-xl bg-slate-100 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            id={`history-tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls="history-panel"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "min-h-10 cursor-pointer rounded-lg px-4 text-sm font-semibold transition",
              activeTab === tab.id ? "bg-white text-navy-blue shadow-sm" : "text-slate-500 hover:text-slate-700",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <section id="history-panel" role="tabpanel" aria-labelledby={`history-tab-${activeTab}`} className="mt-5">
        {activeTab === "payments" ? <PaymentsTab /> : <SubscriptionsTab />}
      </section>
    </div>
  );
}
