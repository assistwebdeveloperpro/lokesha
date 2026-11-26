"use client";

import { useMemo, useSyncExternalStore } from "react";
import { ALL_INDIA_LABEL } from "@/components/shared/layout/city-selector/citySelector.shared";
import { useHeaderCity } from "@/components/shared/layout/city-selector/useHeaderCity";
import { LANDING_KNOWN_CITIES } from "@/lib/property-search-url/landingKnownCities";
import { landingSelectionToCriteria } from "@/lib/property-search-url/landingSelectionToCriteria";
import {
  HOME_PATH,
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

const getPath = () => window.location.pathname;

// The hero rewrites the landing url on every tab, city or buy/rent change, so the browser url is the source
export function useLandingUrlCriteria() {
  const path = useSyncExternalStore(subscribe, getPath, () => "");
  const headerCity = useHeaderCity();

  return useMemo(() => {
    // The homepage shows the residential buy listing of the header city
    if (path === HOME_PATH) {
      return landingSelectionToCriteria({
        category: "residential",
        cityName: headerCity === ALL_INDIA_LABEL ? null : headerCity,
        transaction: "buy",
      });
    }

    const [group, slug] = path.split("/").filter(Boolean);
    if (!group || !slug) return null;

    const selection = parseLandingUrl({
      group,
      slug,
      knownCities: LANDING_KNOWN_CITIES,
    });
    return selection ? landingSelectionToCriteria(selection) : null;
  }, [path, headerCity]);
}
