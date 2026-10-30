"use client";

import { normalizeSearchCriteria } from "@/lib/property-search-url/normalizeSearchCriteria";
import type { PropertySearchCriteria } from "@/lib/property-search-url/searchUrl.types";
import { SearchFilterBar } from "./search-filter-bar/SearchFilterBar";
import { useSearchResultsFilters } from "./useSearchResultsFilters";

type PropertySearchResultsContentProps = {
  criteria: PropertySearchCriteria;
};

export function PropertySearchResultsContent({
  criteria: rawCriteria,
}: PropertySearchResultsContentProps) {
  const criteria = normalizeSearchCriteria(rawCriteria);
  const { updateCriteria } = useSearchResultsFilters(criteria);

  return (
    <div className="mx-auto w-full max-w-360 flex-1 px-2 py-3 sm:px-4 lg:px-6">
      <section aria-label="Search filters">
        <SearchFilterBar criteria={criteria} onChange={updateCriteria} />
      </section>
    </div>
  );
}
