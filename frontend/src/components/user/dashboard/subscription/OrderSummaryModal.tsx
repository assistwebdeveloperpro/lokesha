"use client";

import { CalendarDays } from "lucide-react";
import { formatRupees } from "@/lib/currency";
import PaymentDialog from "./PaymentDialog";
import PriceBreakdown from "./PriceBreakdown";
import { formatDate, getPayLabel, plural } from "./subscriptionShared";
import type { usePurchaseFlow } from "./usePurchaseFlow";

type OrderSummaryModalProps = {
  flow: ReturnType<typeof usePurchaseFlow>;
};

export default function OrderSummaryModal({ flow }: OrderSummaryModalProps) {
  const { quote, phase, message, gstin, gstinError } = flow;

  if (!quote) return null;

  return (
    <PaymentDialog
      headingId="order-summary-heading"
      title="Order summary"
      subtitle="Check the details before you pay"
      closeLabel="Close order summary"
      isBusy={phase !== "idle"}
      payLabel={getPayLabel(phase, quote.totalAmount)}
      gstin={gstin}
      gstinError={gstinError}
      message={message}
      onGstinChange={flow.changeGstin}
      onClose={flow.closeSummary}
      onPay={flow.pay}
    >
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
    </PaymentDialog>
  );
}
