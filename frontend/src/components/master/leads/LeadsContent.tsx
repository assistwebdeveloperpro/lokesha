"use client";

import { Users } from "lucide-react";
import ListPagination from "@/components/shared/ui/ListPagination";
import LeadsEmptyState from "./LeadsEmptyState";
import LeadsFilterBar from "./LeadsFilterBar";
import LeadsTable from "./LeadsTable";
import LeadsTableSkeleton from "./LeadsTableSkeleton";
import { DEFAULT_LEAD_FILTERS, LEADS_PAGE_SIZE } from "./leadsShared";
import { useLeads } from "./useLeads";

type LeadsContentProps = {
  highlightLeadId?: string | null;
};

export default function LeadsContent({ highlightLeadId = null }: LeadsContentProps) {
  const {
    leads,
    total,
    page,
    filters,
    isLoading,
    error,
    sendingId,
    sendError,
    applyFilters,
    changePage,
    reload,
    sendLead,
  } = useLeads(highlightLeadId);
  const isFiltered = Object.keys(DEFAULT_LEAD_FILTERS).some(
    (key) => filters[key as keyof typeof filters] !== DEFAULT_LEAD_FILTERS[key as keyof typeof filters],
  );

  return (
    <div className="w-full px-1 py-0 sm:px-6 lg:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="bg-linear-to-r-navy-blue flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md">
            <Users className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div>
            <h1 className="font-display text-lg font-bold text-slate-800 lg:text-xl">Leads</h1>
            <p className="text-sm text-slate-500">Enquiries received on property listings</p>
          </div>
        </div>
        {!isLoading && !error ? (
          <span className="inline-flex items-center rounded-full bg-sky-50 px-3.5 py-1.5 text-sm font-semibold text-sky-700 ring-1 ring-sky-200">
            {total} {total === 1 ? "lead" : "leads"}
          </span>
        ) : null}
      </header>

      <LeadsFilterBar applied={filters} onApply={applyFilters} />

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
            <LeadsTable
              leads={leads}
              highlightLeadId={highlightLeadId}
              sendingId={sendingId} sendError={sendError} onSend={sendLead} />
            <ListPagination page={page} pageSize={LEADS_PAGE_SIZE} total={total} onPageChange={changePage} />
          </>
        )}
      </section>
    </div>
  );
}
