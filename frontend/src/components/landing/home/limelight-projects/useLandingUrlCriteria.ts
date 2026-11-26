"use client";

import { useMemo, useSyncExternalStore } from "react";
import { LANDING_KNOWN_CITIES } from "@/lib/property-search-url/landingKnownCities";
import { landingSelectionToCriteria } from "@/lib/property-search-url/landingSelectionToCriteria";
import {
  LANDING_TRANSACTION_PARAM,
  LANDING_URL_CHANGE_EVENT,
} from "@/lib/property-search-url/landingUrl.config";
import { parseLandingUrl } from "@/lib/property-search-url/parseLandingUrl";

function subscribe(onChange: () => void) {
  window.addEventListener(LANDING_URL_CHANGE_EVENT, onChange);
  window.addEventListener("popstate", onChange);
  return () => {
    window.removeEventListener(LANDING_URL_CHANGE_EVENT, onChange);
    window.removeEventListener("popstate", onChange);
  };
}

const getUrl = () => `${window.location.pathname}${window.location.search}`;

// The hero rewrites the landing url on every tab, city or buy/rent change, so the browser url is the source
export function useLandingUrlCriteria() {
  const url = useSyncExternalStore(subscribe, getUrl, () => "");

  return useMemo(() => {
    const [path, query = ""] = url.split("?");
    const [locationSlug, categorySlug] = path.split("/").filter(Boolean);
    if (!locationSlug || !categorySlug) return null;

    const selection = parseLandingUrl({
      locationSlug,
      categorySlug,
      transactionCode:
        new URLSearchParams(query).get(LANDING_TRANSACTION_PARAM) ?? undefined,
      knownCities: LANDING_KNOWN_CITIES,
    });
    return selection ? landingSelectionToCriteria(selection) : null;
  }, [url]);
}
