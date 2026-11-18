const MAX_TEXT_LENGTH = 255;
const PG_CATEGORY = "pg-co-living";

const TRANSACTION_PREFIX = {
  "property-for-sale": "Buy",
  "property-for-rent": "Rent",
  "property-for-lease": "Lease",
};

const CATEGORY_NOUN = {
  "residential-real-estate": "Residential property",
  "commercial-real-estate": "Commercial property",
  plot: "Plot property",
  land: "Land property",
};

const PROPERTY_TYPE_LABELS = [
  "Flat/Apartment",
  "Bungalow/Villa",
  "Studio Apartment",
  "Weekend Homes",
  "Farm House",
  "Penthouse",
  "Duplex",
  "Shop",
  "Office",
  "Showroom",
  "Cold Storage",
  "Industrial Shed",
  "Guest House",
  "Hotel/Resort",
  "Warehouse/Godown",
  "Co-working Space/Business Centre",
  "Residential Plot",
  "Industrial Plot",
  "Commercial Plot",
  "Agriculture Land",
  "Non-Agriculture Land",
  "Commercial Land",
  "Residential Land",
  "Industrial Land",
];

// Same slug rule as the frontend url segments, lowercased for matching
const toSlugKey = (label) =>
  label
    .trim()
    .toLowerCase()
    .replace(/\+/g, "-plus")
    .replace(/[\s/]+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");

const PROPERTY_TYPE_BY_SLUG = new Map(PROPERTY_TYPE_LABELS.map((label) => [toSlugKey(label), label]));

// "bopal" -> "Bopal", "GIFT City" stays as is
const displayName = (value) => value.trim().replace(/(^|\s)\p{L}/gu, (match) => match.toUpperCase());

const clip = (text) => text.slice(0, MAX_TEXT_LENGTH);

function trimDecimals(value) {
  return String(Number(value.toFixed(2)));
}

// 29000 -> "29K", 500000 -> "5 Lac", 43000000 -> "4.3 Cr"
function formatPriceShort(amount) {
  if (amount >= 10000000) return `${trimDecimals(amount / 10000000)} Cr`;
  if (amount >= 100000) return `${trimDecimals(amount / 100000)} Lac`;
  if (amount >= 1000) return `${trimDecimals(amount / 1000)}K`;
  return String(amount);
}

const isSet = (value) => typeof value === "number" && Number.isFinite(value);

function buildPriceText({ budgetMin, budgetMax }) {
  if (isSet(budgetMin) && isSet(budgetMax)) {
    return `${formatPriceShort(budgetMin)} - ${formatPriceShort(budgetMax)}`;
  }
  if (isSet(budgetMin)) return `Min ${formatPriceShort(budgetMin)}`;
  if (isSet(budgetMax)) return `Up to ${formatPriceShort(budgetMax)}`;
  return "";
}

function buildAreaText({ areaMin, areaMax }) {
  const format = (value) => value.toLocaleString("en-IN");
  if (isSet(areaMin) && isSet(areaMax)) return `${format(areaMin)} - ${format(areaMax)} sq ft`;
  if (isSet(areaMin)) return `Min ${format(areaMin)} sq ft`;
  if (isSet(areaMax)) return `Up to ${format(areaMax)} sq ft`;
  return "";
}

function buildBedroomText(bedrooms = []) {
  if (!bedrooms.length) return "";
  return `${[...bedrooms].sort((a, b) => a - b).join(", ")} BHK`;
}

function buildPropertyTypeText(criteria) {
  const types = (criteria.propertyTypes ?? []).map(
    (type) => PROPERTY_TYPE_BY_SLUG.get(toSlugKey(type)) ?? displayName(type.replace(/-/g, " "))
  );
  if (types.length) return types.join(", ");
  return CATEGORY_NOUN[criteria.category] ?? "Property";
}

// "Bopal, Ahmedabad": builders and localities first, then the city
function buildLocationText(criteria) {
  return [...(criteria.builders ?? []), ...(criteria.localities ?? [])]
    .map(displayName)
    .concat(criteria.cityName ? [displayName(criteria.cityName)] : [])
    .join(", ");
}

function buildSearchTitle(criteria) {
  const location = buildLocationText(criteria);
  const isPg = criteria.category === PG_CATEGORY;

  const parts = isPg
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

function buildSearchSubtitle(criteria) {
  const location = buildLocationText(criteria);
  return location ? clip(location) : null;
}

module.exports = { buildSearchTitle, buildSearchSubtitle, formatPriceShort };
