"use client";

import type { PropertySearchCriteria } from "@/lib/property-search-url/searchUrl.types";
import { ActiveFilterChips } from "./ActiveFilterChips";
import { SearchFilterSidebar } from "./SearchFilterSidebar";
import { SearchResultsListPlaceholder } from "./SearchResultsListPlaceholder";
import {
  CLEAR_ALL_PATCH,
  getActiveFilterChips,
} from "./searchFilterChips";
import { buildSearchHeading } from "./searchPageText";
import { useSearchResultsFilters } from "./useSearchResultsFilters";

type PropertySearchResultsContentProps = {
  criteria: PropertySearchCriteria;
};

export function PropertySearchResultsContent({
  criteria,
}: PropertySearchResultsContentProps) {
  const { updateCriteria } = useSearchResultsFilters(criteria);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-slate-800 sm:text-3xl">
        {buildSearchHeading(criteria)}
      </h1>

      <div className="mt-4">
        <ActiveFilterChips
          chips={getActiveFilterChips(criteria)}
          onRemove={(chip) => updateCriteria(chip.clearPatch)}
          onClearAll={() => updateCriteria(CLEAR_ALL_PATCH)}
        />
      </div>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
        <SearchFilterSidebar criteria={criteria} onChange={updateCriteria} />
        <div className="min-w-0 flex-1">
          <SearchResultsListPlaceholder />
        </div>
      </div>
    </main>
  );
}
