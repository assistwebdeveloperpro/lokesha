import { ArrowRight, Check, Crown, Loader2 } from "lucide-react";
import { formatRupees } from "@/lib/currency";
import type { PurchasablePackage } from "@/services/userSubscription.service";
import PriceBreakdown from "./PriceBreakdown";
import QuantityStepper from "./QuantityStepper";
import { plural } from "./subscriptionShared";
import type { usePurchaseFlow } from "./usePurchaseFlow";

type PurchaseCardProps = {
  pkg: PurchasablePackage;
  flow: ReturnType<typeof usePurchaseFlow>;
};

export default function PurchaseCard({ pkg, flow }: PurchaseCardProps) {
  const { listings, months, listingChoices, monthChoices, preview, phase, message } = flow;
  const isBusy = phase !== "idle";
  const benefits = [plural(listings, "Property Listing"), "Unlimited Leads", `${plural(months, "Month")} Validity`];

  return (
    <section id="buy-standard" className="scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
      <div className="bg-linear-to-r-navy-blue flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-white sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
            <Crown className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div>
            <h2 className="font-display text-base font-bold">{pkg.displayTitle}</h2>
            <p className="text-xs font-medium text-slate-300">
              {formatRupees(pkg.pricePerListingMonth)} per listing per month + {pkg.gstPercent}% GST
            </p>
          </div>
        </div>
        <span className="rounded-full bg-sky-400/15 px-3 py-1 text-xs font-semibold text-sky-200 ring-1 ring-sky-300/40">
          Choose your own plan
        </span>
      </div>

      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-5">
          {pkg.description ? <p className="text-sm leading-relaxed text-slate-600">{pkg.description}</p> : null}

          <QuantityStepper
            id="purchase-listings"
            label="Number of listings"
            unit="listing"
            value={listings}
            min={listingChoices.min}
            max={listingChoices.max}
            disabled={isBusy}
            onChange={flow.changeListings}
          />
          <QuantityStepper
            id="purchase-months"
            label="Duration"
            unit="month"
            value={months}
            min={monthChoices.min}
            max={monthChoices.max}
            disabled={isBusy}
            onChange={flow.changeMonths}
          />

          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">What you get</h3>
            <ul className="mt-2.5 space-y-2">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2.5 text-sm font-medium text-slate-700">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-5 rounded-2xl bg-slate-50/70 p-4 ring-1 ring-slate-100 sm:p-5">
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Your plan</p>
              <p className="mt-1 font-display text-lg font-bold text-slate-800">
                {plural(listings, "listing")} for {plural(months, "month")}
              </p>
            </div>
            <PriceBreakdown {...preview} gstPercent={pkg.gstPercent} />
          </div>

          <div className="space-y-3">
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
            <button
              type="button"
              disabled={isBusy}
              onClick={flow.openSummary}
              className="bg-linear-to-r-navy-blue inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold text-white shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {phase === "quoting" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
              {phase === "quoting" ? "Preparing..." : "Review order"}
              {phase === "quoting" ? null : <ArrowRight className="h-4 w-4" aria-hidden />}
            </button>
            <p className="text-center text-xs font-medium text-slate-400">Secure payment powered by Razorpay</p>
          </div>
        </div>
      </div>
    </section>
  );
}
