import { fillCityTemplate } from "./cityTemplate";
import {
  HOME_PATH,
  LANDING_ROUTES,
  type LandingCategory,
  type LandingTransaction,
} from "./landingUrl.config";

type BuildLandingUrlInput = {
  category: LandingCategory;
  cityName: string | null;
  transaction: LandingTransaction;
};

// Falls back to the first route of the category, e.g. pg-co-living is rent only
export function buildLandingUrl({
  category,
  cityName,
  transaction,
}: BuildLandingUrlInput): string {
  const routes = LANDING_ROUTES.filter((route) => route.category === category);
  const route =
    routes.find((candidate) => candidate.transactions.includes(transaction)) ??
    routes[0];

  return `/${route.group}/${fillCityTemplate(route.template, cityName)}`;
}

// Default destination for "Explore properties" calls to action
export const EXPLORE_PROPERTIES_HREF = HOME_PATH;
