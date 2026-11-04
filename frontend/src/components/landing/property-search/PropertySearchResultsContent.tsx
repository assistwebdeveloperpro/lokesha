"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { normalizeSearchCriteria } from "@/lib/property-search-url/normalizeSearchCriteria";
import type { PropertySearchCriteria } from "@/lib/property-search-url/searchUrl.types";
import { toSearchApiQuery, type SearchSort } from "@/lib/property-search-url/toSearchApiQuery";
import { SCROLLBAR_NAVY_BLUE } from "../home/hero-banner/heroBanner.shared";
import {
  PropertySearchEmptyState,
  PropertySearchListError,
  PropertySearchListSkeleton,
} from "./property-list/PropertySearchListStatus";
import { PropertySearchListBreadcrumbs } from "./property-list/PropertySearchListBreadcrumbs";
import { PropertySearchListSeoSection } from "./property-list/PropertySearchListSeoSection";
import { PropertySearchListStickySort } from "./property-list/PropertySearchListStickySort";
import { PropertySearchListStickySummary } from "./property-list/PropertySearchListStickySummary";
import { PropertySearchListingsSection } from "./property-list/PropertySearchListingsSection";
import { PropertySearchResultsSidebar } from "./property-list/PropertySearchResultsSidebar";
import { PropertySearchSortDropdown } from "./property-list/PropertySearchSortDropdown";
import { SearchFilterBar } from "./search-filter-bar/SearchFilterBar";
import { usePropertySearchResults } from "./usePropertySearchResults";
import { useSearchResultsFilters } from "./useSearchResultsFilters";
import { useSiteHeaderOffset } from "./useSiteHeaderOffset";

const DEFAULT_PAGE_SIZE = 30;
const RESULTS_CONTAINER = "mx-auto w-full max-w-360 px-2 sm:px-4 lg:px-6";
const RESULTS_GRID =
  "lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-x-8 xl:grid-cols-[minmax(0,1fr)_20rem]";

type PropertySearchResultsContentProps = {
  criteria: PropertySearchCriteria;
};

export function PropertySearchResultsContent({
  criteria: rawCriteria,
}: PropertySearchResultsContentProps) {
  const criteria = normalizeSearchCriteria(rawCriteria);
  const { updateCriteria } = useSearchResultsFilters(criteria);
  const filterRef = useRef<HTMLDivElement>(null);
  const summaryBarRef = useRef<HTMLDivElement>(null);
  const [filterHeight, setFilterHeight] = useState(0);
  const [summaryBarHeight, setSummaryBarHeight] = useState(0);
  const headerBottomPx = useSiteHeaderOffset();
  const [sort, setSort] = useState<SearchSort>("recent");
  const { data, error, isLoading, retry } = usePropertySearchResults(
    toSearchApiQuery(criteria, sort),
  );
  const items = data?.items ?? [];
  const otherLocalities = data?.otherLocalities ?? [];
  const total = data?.total ?? 0;
  const page = data?.page ?? criteria.page;
  const pageSize = data?.pageSize ?? DEFAULT_PAGE_SIZE;

  const handleSortChange = (nextSort: SearchSort) => {
    setSort(nextSort);
    if (criteria.page > 1) updateCriteria({ page: 1 });
  };

  useLayoutEffect(() => {
    const filterNode = filterRef.current;
    const summaryNode = summaryBarRef.current;
    if (!filterNode && !summaryNode) return;

    const measure = () => {
      if (filterNode) setFilterHeight(filterNode.offsetHeight);
      if (summaryNode) setSummaryBarHeight(summaryNode.offsetHeight);
    };
    measure();

    const observer = new ResizeObserver(measure);
    if (filterNode) observer.observe(filterNode);
    if (summaryNode) observer.observe(summaryNode);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [criteria, total, page, pageSize, sort]);

  const filterTopPx = headerBottomPx > 0 ? headerBottomPx : undefined;
  const filterMaxHeightPx =
    headerBottomPx > 0
      ? `calc(100dvh - ${headerBottomPx}px - 0.75rem)`
      : "calc(100dvh - 4rem - 0.75rem)";
  const contentStickyTopPx = filterHeight > 0 ? headerBottomPx + filterHeight : 0;
  const sidebarStickyTopPx =
    contentStickyTopPx > 0 ? contentStickyTopPx + summaryBarHeight : undefined;

  return (
    <div className="flex w-full flex-col pb-8">
      <div
        ref={filterRef}
        className="sticky top-14 z-40 w-full bg-white sm:top-16 lg:top-15"
        style={filterTopPx !== undefined ? { top: filterTopPx } : undefined}
      >
        <div
          className={`${SCROLLBAR_NAVY_BLUE} ${RESULTS_CONTAINER} overflow-y-auto overscroll-contain`}
          style={{ maxHeight: filterMaxHeightPx }}
        >
          <div className="py-3">
            <section aria-label="Search filters">
              <SearchFilterBar criteria={criteria} onChange={updateCriteria} />
            </section>
          </div>
        </div>
      </div>

      <div className={RESULTS_CONTAINER}>
        <PropertySearchListBreadcrumbs criteria={criteria} />
      </div>

      <div
        ref={summaryBarRef}
        className="sticky z-30 w-full border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-sm"
        style={{ top: contentStickyTopPx > 0 ? contentStickyTopPx : undefined }}
      >
        <div className={`${RESULTS_CONTAINER} ${RESULTS_GRID}`}>
          <PropertySearchListStickySummary
            criteria={criteria}
            total={total}
            page={page}
            pageSize={pageSize}
          />
          <PropertySearchListStickySort value={sort} onChange={handleSortChange} />
        </div>
      </div>

      <div className="border-t border-slate-100 bg-linear-to-b from-slate-50/90 to-white pb-10 pt-4">
        <div className={`${RESULTS_CONTAINER} ${RESULTS_GRID} lg:items-stretch`}>
          <PropertySearchListSeoSection criteria={criteria} total={total} listings={items} />
          <div className="hidden lg:block" aria-hidden />

          <div className="mb-4 lg:hidden">
            <PropertySearchSortDropdown value={sort} onChange={handleSortChange} />
          </div>

          <div className="min-w-0" aria-busy={isLoading}>
            {error ? (
              <PropertySearchListError message={error} onRetry={retry} />
            ) : !data ? (
              <PropertySearchListSkeleton />
            ) : items.length === 0 ? (
              <PropertySearchEmptyState criteria={criteria} otherLocalities={otherLocalities} />
            ) : (
              <div className={isLoading ? "opacity-60 transition-opacity" : undefined}>
                <PropertySearchListingsSection
                  listings={items}
                  criteria={criteria}
                  total={total}
                  page={page}
                  pageSize={pageSize}
                  onPageChange={(nextPage) => {
                    updateCriteria({ page: nextPage });
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  onPickLocality={(locality) => updateCriteria({ localities: [locality] })}
                  onClearLocalities={() => updateCriteria({ localities: [] })}
                />
              </div>
            )}
          </div>
          <PropertySearchResultsSidebar
            criteria={criteria}
            stickyTopPx={sidebarStickyTopPx}
          />
        </div>
      </div>
    </div>
  );
}
