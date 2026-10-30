"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { EMPTY_MORE_FILTERS } from "@/lib/property-search-url/moreFilters.types";
import type { PropertySearchCriteria } from "@/lib/property-search-url/searchUrl.types";
import type { CriteriaUpdateMode } from "../useSearchResultsFilters";
import { useCloseSearchFilterBar } from "../search-filter-bar/SearchFilterDropdown";
import { countNavSelections, type MoreFiltersDraft } from "./moreFilterNav";

function draftFromCriteria(criteria: PropertySearchCriteria): MoreFiltersDraft {
  return {
    more: criteria.more,
    constructionStatuses: criteria.constructionStatuses,
    areaMin: criteria.areaMin,
    areaMax: criteria.areaMax,
  };
}

export function useMoreFiltersBar(
  criteria: PropertySearchCriteria,
  onChange: (
    patch: Partial<PropertySearchCriteria>,
    mode?: CriteriaUpdateMode,
  ) => void,
) {
  const closeBarDropdowns = useCloseSearchFilterBar();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<MoreFiltersDraft>(() =>
    draftFromCriteria(criteria),
  );

  useEffect(() => {
    setDraft(draftFromCriteria(criteria));
  }, [criteria]);

  const selectionCount = useMemo(() => countNavSelections(draft), [draft]);

  const commitDraft = useCallback(
    (next: MoreFiltersDraft) => {
      setDraft(next);
      onChange({
        more: next.more,
        constructionStatuses: next.constructionStatuses,
        areaMin: next.areaMin,
        areaMax: next.areaMax,
      });
    },
    [onChange],
  );

  const toggleOpen = () => {
    closeBarDropdowns();
    setOpen((prev) => {
      const next = !prev;
      if (next) setDraft(draftFromCriteria(criteria));
      return next;
    });
  };

  const clearApplied = () => {
    onChange({
      more: { ...EMPTY_MORE_FILTERS },
      constructionStatuses: [],
      areaMin: undefined,
      areaMax: undefined,
    });
  };

  return {
    open,
    draft,
    selectionCount,
    updateDraft: commitDraft,
    toggleOpen,
    clearApplied,
    close: () => setOpen(false),
  };
}
