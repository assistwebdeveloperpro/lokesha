"use client";

import { ChartColumn } from "lucide-react";
import { fetchCreditLedger, fetchPropertyLeadUsage } from "@/services/userSubscription.service";
import CreditLedgerList from "./CreditLedgerList";
import CreditSummaryTiles from "./CreditSummaryTiles";
import PagedSection from "./PagedSection";
import { CreditLedgerSkeleton, CreditSummaryTilesSkeleton, PropertyLeadUsageSkeleton } from "./PackageUsageSkeletons";
import PropertyLeadUsageList from "./PropertyLeadUsageList";
import { usePagedList } from "./usePagedList";
import { useSubscriptionOverview } from "./useSubscriptionOverview";

const USAGE_ERROR = "We could not load your property usage. Please try again.";
const LEDGER_ERROR = "We could not load your credit activity. Please try again.";

function SectionHeading({ title, text }: { title: string; text: string }) {
  return (
    <div className="mb-3">
      <h2 className="font-display text-base font-bold text-slate-800">{title}</h2>
      <p className="text-sm text-slate-500">{text}</p>
    </div>
  );
}

function PropertyUsageSection() {
  const { page, items, total, isLoading, error, changePage, reload } = usePagedList(fetchPropertyLeadUsage, USAGE_ERROR);

  return (
    <section aria-labelledby="usage-heading">
      <div id="usage-heading">
        <SectionHeading title="Leads per property" text="How many leads each listing has received against its limit" />
      </div>
      <PagedSection
        isLoading={isLoading}
        error={error}
        total={total}
        page={page}
        skeleton={<PropertyLeadUsageSkeleton />}
        emptyTitle="No published properties yet"
        emptyText="Once a property goes live you can follow its leads here."
        onRetry={reload}
        onPageChange={changePage}
      >
        <PropertyLeadUsageList properties={items} />
      </PagedSection>
    </section>
  );
}

function LedgerSection() {
  const { page, items, total, isLoading, error, changePage, reload } = usePagedList(fetchCreditLedger, LEDGER_ERROR);

  return (
    <section aria-labelledby="ledger-heading">
      <div id="ledger-heading">
        <SectionHeading title="Credit activity" text="Every credit added to or used from your account" />
      </div>
      <PagedSection
        isLoading={isLoading}
        error={error}
        total={total}
        page={page}
        skeleton={<CreditLedgerSkeleton />}
        emptyTitle="No credit activity yet"
        emptyText="Credits you receive and use will be listed here."
        onRetry={reload}
        onPageChange={changePage}
      >
        <CreditLedgerList entries={items} />
      </PagedSection>
    </section>
  );
}

export default function PackageUsageContent() {
  const { overview, isLoading, error } = useSubscriptionOverview();

  return (
    <div className="w-full px-1 py-0 sm:px-6 lg:px-6">
      <header className="flex items-center gap-3">
        <span className="bg-linear-to-r-navy-blue flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md">
          <ChartColumn className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </span>
        <div>
          <h1 className="font-display text-lg font-bold text-slate-800 lg:text-xl">My Package Usage</h1>
          <p className="text-sm text-slate-500">Track your credits and the leads on each property</p>
        </div>
      </header>

      <div className="mt-6 space-y-8">
        {isLoading ? <CreditSummaryTilesSkeleton /> : error || !overview ? null : <CreditSummaryTiles summary={overview.summary} />}
        <PropertyUsageSection />
        <LedgerSection />
      </div>
    </div>
  );
}
