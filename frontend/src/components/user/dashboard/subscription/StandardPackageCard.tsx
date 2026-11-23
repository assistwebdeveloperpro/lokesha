import { Check, Crown, Infinity as InfinityIcon, ListChecks, CalendarClock } from "lucide-react";
import { formatRupees } from "@/lib/currency";
import type { PurchasablePackage } from "@/services/userSubscription.service";
import QuantityStepper from "./QuantityStepper";
import { plural } from "./subscriptionShared";
import type { usePurchaseFlow } from "./usePurchaseFlow";

type StandardPackageCardProps = {
  pkg: PurchasablePackage;
  flow: ReturnType<typeof usePurchaseFlow>;
};

export default function StandardPackageCard({ pkg, flow }: StandardPackageCardProps) {
  const { listings, months, listingChoices, monthChoices, phase } = flow;
  const isBusy = phase !== "idle";
  const benefits = [
    { icon: ListChecks, text: plural(listings, "Property Listing") },
    { icon: InfinityIcon, text: "Unlimited Leads" },
    { icon: CalendarClock, text: `${plural(months, "Month")} Validity` },
  ];

  return (
    <article className="@container min-w-0 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
      <div className="bg-linear-to-r-navy-blue flex flex-col gap-4 px-4 py-5 text-white @md:flex-row @md:items-start @md:justify-between sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
            <Crown className="h-6 w-6" strokeWidth={1.75} aria-hidden />
          </span>
          <div>
            <span className="rounded-full bg-sky-400/15 px-2.5 py-0.5 text-[11px] font-semibold text-sky-200 ring-1 ring-sky-300/40">
              Choose your own plan
            </span>
            <h2 className="mt-1.5 font-display text-lg font-bold">{pkg.displayTitle}</h2>
          </div>
        </div>
        <div className="@md:text-right">
          <p className="font-display text-2xl font-bold">{formatRupees(pkg.pricePerListingMonth)}</p>
          <p className="text-xs font-medium text-slate-300">per listing / month + {pkg.gstPercent}% GST</p>
        </div>
      </div>

      <div className="space-y-6 p-4 sm:p-6">
        {pkg.description ? <p className="text-sm leading-relaxed text-slate-600">{pkg.description}</p> : null}

        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Customize your plan</h3>
          <div className="mt-3 grid gap-4 @2xl:grid-cols-2">
            <div className="rounded-xl border border-slate-200/90 bg-slate-50/60 p-4">
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
            </div>
            <div className="rounded-xl border border-slate-200/90 bg-slate-50/60 p-4">
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
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">What you get</h3>
          <ul className="mt-3 grid gap-3 @md:grid-cols-2 @2xl:grid-cols-3">
            {benefits.map(({ icon: Icon, text }) => (
              <li key={text} className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200/90 bg-white p-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
                </span>
                <span className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-slate-700">
                  {text}
                  <Check className="h-3.5 w-3.5 text-emerald-500" strokeWidth={3} aria-hidden />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
