import type {
  LANDING_CATEGORY_SLUGS,
  LandingCategory,
} from "./landingUrl.config";
import type { PropertySearchMoreFilters } from "./moreFilters.types";

export type TransactionSlug =
  | "property-for-sale"
  | "property-for-rent"
  | "property-for-lease";

export type CategorySlug = (typeof LANDING_CATEGORY_SLUGS)[LandingCategory];

export type PropertySearchCriteria = {
  transaction: TransactionSlug;
  category: CategorySlug;
  cityName?: string;
  localities: string[];
  projects: string[];
  bedrooms: number[];
  propertyTypes: string[];
  constructionStatuses: string[];
  saleTypes: string[];
  occupancies: string[];
  genders: string[];
  postedBy: string[];
  budgetMin?: number;
  budgetMax?: number;
  areaMin?: number;
  areaMax?: number;
  more: PropertySearchMoreFilters;
  page: number;
};

export type SearchParamRecord = Record<string, string | string[] | undefined>;
