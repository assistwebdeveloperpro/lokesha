import { buildSearchUrl } from "@/lib/property-search-url/buildSearchUrl";
import type { PropertySearchCriteria } from "@/lib/property-search-url/searchUrl.types";
import {
  buildSearchHeading,
  buildSearchLocation,
  displayName,
} from "../searchPageText";
import type { PublicSearchListing } from "./publicSearchListing.types";

export type SearchListBreadcrumb = {
  label: string;
  href?: string;
};

const TRANSACTION_PHRASE: Record<PropertySearchCriteria["transaction"], string> = {
  "property-for-sale": "for Sale",
  "property-for-rent": "for Rent",
  "property-for-lease": "for Lease",
};

const PROPERTY_TYPE_LIST_LABEL: Record<string, string> = {
  "flat-apartment": "Flats",
  "bungalow-villa": "Villas",
  "studio-apartment": "Studio Apartments",
  "weekend-homes": "Weekend Homes",
  "farm-house": "Farm Houses",
  penthouse: "Penthouses",
  duplex: "Duplexes",
  shop: "Shops",
  office: "Offices",
  showroom: "Showrooms",
  "residential-plot": "Residential Plots",
  "commercial-plot": "Commercial Plots",
  "industrial-plot": "Industrial Plots",
};

const CATEGORY_FALLBACK_LABEL: Record<PropertySearchCriteria["category"], string> = {
  "residential-real-estate": "Properties",
  "commercial-real-estate": "Commercial Properties",
  "pg-co-living": "PG/Co-living",
  plot: "Plots",
  land: "Land",
};

function listingTypeLabel(criteria: PropertySearchCriteria): string {
  const types = criteria.propertyTypes;
  if (types.length === 1) {
    return PROPERTY_TYPE_LIST_LABEL[types[0]] ?? displayName(types[0].replace(/-/g, " "));
  }
  if (types.length > 1) {
    return types
      .map((type) => PROPERTY_TYPE_LIST_LABEL[type] ?? displayName(type.replace(/-/g, " ")))
      .join(", ");
  }
  return CATEGORY_FALLBACK_LABEL[criteria.category];
}

export function buildListingTypeHeading(criteria: PropertySearchCriteria): string {
  const noun = listingTypeLabel(criteria);
  return `${noun} ${TRANSACTION_PHRASE[criteria.transaction]}`;
}

function cloneCriteria(
  criteria: PropertySearchCriteria,
  patch: Partial<PropertySearchCriteria>,
): PropertySearchCriteria {
  return { ...criteria, ...patch };
}

export function buildSearchListBreadcrumbs(
  criteria: PropertySearchCriteria,
): SearchListBreadcrumb[] {
  const listingHeading = buildListingTypeHeading(criteria);
  const city = criteria.cityName;
  const primaryLocality = criteria.localities[0];

  const crumbs: SearchListBreadcrumb[] = [{ label: "Home", href: "/" }];

  if (city) {
    crumbs.push({
      label: `${listingHeading} in ${displayName(city)}`,
      href: buildSearchUrl(
        cloneCriteria(criteria, {
          localities: [],
          projects: [],
          page: 1,
        }),
      ),
    });
  }

  if (primaryLocality && city) {
    crumbs.push({
      label: `${listingHeading} in ${displayName(primaryLocality)} - ${displayName(city)}`,
    });
  } else if (!city) {
    crumbs.push({ label: listingHeading });
  }

  return crumbs;
}

export function buildResultsCountLine(total: number, criteria: PropertySearchCriteria): string {
  const listingHeading = buildListingTypeHeading(criteria);
  const location = buildSearchLocation(criteria);
  return `${total.toLocaleString("en-IN")} Results | ${listingHeading} in ${location}`;
}

export function buildShowingRange(page: number, pageSize: number, total: number): string {
  if (total === 0) return "Showing 0 of 0";
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return `Showing ${start.toLocaleString("en-IN")} - ${end.toLocaleString("en-IN")} of ${total.toLocaleString("en-IN")}`;
}

function formatSeoPrice(amount: number): string {
  if (amount >= 1_00_00_000) {
    const crore = amount / 1_00_00_000;
    if (crore >= 1 && amount % 1_00_00_000 !== 0) return "1+ Crore";
    return crore >= 10 ? "1+ Crore" : `${Math.round(crore)} Crore`;
  }
  if (amount >= 1_00_000) {
    return `${Math.round(amount / 1_00_000)} Lakh`;
  }
  return `₹${amount.toLocaleString("en-IN")}`;
}

function collectPriceBounds(listings: PublicSearchListing[]): { min: number | null; max: number | null } {
  const values = listings.flatMap((item) =>
    [item.priceMin, item.priceMax, item.price].filter(
      (value): value is number => value !== null && value !== undefined,
    ),
  );
  if (values.length === 0) return { min: null, max: null };
  return { min: Math.min(...values), max: Math.max(...values) };
}

function bedroomSummary(criteria: PropertySearchCriteria, listings: PublicSearchListing[]): string {
  const fromCriteria = [...new Set(criteria.bedrooms)].sort((a, b) => a - b);
  if (fromCriteria.length > 0) {
    return `${fromCriteria.join(",")} BHK`;
  }
  const fromListings = [
    ...new Set(listings.flatMap((item) => item.bedrooms)),
  ].sort((a, b) => a - b);
  if (fromListings.length === 0) return "";
  return `${fromListings.join(",")} BHK`;
}

function seoExplorePropertyPhrase(criteria: PropertySearchCriteria): string {
  if (criteria.propertyTypes.includes("flat-apartment")) {
    return "flat apartment";
  }
  if (criteria.propertyTypes.length === 1) {
    return (
      PROPERTY_TYPE_LIST_LABEL[criteria.propertyTypes[0]]?.toLowerCase() ??
      displayName(criteria.propertyTypes[0].replace(/-/g, " ")).toLowerCase()
    );
  }
  return listingTypeLabel(criteria).toLowerCase();
}

export function buildSearchListSeoDescription(
  criteria: PropertySearchCriteria,
  total: number,
  listings: PublicSearchListing[],
): string {
  const location = buildSearchLocation(criteria);
  const bhk = bedroomSummary(criteria, listings);
  const propertyPhrase = seoExplorePropertyPhrase(criteria);
  const { min, max } = collectPriceBounds(listings);

  const exploreTypes = bhk
    ? `Explore ${bhk} ${propertyPhrase}, villas from new residential projects and resale homes.`
    : `Explore ${propertyPhrase} from new residential projects and resale homes.`;

  const priceLine =
    min !== null && max !== null
      ? ` Explore various configurations with prices ranging from ${formatSeoPrice(min)} to ${formatSeoPrice(max)}.`
      : "";

  return `Looking for property in ${location}? Lokesha offers ${total.toLocaleString("en-IN")}+ verified properties. ${exploreTypes}${priceLine}`;
}

export function buildSearchListPageTitle(criteria: PropertySearchCriteria): string {
  return buildSearchHeading(criteria);
}
