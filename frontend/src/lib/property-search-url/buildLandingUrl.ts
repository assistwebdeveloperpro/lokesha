import {
  LANDING_ALL_INDIA_SEGMENT,
  LANDING_CATEGORY_SLUGS,
  LANDING_LOCATION_PREFIX,
  LANDING_TRANSACTION_CODES,
  LANDING_TRANSACTION_PARAM,
  type LandingCategory,
  type LandingTransaction,
} from "./landingUrl.config";
import { toUrlSegment } from "./slug";

type BuildLandingUrlInput = {
  category: LandingCategory;
  cityName: string | null;
  transaction: LandingTransaction | null;
};

// /property-for-sale-rent-in-Ahmedabad/residential-real-estate-Ahmedabad?category=S
export function buildLandingUrl({
  category,
  cityName,
  transaction,
}: BuildLandingUrlInput): string {
  const citySegment = cityName
    ? toUrlSegment(cityName)
    : LANDING_ALL_INDIA_SEGMENT;
  const path = `/${LANDING_LOCATION_PREFIX}${citySegment}/${LANDING_CATEGORY_SLUGS[category]}-${citySegment}`;
  if (!transaction) return path;
  return `${path}?${LANDING_TRANSACTION_PARAM}=${LANDING_TRANSACTION_CODES[transaction]}`;
}
