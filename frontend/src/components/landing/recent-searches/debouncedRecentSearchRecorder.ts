import type { PropertySearchCriteria } from "@/lib/property-search-url/searchUrl.types";

export const RECENT_SEARCH_DEBOUNCE_MS = 800;

export type DebouncedRecentSearchRecorder = {
  schedule: (criteria: PropertySearchCriteria) => void;
  flush: () => void;
};

// Pagination only moves through results; it is not a new search
export const isRecordableCriteriaPatch = (patch: Partial<PropertySearchCriteria>) =>
  Object.keys(patch).some((key) => key !== "page");

// A burst of clicks or a slider drag records only its final criteria
export function createDebouncedRecentSearchRecorder(
  record: (criteria: PropertySearchCriteria) => void,
  delayMs: number = RECENT_SEARCH_DEBOUNCE_MS,
): DebouncedRecentSearchRecorder {
  let pending: PropertySearchCriteria | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const clearTimer = () => {
    if (timer) clearTimeout(timer);
    timer = null;
  };

  const flush = () => {
    clearTimer();
    if (!pending) return;

    const criteria = pending;
    pending = null;
    record(criteria);
  };

  const schedule = (criteria: PropertySearchCriteria) => {
    pending = criteria;
    clearTimer();
    timer = setTimeout(flush, delayMs);
  };

  return { schedule, flush };
}
