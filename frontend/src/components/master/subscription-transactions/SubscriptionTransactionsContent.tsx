"use client";

import { ReceiptText } from "lucide-react";
import { useState } from "react";
import RefundOrderModal from "@/components/master/subscription-actions/RefundOrderModal";
import ListPagination from "@/components/shared/ui/ListPagination";
import { useToast } from "@/components/shared/ui/ToastProvider";
import type { AdminTransaction } from "@/services/adminSubscription.service";
import TransactionsFilterBar from "./TransactionsFilterBar";
import TransactionsTable from "./TransactionsTable";
import TransactionsTableSkeleton from "./TransactionsTableSkeleton";
import { TRANSACTIONS_PAGE_SIZE, isFiltered } from "./transactionsShared";
import { useTransactions } from "./useTransactions";

export default function SubscriptionTransactionsContent() {
  const { showToast } = useToast();
  const { items, total, page, filters, isLoading, error, isExporting, applyFilters, changePage, reload, exportCsv } = useTransactions();
  const [refunding, setRefunding] = useState<AdminTransaction | null>(null);

  return (
    <div className="w-full px-1 py-0 sm:px-6 lg:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="bg-linear-to-r-navy-blue flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md">
            <ReceiptText className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div>
            <h1 className="font-display text-lg font-bold text-slate-800 lg:text-xl">Subscription Transactions</h1>
            <p className="text-sm text-slate-500">Every Standard package purchase, with its payment status</p>
          </div>
        </div>
        {!isLoading && !error ? (
          <span className="inline-flex items-center rounded-full bg-sky-50 px-3.5 py-1.5 text-sm font-semibold text-sky-700 ring-1 ring-sky-200">
            {total} {total === 1 ? "transaction" : "transactions"}
          </span>
        ) : null}
      </header>

      <TransactionsFilterBar applied={filters} isLoading={isLoading} isExporting={isExporting} onApply={applyFilters} onExport={exportCsv} />

      <section className="mt-6" aria-live="polite">
        {isLoading ? (
          <TransactionsTableSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center rounded-2xl border border-slate-200/90 bg-white px-6 py-14 text-center shadow-sm">
            <p className="text-sm font-medium text-red-600" role="alert">
              {error}
            </p>
            <button
              type="button"
              onClick={reload}
              className="bg-linear-to-r-navy-blue mt-5 min-h-10 cursor-pointer rounded-xl px-6 text-sm font-semibold text-white shadow-md"
            >
              Try again
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <p className="font-display text-base font-bold text-slate-700">{isFiltered(filters) ? "No transactions match these filters" : "No transactions yet"}</p>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {isFiltered(filters) ? "Try a different search, status or date range." : "Package and lead purchases will appear here."}
            </p>
          </div>
        ) : (
          <>
            <TransactionsTable transactions={items} onRefund={setRefunding} />
            <ListPagination page={page} pageSize={TRANSACTIONS_PAGE_SIZE} total={total} onPageChange={changePage} />
          </>
        )}
      </section>

      {refunding ? (
        <RefundOrderModal
          order={refunding}
          onClose={() => setRefunding(null)}
          onDone={(message) => {
            showToast(message, "success");
            setRefunding(null);
            reload();
          }}
        />
      ) : null}
    </div>
  );
}
