import {
  LANDING_CATEGORY_SLUGS,
  type LandingCategory,
} from "./landingUrl.config";
import type { CategorySlug, TransactionSlug } from "./searchUrl.types";

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

export const SEARCH_PATH_PREFIX = "/properties";

export type SearchSlugRoute = {
  transaction: TransactionSlug;
  category: CategorySlug;
  template: string;
};

// Url: /properties/{template}, e.g. /properties/buy-flats-penthouse-in-ahmedabad
// {types} lists the selected residential property types
export const SEARCH_SLUG_ROUTES: readonly SearchSlugRoute[] = [
  {
    transaction: "property-for-sale",
    category: "residential-real-estate",
    template: "buy-{types}-in-{city}",
  },
  {
    transaction: "property-for-rent",
    category: "residential-real-estate",
    template: "rent-{types}-in-{city}",
  },
  {
    transaction: "property-for-sale",
    category: "commercial-real-estate",
    template: "commercial-properties-for-sale-in-{city}",
  },
  {
    transaction: "property-for-lease",
    category: "commercial-real-estate",
    template: "commercial-properties-for-lease-in-{city}",
  },
  {
    transaction: "property-for-sale",
    category: "plot",
    template: "plots-for-sale-in-{city}",
  },
  {
    transaction: "property-for-rent",
    category: "plot",
    template: "plots-for-rent-in-{city}",
  },
  {
    transaction: "property-for-sale",
    category: "land",
    template: "lands-for-sale-in-{city}",
  },
  {
    transaction: "property-for-rent",
    category: "land",
    template: "lands-for-rent-in-{city}",
  },
  {
    transaction: "property-for-rent",
    category: "pg-co-living",
    template: "pg-in-{city}",
  },
];

// These categories keep an empty `bedroom=` in the url.
export const CATEGORIES_WITH_BEDROOM_PARAM: readonly CategorySlug[] = [
  "residential-real-estate",
];

// The city lives in the path, not in the query; extras go last.
export const SEARCH_PARAM_KEYS = [
  "bedroom",
  "proptype",
  "locality",
  "project-socity",
  "builder",
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
