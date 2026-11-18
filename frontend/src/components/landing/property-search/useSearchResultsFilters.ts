"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  createDebouncedRecentSearchRecorder,
  isRecordableCriteriaPatch,
} from "@/components/landing/recent-searches/debouncedRecentSearchRecorder";
import { recordRecentSearch } from "@/components/landing/recent-searches/recordRecentSearch";
import {
  ALL_INDIA_LABEL,
  CITY_CHANGE_EVENT,
  readStoredCity,
  storeCity,
} from "@/components/shared/layout/city-selector/citySelector.shared";
import { buildSearchUrl } from "@/lib/property-search-url/buildSearchUrl";
import { normalizeSearchCriteria } from "@/lib/property-search-url/normalizeSearchCriteria";
import type { PropertySearchCriteria } from "@/lib/property-search-url/searchUrl.types";

export type CriteriaUpdateMode = "push" | "replace";

const sameCity = (a: string | undefined, b: string | undefined) =>
  (a ?? "").toLowerCase() === (b ?? "").toLowerCase();

export function useSearchResultsFilters(criteria: PropertySearchCriteria) {
  const router = useRouter();
  const criteriaRef = useRef(criteria);

  useEffect(() => {
    criteriaRef.current = criteria;
  }, [criteria]);

  const [recorder] = useState(() =>
    createDebouncedRecentSearchRecorder((next) => void recordRecentSearch(next)),
  );

  // A pending search is saved when the user leaves the results page
  useEffect(() => recorder.flush, [recorder]);

  const navigate = useCallback(
    (next: PropertySearchCriteria, mode: CriteriaUpdateMode) => {
      const url = buildSearchUrl(next);
      if (mode === "replace") router.replace(url, { scroll: false });
      else router.push(url, { scroll: false });
    },
    [router],
  );

  // Every user-driven filter change counts as a search; page changes do not.
  const updateCriteria = useCallback(
    (
      patch: Partial<PropertySearchCriteria>,
      mode: CriteriaUpdateMode = "push",
    ) => {
      const next = normalizeSearchCriteria({
        ...criteriaRef.current,
        page: 1,
        ...patch,
      });
      if (isRecordableCriteriaPatch(patch)) recorder.schedule(next);
      navigate(next, mode);
    },
    [navigate, recorder],
  );

  // Header city change: new city, old locality/project no longer apply.
  useEffect(() => {
    const handleCityChange = () => {
      const stored = readStoredCity();
      const cityName = stored === ALL_INDIA_LABEL ? undefined : stored;
      if (sameCity(cityName, criteriaRef.current.cityName)) return;
      // Automatic sync with the header, not a search by the user
      navigate(
        normalizeSearchCriteria({
          ...criteriaRef.current,
          page: 1,
          cityName,
          localities: [],
          projects: [],
        }),
        "replace",
      );
    };
    window.addEventListener(CITY_CHANGE_EVENT, handleCityChange);
    return () => window.removeEventListener(CITY_CHANGE_EVENT, handleCityChange);
  }, [navigate]);

  // Direct visit: the url city wins over the stored header city.
  const urlCity = criteria.cityName;
  useEffect(() => {
    if (urlCity && !sameCity(urlCity, readStoredCity())) storeCity(urlCity);
  }, [urlCity]);

  return { updateCriteria };
}
