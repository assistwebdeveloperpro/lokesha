"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import {
  ALL_INDIA_LABEL,
  CITY_CHANGE_EVENT,
  readStoredCity,
  storeCity,
} from "@/components/shared/layout/city-selector/citySelector.shared";
import { buildSearchUrl } from "@/lib/property-search-url/buildSearchUrl";
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

  const updateCriteria = useCallback(
    (
      patch: Partial<PropertySearchCriteria>,
      mode: CriteriaUpdateMode = "push",
    ) => {
      const next = { ...criteriaRef.current, page: 1, ...patch };
      const url = buildSearchUrl(next);
      if (mode === "replace") router.replace(url, { scroll: false });
      else router.push(url, { scroll: false });
    },
    [router],
  );

  // Header city change: new city, old locality/project no longer apply.
  useEffect(() => {
    const handleCityChange = () => {
      const stored = readStoredCity();
      const cityName = stored === ALL_INDIA_LABEL ? undefined : stored;
      if (sameCity(cityName, criteriaRef.current.cityName)) return;
      updateCriteria({ cityName, localities: [], projects: [] }, "replace");
    };
    window.addEventListener(CITY_CHANGE_EVENT, handleCityChange);
    return () => window.removeEventListener(CITY_CHANGE_EVENT, handleCityChange);
  }, [updateCriteria]);

  // Direct visit: the url city wins over the stored header city.
  const urlCity = criteria.cityName;
  useEffect(() => {
    if (urlCity && !sameCity(urlCity, readStoredCity())) storeCity(urlCity);
  }, [urlCity]);

  return { updateCriteria };
}
