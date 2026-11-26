import {
  LANDING_CATEGORY_SLUGS,
  type LandingTransaction,
} from "./landingUrl.config";
import type { LandingSelection } from "./parseLandingUrl";
import { normalizeSearchCriteria } from "./normalizeSearchCriteria";
import { CATEGORY_TRANSACTIONS } from "./searchUrl.config";
import type {
  PropertySearchCriteria,
  TransactionSlug,
} from "./searchUrl.types";

const TRANSACTION_SLUG_BY_LANDING: Record<LandingTransaction, TransactionSlug> = {
  buy: "property-for-sale",
  rent: "property-for-rent",
  lease: "property-for-lease",
};

// Falls back to the first route the category supports, e.g. pg-co-living is rent only
export function landingSelectionToCriteria({
  category,
  cityName,
  transaction,
}: LandingSelection): PropertySearchCriteria {
  const categorySlug = LANDING_CATEGORY_SLUGS[category];
  const allowed = CATEGORY_TRANSACTIONS[categorySlug];
  const requested = TRANSACTION_SLUG_BY_LANDING[transaction];

  return normalizeSearchCriteria({
    transaction: allowed.includes(requested) ? requested : allowed[0],
    category: categorySlug,
    cityName: cityName ?? undefined,
    page: 1,
  } as PropertySearchCriteria);
}
