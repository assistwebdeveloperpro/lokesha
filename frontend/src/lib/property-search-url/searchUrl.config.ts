import {
  LANDING_CATEGORY_SLUGS,
  type LandingCategory,
} from "./landingUrl.config";
import type { CategorySlug, TransactionSlug } from "./searchUrl.types";

export const TRANSACTION_SLUGS: readonly TransactionSlug[] = [
  "property-for-sale",
  "property-for-rent",
  "property-for-lease",
];

export const CATEGORY_SLUGS = Object.values(LANDING_CATEGORY_SLUGS);

export const CATEGORY_ID_BY_SLUG = Object.fromEntries(
  Object.entries(LANDING_CATEGORY_SLUGS).map(([id, slug]) => [slug, id]),
) as Record<CategorySlug, LandingCategory>;

// Which transaction routes each category is searchable under.
export const CATEGORY_TRANSACTIONS: Record<CategorySlug, readonly TransactionSlug[]> = {
  "residential-real-estate": ["property-for-sale", "property-for-rent"],
  "commercial-real-estate": ["property-for-sale", "property-for-lease"],
  "pg-co-living": ["property-for-rent"],
  plot: ["property-for-sale", "property-for-rent"],
  land: ["property-for-sale", "property-for-rent"],
};

export const isSearchableCombination = (
  transaction: TransactionSlug,
  category: CategorySlug,
) => CATEGORY_TRANSACTIONS[category].includes(transaction);

// These categories keep an empty `bedroom=` in the url.
export const CATEGORIES_WITH_BEDROOM_PARAM: readonly CategorySlug[] = [
  "residential-real-estate",
];

// Names and order follow .claude/specs/url-path-design.md exactly; extras go last.
export const SEARCH_PARAM_KEYS = [
  "bedroom",
  "proptype",
  "Locality",
  "cityName",
  "projectSocity",
  "BudgetMin",
  "BudgetMax",
  "constructionStatus",
  "occupancy",
  "areaMin",
  "areaMax",
  "page",
] as const;

export type SearchParamKey = (typeof SEARCH_PARAM_KEYS)[number];

// Lowercase alias -> key; matching is case-insensitive.
export const SEARCH_PARAM_ALIASES: Record<string, SearchParamKey> = {
  propertytype: "proptype",
  project: "projectSocity",
};

export const SEARCH_ERROR_MESSAGE = "Please enter a valid location or project";
