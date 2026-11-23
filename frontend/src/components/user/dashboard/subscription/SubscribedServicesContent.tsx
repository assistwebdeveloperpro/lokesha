"use client";

import { PackageCheck } from "lucide-react";
import CreditSummaryTiles from "./CreditSummaryTiles";
import CurrentSubscriptionCard from "./CurrentSubscriptionCard";
import OrderSummaryModal from "./OrderSummaryModal";
import PurchaseCard from "./PurchaseCard";
import SubscribedServicesSkeleton from "./SubscribedServicesSkeleton";
import SubscriptionStateBanner from "./SubscriptionStateBanner";
import { usePurchaseFlow } from "./usePurchaseFlow";
import { useSubscriptionOverview } from "./useSubscriptionOverview";
import type { PurchasablePackage } from "@/services/userSubscription.service";

function PurchaseArea({ pkg, onCompleted }: { pkg: PurchasablePackage; onCompleted: () => void }) {
  const flow = usePurchaseFlow({ pkg, onCompleted });

  return (
    <>
      <PurchaseCard pkg={pkg} flow={flow} />
      {flow.isSummaryOpen ? <OrderSummaryModal flow={flow} /> : null}
    </>
  );
}

export default function SubscribedServicesContent() {
  const { overview, standardPackage, isLoading, error, reload, refresh } = useSubscriptionOverview();

  return (
    <div className="w-full px-1 py-0 sm:px-6 lg:px-6">
      <header className="flex items-center gap-3">
        <span className="bg-linear-to-r-navy-blue flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-md">
          <PackageCheck className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </span>
        <div className="min-w-0">
          <h1 className="font-display text-lg font-bold text-slate-800 lg:text-xl">Subscribed Services</h1>
          <p className="text-sm text-slate-500">Your listing credits, validity and the Standard package</p>
        </div>
      </header>

      <section className="mt-6" aria-live="polite">
        {isLoading ? (
          <SubscribedServicesSkeleton />
        ) : error || !overview ? (
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
        ) : (
          <div className="space-y-6">
            <SubscriptionStateBanner overview={overview} />
            <CreditSummaryTiles summary={overview.summary} />

            {overview.subscriptions.length ? (
              <ul className="grid gap-4 xl:grid-cols-2">
                {overview.subscriptions.map((subscription) => (
                  <CurrentSubscriptionCard key={subscription.id} subscription={subscription} />
                ))}
              </ul>
            ) : null}

            {standardPackage ? (
              <PurchaseArea pkg={standardPackage} onCompleted={refresh} />
            ) : (
              <p className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm font-medium text-slate-500">
                The Standard package is not available for purchase right now.
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
