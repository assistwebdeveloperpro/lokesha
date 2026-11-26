import {
  findKnownCity,
  isAllIndiaSegment,
  matchCityTemplate,
} from "./cityTemplate";
import {
  LANDING_ROUTES,
  type LandingCategory,
  type LandingTransaction,
} from "./landingUrl.config";

type ParseLandingUrlInput = {
  group: string;
  slug: string;
  knownCities: readonly string[];
};

export type LandingSelection = {
  category: LandingCategory;
  cityName: string | null;
  transaction: LandingTransaction;
};

export function parseLandingUrl({
  group,
  slug,
  knownCities,
}: ParseLandingUrlInput): LandingSelection | null {
  for (const route of LANDING_ROUTES) {
    if (route.group !== group.toLowerCase()) continue;

    const citySegment = matchCityTemplate(route.template, slug);
    if (!citySegment) continue;

    const selection = {
      category: route.category,
      transaction: route.transactions[0],
    };
    if (isAllIndiaSegment(citySegment)) return { ...selection, cityName: null };

    const cityName = findKnownCity(citySegment, knownCities);
    return cityName ? { ...selection, cityName } : null;
  }

  return null;
}
