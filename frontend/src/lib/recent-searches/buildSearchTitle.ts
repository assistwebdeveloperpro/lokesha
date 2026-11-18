import {
  PROPERTY_TYPES,
  formatAreaNumber,
} from "@/components/landing/home/hero-banner/heroBanner.shared";
import { displayName } from "@/components/landing/property-search/searchPageText";
import { toUrlSegment } from "@/lib/property-search-url/slug";
import type {
  CategorySlug,
  PropertySearchCriteria,
  TransactionSlug,
} from "@/lib/property-search-url/searchUrl.types";

type TitleCriteria = Partial<Omit<PropertySearchCriteria, "page">> &
  Pick<PropertySearchCriteria, "transaction" | "category">;

const MAX_TEXT_LENGTH = 255;

const TRANSACTION_PREFIX: Record<TransactionSlug, string> = {
  "property-for-sale": "Buy",
  "property-for-rent": "Rent",
  "property-for-lease": "Lease",
};

const CATEGORY_NOUN: Partial<Record<CategorySlug, string>> = {
  "residential-real-estate": "Residential property",
  "commercial-real-estate": "Commercial property",
  plot: "Plot property",
  land: "Land property",
};

const PROPERTY_TYPE_BY_SLUG = new Map(
  Object.values(PROPERTY_TYPES)
    .flat()
    .map((label) => [toUrlSegment(label).toLowerCase(), label]),
);

const clip = (text: string) => text.slice(0, MAX_TEXT_LENGTH);

const isSet = (value: number | undefined): value is number =>
  typeof value === "number" && Number.isFinite(value);

const trimDecimals = (value: number) => String(Number(value.toFixed(2)));

// 29000 -> "29K", 500000 -> "5 Lac", 43000000 -> "4.3 Cr"
export function formatPriceShort(amount: number): string {
  if (amount >= 10_000_000) return `${trimDecimals(amount / 10_000_000)} Cr`;
  if (amount >= 100_000) return `${trimDecimals(amount / 100_000)} Lac`;
  if (amount >= 1_000) return `${trimDecimals(amount / 1_000)}K`;
  return String(amount);
}

function buildPriceText({ budgetMin, budgetMax }: TitleCriteria): string {
  if (isSet(budgetMin) && isSet(budgetMax)) {
    return `${formatPriceShort(budgetMin)} - ${formatPriceShort(budgetMax)}`;
  }
  if (isSet(budgetMin)) return `Min ${formatPriceShort(budgetMin)}`;
  if (isSet(budgetMax)) return `Up to ${formatPriceShort(budgetMax)}`;
  return "";
}

function buildAreaText({ areaMin, areaMax }: TitleCriteria): string {
  if (isSet(areaMin) && isSet(areaMax)) {
    return `${formatAreaNumber(areaMin)} - ${formatAreaNumber(areaMax)} sq ft`;
  }
  if (isSet(areaMin)) return `Min ${formatAreaNumber(areaMin)} sq ft`;
  if (isSet(areaMax)) return `Up to ${formatAreaNumber(areaMax)} sq ft`;
  return "";
}

function buildBedroomText(bedrooms: number[] = []): string {
  if (bedrooms.length === 0) return "";
  return `${[...bedrooms].sort((a, b) => a - b).join(", ")} BHK`;
}

function buildPropertyTypeText(criteria: TitleCriteria): string {
  const types = (criteria.propertyTypes ?? []).map(
    (type) =>
      PROPERTY_TYPE_BY_SLUG.get(toUrlSegment(type).toLowerCase()) ??
      displayName(type.replace(/-/g, " ")),
  );
  if (types.length > 0) return types.join(", ");
  return CATEGORY_NOUN[criteria.category] ?? "Property";
}

// "Bopal, Ahmedabad": projects and localities first, then the city
function buildLocationText(criteria: TitleCriteria): string {
  const places = [
    ...(criteria.projects ?? []),
    ...(criteria.localities ?? []),
  ].map(displayName);
  return [...places, ...(criteria.cityName ? [displayName(criteria.cityName)] : [])].join(", ");
}

export function buildRecentSearchTitle(criteria: TitleCriteria): string {
  const location = buildLocationText(criteria);
  const parts =
    criteria.category === "pg-co-living"
      ? ["PG", buildPriceText(criteria), buildAreaText(criteria)]
      : [
          TRANSACTION_PREFIX[criteria.transaction],
          buildBedroomText(criteria.bedrooms),
          buildPropertyTypeText(criteria),
          buildPriceText(criteria),
          buildAreaText(criteria),
        ];

  if (location) parts.push(`in ${location}`);

  return clip(parts.filter(Boolean).join(" "));
}

export function buildRecentSearchSubtitle(criteria: TitleCriteria): string | null {
  const location = buildLocationText(criteria);
  return location ? clip(location) : null;
}
