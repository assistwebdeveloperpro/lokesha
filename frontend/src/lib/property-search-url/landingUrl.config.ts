export const LANDING_LOCATION_PREFIX = "property-for-sale-rent-in-";

export const LANDING_ALL_INDIA_SEGMENT = "India";

export const LANDING_CATEGORY_SLUGS = {
  residential: "residential-real-estate",
  commercial: "commercial-real-estate",
  "pg-co-living": "pg-co-living",
  plot: "plot",
  land: "land",
} as const;

export type LandingCategory = keyof typeof LANDING_CATEGORY_SLUGS;

export const LANDING_TRANSACTION_PARAM = "category";

export const LANDING_TRANSACTION_CODES = {
  buy: "S",
  rent: "R",
  lease: "L",
} as const;

export type LandingTransaction = keyof typeof LANDING_TRANSACTION_CODES;
