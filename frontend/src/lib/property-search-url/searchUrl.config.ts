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

// Single-segment, keyword-style paths used instead of /{transaction}/{category}.
export const KEYWORD_SEARCH_PATHS = {
  "pg-for-rent": { transaction: "property-for-rent", category: "pg-co-living" },
  "plots-for-sale": { transaction: "property-for-sale", category: "plot" },
  "plots-for-rent": { transaction: "property-for-rent", category: "plot" },
  "land-for-sale": { transaction: "property-for-sale", category: "land" },
  "land-for-rent": { transaction: "property-for-rent", category: "land" },
} as const satisfies Record<
  string,
  { transaction: TransactionSlug; category: CategorySlug }
>;

export type KeywordSearchSlug = keyof typeof KEYWORD_SEARCH_PATHS;

// These categories keep an empty `bedroom=` in the url.
export const CATEGORIES_WITH_BEDROOM_PARAM: readonly CategorySlug[] = [
  "residential-real-estate",
];

// Names and order follow .claude/specs/url-path-design.md exactly; extras go last.
export const SEARCH_PARAM_KEYS = [
  "bedroom",
  "proptype",
  "locality",
  "city-name",
  "project-socity",
  "min-price",
  "max-price",
  "construction-status",
  "occupancy",
  "gender",
  "posted-by",
  "area-min",
  "area-max",
  "property-transaction",
  "page",
] as const;

export type SearchParamKey = (typeof SEARCH_PARAM_KEYS)[number];

// Lowercase alias -> key; matching is case-insensitive.
export const SEARCH_PARAM_ALIASES: Record<string, SearchParamKey> = {
  propertytype: "proptype",
  project: "project-socity",
};

export const SEARCH_ERROR_MESSAGE = "Please enter a valid location or project";
