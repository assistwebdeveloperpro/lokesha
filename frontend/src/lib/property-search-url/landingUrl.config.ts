export const HOME_PATH = "/";

export const LANDING_ALL_INDIA_SEGMENT = "india";

export const LANDING_CATEGORY_SLUGS = {
  residential: "residential-real-estate",
  commercial: "commercial-real-estate",
  "pg-co-living": "pg-co-living",
  plot: "plot",
  land: "land",
} as const;

export type LandingCategory = keyof typeof LANDING_CATEGORY_SLUGS;

export type LandingTransaction = "buy" | "rent" | "lease";

// Fired after the hero rewrites the url with history.replaceState
export const LANDING_URL_CHANGE_EVENT = "lokesha-landing-url-change";

export type LandingGroup =
  | "buy"
  | "rent"
  | "commercial"
  | "pg-and-hostel"
  | "plots"
  | "lands";

export type LandingRoute = {
  group: LandingGroup;
  category: LandingCategory;
  // The first transaction is the one a url of this route resolves to
  transactions: readonly LandingTransaction[];
  template: string;
};

// Url: /{group}/{template}, e.g. /buy/residential-property-for-sale-in-ahmedabad
export const LANDING_ROUTES: readonly LandingRoute[] = [
  {
    group: "buy",
    category: "residential",
    transactions: ["buy"],
    template: "residential-property-for-sale-in-{city}",
  },
  {
    group: "rent",
    category: "residential",
    transactions: ["rent"],
    template: "residential-property-for-rent-in-{city}",
  },
  {
    group: "commercial",
    category: "commercial",
    transactions: ["buy", "lease"],
    template: "commercial-property-for-sale-lease-rent-in-{city}",
  },
  {
    group: "pg-and-hostel",
    category: "pg-co-living",
    transactions: ["rent"],
    template: "pg-hostels-for-rent-in-{city}",
  },
  {
    group: "plots",
    category: "plot",
    transactions: ["buy"],
    template: "plots-for-sale-in-{city}",
  },
  {
    group: "plots",
    category: "plot",
    transactions: ["rent"],
    template: "plots-for-rent-in-{city}",
  },
  {
    group: "lands",
    category: "land",
    transactions: ["buy"],
    template: "lands-for-sale-in-{city}",
  },
  {
    group: "lands",
    category: "land",
    transactions: ["rent"],
    template: "lands-for-rent-in-{city}",
  },
];

export const isLandingGroup = (value: string): value is LandingGroup =>
  LANDING_ROUTES.some((route) => route.group === value);
