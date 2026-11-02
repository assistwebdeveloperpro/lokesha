import type { PropertySearchCriteria } from "@/lib/property-search-url/searchUrl.types";
import {
  buildResultsCountLine,
  buildSearchListPageTitle,
  buildShowingRange,
} from "./buildPropertySearchListPageMeta";

type PropertySearchListStickySummaryProps = {
  criteria: PropertySearchCriteria;
  total: number;
  page: number;
  pageSize: number;
};

export function PropertySearchListStickySummary({
  criteria,
  total,
  page,
  pageSize,
}: PropertySearchListStickySummaryProps) {
  const resultsLine = buildResultsCountLine(total, criteria);
  const showingLine = buildShowingRange(page, pageSize, total);
  const pageTitle = buildSearchListPageTitle(criteria);
  const viewedCount = Math.min(page * pageSize, total);
  const progressPct = total > 0 ? Math.min(100, Math.round((viewedCount / total) * 100)) : 0;

  return (
    <div className="pb-3 pt-2">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h1 className="font-display text-lg font-bold leading-snug text-slate-900 sm:text-xl">
          {resultsLine}
        </h1>
        <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold tabular-nums text-navy-blue hidden sm:block ring-1 ring-sky-100">
          {viewedCount.toLocaleString("en-IN")} of {total.toLocaleString("en-IN")} seen
        </span>
      </div>
      <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">{showingLine}</p>
      <div
        className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuenow={progressPct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Share of matching properties on this page"
      >
        <div
          className="h-full rounded-full bg-linear-to-r from-sky-400 to-navy-blue transition-[width] duration-300"
          style={{ width: `${Math.max(progressPct, 4)}%` }}
        />
      </div>
      <h2 className="sr-only">{pageTitle}</h2>
    </div>
  );
}
