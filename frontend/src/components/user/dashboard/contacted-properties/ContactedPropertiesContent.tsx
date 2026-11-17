"use client";

import { Handshake } from "lucide-react";
import ListPagination from "@/components/shared/ui/ListPagination";
import type { ContactedAvailability, ContactedPropertiesSummary as Summary } from "@/services/userContactedProperties.service";
import ContactedPropertiesEmptyState from "./ContactedPropertiesEmptyState";
import ContactedPropertiesSummary from "./ContactedPropertiesSummary";
import ContactedPropertiesTable from "./ContactedPropertiesTable";
import ContactedPropertiesTableSkeleton from "./ContactedPropertiesTableSkeleton";
import { CONTACTED_PAGE_SIZE, CONTACTED_TABS } from "./contactedPropertiesShared";
import { useContactedProperties } from "./useContactedProperties";

function getTabCount(summary: Summary | null, tab: ContactedAvailability): number | null {
  if (!summary) return null;
  if (tab === "available") return summary.available;
  if (tab === "unavailable") return summary.total - summary.available;
  return summary.total;
}

export default function ContactedPropertiesContent() {
  const { availability, page, items, total, summary, isLoading, error, changeAvailability, changePage, reload } =
    useContactedProperties();

  return (
    <div className="w-full px-1 py-0 sm:px-6 lg:px-6">
      <header className="flex items-center gap-3">
        <span className="bg-linear-to-r-navy-blue flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md">
          <Handshake className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </span>
        <div>
          <h1 className="font-display text-lg font-bold text-slate-800 lg:text-xl">Contacted Properties</h1>
          <p className="text-sm text-slate-500">Properties you have enquired about</p>
        </div>
      </header>

      <ContactedPropertiesSummary summary={summary} />

      <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Filter by availability">
        {CONTACTED_TABS.map(({ value, label }) => {
          const isActive = value === availability;
          const count = getTabCount(summary, value);

          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => changeAvailability(value)}
              className={`inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-full border px-3 text-xs md:px-4 md:text-sm font-semibold transition ${
                isActive
                  ? "bg-linear-to-r-navy-blue border-transparent text-white shadow-md"
                  : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
              }`}
            >
              {label}
              {count === null ? null : <span className="tabular-nums opacity-80">{count}</span>}
            </button>
          );
        })}
      </div>

      <section className="mt-4" aria-live="polite">
        {isLoading ? (
          <ContactedPropertiesTableSkeleton />
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
          <ContactedPropertiesEmptyState isFiltered={availability !== "all"} />
        ) : (
          <>
            <ContactedPropertiesTable items={items} />
            <ListPagination page={page} pageSize={CONTACTED_PAGE_SIZE} total={total} onPageChange={changePage} />
          </>
        )}
      </section>
    </div>
  );
}
