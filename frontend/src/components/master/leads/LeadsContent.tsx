"use client";

import ListPagination from "@/components/shared/ui/ListPagination";
import LeadsEmptyState from "./LeadsEmptyState";
import LeadsFilterBar from "./LeadsFilterBar";
import LeadsTable from "./LeadsTable";
import LeadsTableSkeleton from "./LeadsTableSkeleton";
import { DEFAULT_LEAD_FILTERS, LEADS_PAGE_SIZE } from "./leadsShared";
import { useLeads } from "./useLeads";

export default function LeadsContent() {
  const { leads, total, page, filters, isLoading, error, applyFilters, changePage, reload } = useLeads();
  const isFiltered = Object.keys(DEFAULT_LEAD_FILTERS).some(
    (key) => filters[key as keyof typeof filters] !== DEFAULT_LEAD_FILTERS[key as keyof typeof filters],
  );

  return (
    <div className="w-full px-1 py-0 sm:px-6 lg:px-6">
      <header>
        <h1 className="font-display text-xl font-bold text-slate-800 lg:text-2xl">Leads</h1>
        {!isLoading && !error ? (
          <p className="mt-1 text-sm text-slate-500">
            {total} {total === 1 ? "lead" : "leads"}
          </p>
        ) : null}
      </header>

      <LeadsFilterBar applied={filters} onApply={applyFilters} isLoading={isLoading} />

      <section className="mt-6" aria-live="polite">
        {isLoading ? (
          <LeadsTableSkeleton />
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
        ) : leads.length === 0 ? (
          <LeadsEmptyState isFiltered={isFiltered} />
        ) : (
          <>
            <LeadsTable leads={leads} />
            <ListPagination page={page} pageSize={LEADS_PAGE_SIZE} total={total} onPageChange={changePage} />
          </>
        )}
      </section>
    </div>
  );
}
