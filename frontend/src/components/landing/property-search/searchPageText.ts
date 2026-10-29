import type {
  CategorySlug,
  PropertySearchCriteria,
  TransactionSlug,
} from "@/lib/property-search-url/searchUrl.types";

const TRANSACTION_LABELS: Record<TransactionSlug, string> = {
  "property-for-sale": "Sale",
  "property-for-rent": "Rent",
  "property-for-lease": "Lease",
};

const CATEGORY_NOUNS: Record<CategorySlug, string> = {
  "residential-real-estate": "Properties",
  "commercial-real-estate": "Commercial Properties",
  "pg-co-living": "PG/Co-living",
  plot: "Plots",
  land: "Land",
};

// "shyam swastik" -> "Shyam Swastik"
export const displayName = (value: string) =>
  value.replace(/(^|\s)\p{L}/gu, (match) => match.toUpperCase());

export function buildSearchLocation(criteria: PropertySearchCriteria): string {
  const parts = [
    ...criteria.projects.map(displayName),
    ...criteria.localities.map(displayName),
    criteria.cityName,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "India";
}

// "3 BHK Properties for Sale in Bopal, Ahmedabad"
export function buildSearchHeading(criteria: PropertySearchCriteria): string {
  const bhk = criteria.bedrooms.length === 1 ? `${criteria.bedrooms[0]} BHK ` : "";
  const noun = CATEGORY_NOUNS[criteria.category];
  const location = buildSearchLocation(criteria);

  if (criteria.category === "pg-co-living") return `${noun} in ${location}`;
  return `${bhk}${noun} for ${TRANSACTION_LABELS[criteria.transaction]} in ${location}`;
}
