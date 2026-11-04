import { formatBudgetOption } from "../search-filter-bar/budgetOptions";
import type { PublicSearchListing } from "./publicSearchListing.types";

export type SearchListingFact = {
  label: string;
  value: string | null;
};

export type VisibleSearchListingFact = { label: string; value: string };

const READY_TO_MOVE = "Ready to Move";

const AGE_LABELS: Record<string, string> = {
  "lt-1": "< 1 Year Old",
  "1-to-2": "1 - 2 Years Old",
  "2-to-3": "2 - 3 Years Old",
  "3-to-5": "3 - 5 Years Old",
  "gt-5": "> 5 Years Old",
};

const TRANSACTION_LABELS: Record<string, string> = {
  resale: "Resale property",
  new: "New property",
};

const FURNISHING_LABELS: Record<string, string> = {
  furnished: "Furnished",
  "semi-furnished": "Semi-furnished",
  unfurnished: "Unfurnished",
};

const ROAD_FACING_LABELS: Record<string, string> = {
  "main-road": "Main road",
  "side-road": "Side road",
  "no-road": "No road",
};

const PG_GENDER_LABELS: Record<string, string> = {
  male: "Men",
  female: "Women",
  both: "Men & Women",
};

const FOOD_LABELS: Record<string, string> = {
  inclusive: "Food included",
  extra: "Food at extra cost",
};

const isBuilderProject = (listing: PublicSearchListing) => listing.builderName !== null;

const formatAmount = (amount: number, listing: PublicSearchListing) =>
  `${formatBudgetOption(amount, listing.propertyType === "pg-co-living")}${listing.listingType === "rent-lease" ? "/month" : ""}`;

export function formatSearchListingPrice(listing: PublicSearchListing): string {
  const min = listing.priceMin ?? listing.price;
  const max = listing.priceMax ?? min;

  if (min === null) return "Price on request";
  if (max !== null && max !== min) return `${formatAmount(min, listing)} - ${formatAmount(max, listing)}`;
  return formatAmount(min, listing);
}

function formatFloor({ floorNumber, totalFloors }: PublicSearchListing): string | null {
  if (floorNumber === null) return null;
  const floor = floorNumber === 0 ? "Ground" : String(floorNumber);
  return totalFloors === null ? floor : `${floor} out of ${totalFloors}`;
}

function buildPossessionFact({ constructionStatus, possessionDate }: PublicSearchListing): SearchListingFact {
  if (!constructionStatus) return { label: "Status", value: null };
  if (constructionStatus === READY_TO_MOVE || !possessionDate) {
    return { label: "Status", value: constructionStatus };
  }
  return { label: constructionStatus, value: `Poss. By ${possessionDate}` };
}

const toText = (value: number | null) => (value === null ? null : String(value));

function buildBuilderFacts(listing: PublicSearchListing): SearchListingFact[] {
  return [
    buildPossessionFact(listing),
    { label: "Launch Date", value: listing.launchDate },
    { label: "Total Units", value: toText(listing.totalUnits) },
    { label: "Total Floor", value: toText(listing.totalFloors) },
  ];
}

const lookup = (labels: Record<string, string>, key: string | null) => (key ? (labels[key] ?? null) : null);

const yesNo = (value: boolean | null) => (value === null ? null : value ? "Yes" : "No");

const pricePerSqftFact = ({ pricePerSqft }: PublicSearchListing): SearchListingFact => ({
  label: "Price per sq ft",
  value: pricePerSqft === null ? null : `₹ ${pricePerSqft.toLocaleString("en-IN")} per sq ft`,
});

const ageFact = ({ ageOfConstruction, propertyTransaction }: PublicSearchListing): SearchListingFact => ({
  label: lookup(TRANSACTION_LABELS, propertyTransaction) ?? "Property age",
  value: lookup(AGE_LABELS, ageOfConstruction),
});

const transactionFact = ({ propertyTransaction }: PublicSearchListing): SearchListingFact => ({
  label: "Property type",
  value: lookup(TRANSACTION_LABELS, propertyTransaction),
});

const furnishingFact = ({ furnishingStatus }: PublicSearchListing): SearchListingFact => ({
  label: "Furnishing",
  value: lookup(FURNISHING_LABELS, furnishingStatus),
});

const roadFacingFact = ({ roadFacing }: PublicSearchListing): SearchListingFact => ({
  label: "Road facing",
  value: lookup(ROAD_FACING_LABELS, roadFacing),
});

const openSidesFact = ({ openSides }: PublicSearchListing): SearchListingFact => ({
  label: "Open sides",
  value: toText(openSides),
});

const residentialFacts = (listing: PublicSearchListing): SearchListingFact[] => [
  pricePerSqftFact(listing),
  ageFact(listing),
  furnishingFact(listing),
  { label: "Floor", value: formatFloor(listing) },
];

const commercialFacts = (listing: PublicSearchListing): SearchListingFact[] => [
  pricePerSqftFact(listing),
  ageFact(listing),
  furnishingFact(listing),
  { label: "Floor", value: formatFloor(listing) },
  { label: "Washrooms", value: toText(listing.washrooms) },
  { label: "Parking", value: toText(listing.carParkingCount) },
];

const pgFacts = (listing: PublicSearchListing): SearchListingFact[] => [
  { label: "Suitable for", value: lookup(PG_GENDER_LABELS, listing.pgGender) },
  { label: "Food", value: lookup(FOOD_LABELS, listing.foodChargeType) },
  furnishingFact(listing),
  { label: "Floor", value: formatFloor(listing) },
];

const plotFacts = (listing: PublicSearchListing): SearchListingFact[] => [
  pricePerSqftFact(listing),
  transactionFact(listing),
  roadFacingFact(listing),
  openSidesFact(listing),
  { label: "Corner plot", value: yesNo(listing.cornerPlot) },
  { label: "Boundary wall", value: yesNo(listing.boundaryWallMade) },
];

const landFacts = (listing: PublicSearchListing): SearchListingFact[] => [
  transactionFact(listing),
  roadFacingFact(listing),
  { label: "Boundary wall", value: yesNo(listing.boundaryWallMade) },
  {
    label: "Construction",
    value: listing.anyConstruction === null ? null : listing.anyConstruction ? "Done" : "Not done yet",
  },
];

const FACTS_BY_PROPERTY_TYPE: Record<string, (listing: PublicSearchListing) => SearchListingFact[]> = {
  residential: residentialFacts,
  commercial: commercialFacts,
  "pg-co-living": pgFacts,
  plot: plotFacts,
  land: landFacts,
};

function buildPropertyFacts(listing: PublicSearchListing): SearchListingFact[] {
  return (FACTS_BY_PROPERTY_TYPE[listing.propertyType] ?? residentialFacts)(listing);
}

// Label and value chips shown after the price; facts without a value are left out
export function buildSearchListingFacts(listing: PublicSearchListing): VisibleSearchListingFact[] {
  const facts = isBuilderProject(listing) ? buildBuilderFacts(listing) : buildPropertyFacts(listing);
  return facts.filter((fact): fact is VisibleSearchListingFact => fact.value !== null);
}
