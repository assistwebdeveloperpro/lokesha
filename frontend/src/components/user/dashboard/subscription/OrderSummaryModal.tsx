"use client";

import { CalendarDays, Loader2, Lock, X } from "lucide-react";
import { useEffect } from "react";
import { formatRupees } from "@/lib/currency";
import PriceBreakdown from "./PriceBreakdown";
import { formatDate, plural } from "./subscriptionShared";
import type { usePurchaseFlow } from "./usePurchaseFlow";

type OrderSummaryModalProps = {
  flow: ReturnType<typeof usePurchaseFlow>;
};

export default function OrderSummaryModal({ flow }: OrderSummaryModalProps) {
  const { quote, phase, message, gstin, gstinError } = flow;
  const isBusy = phase !== "idle";
  const { closeSummary } = flow;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isBusy) closeSummary();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isBusy, closeSummary]);

  if (!quote) return null;

  const buttonLabel = phase === "verifying" ? "Confirming payment..." : phase === "paying" ? "Opening payment..." : `Pay ${formatRupees(quote.totalAmount)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close order summary"
        disabled={isBusy}
        onClick={closeSummary}
        className="absolute inset-0 cursor-pointer bg-slate-900/50"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-summary-heading"
        className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
      >
        <header className="bg-linear-to-r-navy-blue flex items-start justify-between gap-4 px-5 py-4 text-white sm:px-6">
          <div>
            <h2 id="order-summary-heading" className="font-display text-lg font-bold">
              Order summary
            </h2>
            <p className="text-xs font-medium text-slate-300">Check the details before you pay</p>
          </div>
          <button
            type="button"
            aria-label="Close"
            disabled={isBusy}
            onClick={closeSummary}
            className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
          <dl className="divide-y divide-slate-100 rounded-xl border border-slate-100 text-sm">
            {[
              ["Package", "Standard"],
              ["Listings", plural(quote.listings, "listing")],
              ["Duration", plural(quote.months, "month")],
              ["Price per listing per month", formatRupees(quote.pricePerListingMonth)],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 px-4 py-3">
                <dt className="font-medium text-slate-500">{label}</dt>
                <dd className="font-semibold text-slate-800">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="flex items-start gap-3 rounded-xl bg-sky-50 px-4 py-3 ring-1 ring-sky-100">
            <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" aria-hidden />
            <p className="text-sm font-medium text-sky-900">
              Valid from <span className="font-bold">{formatDate(quote.startsAt)}</span> to{" "}
              <span className="font-bold">{formatDate(quote.endsAt)}</span>
            </p>
          </div>

          <PriceBreakdown
            baseAmount={quote.baseAmount}
            gstAmount={quote.gstAmount}
            totalAmount={quote.totalAmount}
            gstPercent={quote.gstPercent}
          />

          <div>
            <label htmlFor="purchase-gstin" className="text-sm font-semibold text-slate-700">
              GSTIN <span className="font-medium text-slate-400">(optional, shown on the invoice)</span>
            </label>
            <input
              id="purchase-gstin"
              type="text"
              maxLength={15}
              autoComplete="off"
              placeholder="e.g. 24AAACC1206D1ZM"
              value={gstin}
              disabled={isBusy}
              onChange={(event) => flow.changeGstin(event.target.value)}
              aria-invalid={Boolean(gstinError)}
              className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium uppercase text-slate-900 shadow-sm outline-none transition placeholder:normal-case placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 disabled:bg-slate-50"
            />
            {gstinError ? (
              <p className="mt-1 text-xs text-red-500" role="alert">
                {gstinError}
              </p>
            ) : null}
          </div>

          {message ? (
            <p
              role={message.type === "error" ? "alert" : "status"}
              className={`rounded-xl px-3.5 py-2.5 text-sm font-medium ring-1 ${
                message.type === "error" ? "bg-red-50 text-red-700 ring-red-200" : "bg-sky-50 text-sky-800 ring-sky-200"
              }`}
            >
              {message.text}
            </p>
          ) : null}
        </div>

        <footer className="space-y-3 border-t border-slate-200 bg-slate-50/70 px-5 py-4 sm:px-6">
          <div className="flex gap-3">
            <button
              type="button"
              disabled={isBusy}
              onClick={closeSummary}
              className="min-h-12 cursor-pointer rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Back
            </button>
            <button
              type="button"
              disabled={isBusy}
              onClick={flow.pay}
              className="bg-linear-to-r-navy-blue inline-flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold text-white shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Lock className="h-4 w-4" aria-hidden />}
              {buttonLabel}
            </button>
          </div>
          <p className="text-center text-xs font-medium text-slate-400">Secure payment powered by Razorpay</p>
        </footer>
      </div>
    </div>
  );
}
