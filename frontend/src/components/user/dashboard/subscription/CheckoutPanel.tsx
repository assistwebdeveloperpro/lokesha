import { ArrowRight, Loader2, Lock, ShoppingCart } from "lucide-react";
import type { PurchasablePackage } from "@/services/userSubscription.service";
import PriceBreakdown from "./PriceBreakdown";
import { plural } from "./subscriptionShared";
import type { usePurchaseFlow } from "./usePurchaseFlow";

type CheckoutPanelProps = {
  pkg: PurchasablePackage;
  flow: ReturnType<typeof usePurchaseFlow>;
};

export default function CheckoutPanel({ pkg, flow }: CheckoutPanelProps) {
  const { listings, months, preview, phase, message } = flow;
  const isBusy = phase !== "idle";
  const isQuoting = phase === "quoting";

  return (
    <aside className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm xl:sticky xl:top-24">
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4 sm:px-6">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
          <ShoppingCart className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </span>
        <h2 className="font-display text-base font-bold text-slate-800">Order summary</h2>
      </div>

      <div className="space-y-5 p-4 sm:p-6">
        <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
          <p className="text-sm font-bold text-slate-800">{pkg.displayTitle}</p>
          <p className="mt-0.5 text-sm font-medium text-slate-500">
            {plural(listings, "listing")} for {plural(months, "month")}
          </p>
        </div>

        <PriceBreakdown {...preview} gstPercent={pkg.gstPercent} />

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

        <div className="space-y-3">
          <button
            type="button"
            disabled={isBusy}
            onClick={flow.openSummary}
            className="bg-linear-to-r-navy-blue inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold text-white shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isQuoting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
            {isQuoting ? "Preparing..." : "Review order"}
            {isQuoting ? null : <ArrowRight className="h-4 w-4" aria-hidden />}
          </button>
          <p className="flex items-center justify-center gap-1.5 text-xs font-medium text-slate-400">
            <Lock className="h-3 w-3" aria-hidden />
            Secure payment powered by Razorpay
          </p>
        </div>
      </div>
    </aside>
  );
}
