import {
  LANDING_ALL_INDIA_SEGMENT,
  LANDING_CATEGORY_SLUGS,
  LANDING_LOCATION_PREFIX,
  LANDING_TRANSACTION_CODES,
  type LandingCategory,
  type LandingTransaction,
} from "./landingUrl.config";
import { toUrlSegment } from "./slug";

type ParseLandingUrlInput = {
  locationSlug: string;
  categorySlug: string;
  transactionCode?: string;
  knownCities: readonly string[];
};

export type LandingSelection = {
  category: LandingCategory;
  cityName: string | null;
  transaction: LandingTransaction;
};

// Unknown or missing code falls back to buy.
function parseTransaction(code: string | undefined): LandingTransaction {
  const match = (
    Object.keys(LANDING_TRANSACTION_CODES) as LandingTransaction[]
  ).find((id) => LANDING_TRANSACTION_CODES[id] === code?.toUpperCase());
  return match ?? "buy";
}

export function parseLandingUrl({
  locationSlug,
  categorySlug,
  transactionCode,
  knownCities,
}: ParseLandingUrlInput): LandingSelection | null {
  if (!locationSlug.toLowerCase().startsWith(LANDING_LOCATION_PREFIX)) {
    return null;
  }

  const citySegment = locationSlug.slice(LANDING_LOCATION_PREFIX.length);
  const categorySuffix = `-${citySegment}`.toLowerCase();
  if (!citySegment || !categorySlug.toLowerCase().endsWith(categorySuffix)) {
    return null;
  }

  const categoryPart = categorySlug
    .slice(0, categorySlug.length - categorySuffix.length)
    .toLowerCase();
  const category = (
    Object.keys(LANDING_CATEGORY_SLUGS) as LandingCategory[]
  ).find((id) => LANDING_CATEGORY_SLUGS[id] === categoryPart);
  if (!category) return null;

  const transaction = parseTransaction(transactionCode);
  if (citySegment.toLowerCase() === LANDING_ALL_INDIA_SEGMENT.toLowerCase()) {
    return { category, cityName: null, transaction };
  }

  const cityName = knownCities.find(
    (city) => toUrlSegment(city).toLowerCase() === citySegment.toLowerCase(),
  );
  return cityName ? { category, cityName, transaction } : null;
}
