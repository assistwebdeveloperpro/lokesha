"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { normalizeSearchCriteria } from "@/lib/property-search-url/normalizeSearchCriteria";
import type { PropertySearchCriteria } from "@/lib/property-search-url/searchUrl.types";
import { SCROLLBAR_NAVY_BLUE } from "../home/hero-banner/heroBanner.shared";
import { SearchFilterBar } from "./search-filter-bar/SearchFilterBar";
import { useSearchResultsFilters } from "./useSearchResultsFilters";

const SEARCH_FILTER_BAR_TOP =
  "top-[6rem] sm:top-[6.75rem] lg:top-[9.5rem]";

const SEARCH_FILTER_BAR_MAX_HEIGHT =
  "max-h-[calc(100dvh-6rem-0.75rem)] sm:max-h-[calc(100dvh-6.75rem-0.75rem)] lg:max-h-[calc(100dvh-9.5rem-0.75rem)]";

type PropertySearchResultsContentProps = {
  criteria: PropertySearchCriteria;
};

export function PropertySearchResultsContent({
  criteria: rawCriteria,
}: PropertySearchResultsContentProps) {
  const criteria = normalizeSearchCriteria(rawCriteria);
  const { updateCriteria } = useSearchResultsFilters(criteria);
  const barRef = useRef<HTMLDivElement>(null);
  const [barHeight, setBarHeight] = useState(0);

  useLayoutEffect(() => {
    const node = barRef.current;
    if (!node) return;

    const measure = () => setBarHeight(node.offsetHeight);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(node);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-360 flex-1 flex-col px-2 py-3 sm:px-4 lg:px-6">
      <div
        ref={barRef}
        className={`${SCROLLBAR_NAVY_BLUE} fixed inset-x-0 z-30 overflow-y-auto overscroll-contain ${SEARCH_FILTER_BAR_TOP} ${SEARCH_FILTER_BAR_MAX_HEIGHT}`}
      >
        <div className="mx-auto w-full max-w-360 px-2 pb-4 pt-1 sm:px-4 lg:px-6">
          <section aria-label="Search filters">
            <SearchFilterBar criteria={criteria} onChange={updateCriteria} />
          </section>
        </div>
      </div>
      <div
        aria-hidden
        className="mb-3 shrink-0"
        style={{ height: barHeight }}
      />
    </div>
  );
}
