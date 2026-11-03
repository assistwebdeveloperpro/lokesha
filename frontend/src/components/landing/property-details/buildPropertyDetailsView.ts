import { formatSearchListingArea } from "@/components/landing/property-search/property-list/formatSearchListingArea";
import type { PublicSearchListing } from "@/components/landing/property-search/property-list/publicSearchListing.types";
import { SUB_TYPES_BY_PROPERTY_TYPE, type PropertyTypeId } from "@/components/shared/post-property/config/postPropertyForm.shared";
import { formatPriceAmount } from "@/components/user/dashboard/manage-properties/managePropertiesShared";
import { buildSearchUrl } from "@/lib/property-search-url/buildSearchUrl";
import { LANDING_CATEGORY_SLUGS, type LandingCategory } from "@/lib/property-search-url/landingUrl.config";
import { EMPTY_MORE_FILTERS } from "@/lib/property-search-url/moreFilters.types";
import { CATEGORY_TRANSACTIONS } from "@/lib/property-search-url/searchUrl.config";
import type { PropertySearchCriteria } from "@/lib/property-search-url/searchUrl.types";
import { toUrlSegment } from "@/lib/property-search-url/slug";
import type { PublicPropertyDetails, PublicPropertyVariant } from "@/services/propertySearch.service";
import { formatPropertyConfigurationLabel } from "./propertyDetailsConfigurationLabel";
import type {
  PropertyDetailsBase,
  PropertyDetailsFloorPlan,
  PropertyDetailsProjectView,
  PropertyDetailsSpecRow,
  PropertyDetailsUnitView,
  PropertyDetailsView,
} from "./propertyDetails.types";

const EMPTY_VALUE = "—";
const PRICE_ON_REQUEST = "Price on request";

const AGE_LABELS: Record<string, string> = {
  "lt-1": "Less than 1 year",
  "1-to-2": "1 to 2 years",
  "2-to-3": "2 to 3 years",
  "3-to-5": "3 to 5 years",
  "gt-5": "More than 5 years",
};

type Rows = [label: string, value: string | null][];

const toNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

// "sq-ft" -> "Sq ft", "semi-furnished" -> "Semi furnished"
function humanize(value: string | null | undefined): string | null {
  const text = value?.replace(/[-_]+/g, " ").trim();
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : null;
}

const formatDate = (value: string | null | undefined) =>
  value
    ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

const formatAmount = (value: unknown) => {
  const amount = toNumber(value);
  return amount === null ? null : formatPriceAmount(amount);
};

const toRows = (rows: Rows): PropertyDetailsSpecRow[] =>
  rows.flatMap(([label, value]) => (value ? [{ label, value }] : []));

const bedroomSummary = (bedrooms: number[]) => (bedrooms.length ? bedrooms.join(", ") : EMPTY_VALUE);

const subTypeLabel = (propertyType: string, slug: string) =>
  SUB_TYPES_BY_PROPERTY_TYPE[propertyType as PropertyTypeId]?.find((item) => item.id === slug)?.label ??
  humanize(slug) ??
  slug;

const transactionLabel = (listing: PublicSearchListing) => (listing.listingType === "sale" ? "Sale" : "Rent");

function buildSearchCriteria(listing: PublicSearchListing, localities: string[]): PropertySearchCriteria {
  const category = LANDING_CATEGORY_SLUGS[listing.propertyType as LandingCategory];
  const isSale = listing.listingType === "sale";
  const rentTransaction = CATEGORY_TRANSACTIONS[category].includes("property-for-rent")
    ? "property-for-rent"
    : "property-for-lease";
  const subType = SUB_TYPES_BY_PROPERTY_TYPE[listing.propertyType as PropertyTypeId]?.find(
    (item) => item.id === listing.propertySubType,
  );

  return {
    transaction: isSale ? "property-for-sale" : rentTransaction,
    category,
    cityName: listing.city,
    localities,
    projects: [],
    bedrooms: [],
    propertyTypes: subType ? [toUrlSegment(subType.label)] : [],
    constructionStatuses: [],
    saleTypes: [],
    occupancies: [],
    genders: [],
    postedBy: [],
    more: EMPTY_MORE_FILTERS,
    page: 1,
  };
}

function buildBreadcrumbs(listing: PublicSearchListing, currentLabel: string) {
  const isProject = listing.postedBy === "builder";
  const noun = isProject
    ? "Projects"
    : `${subTypeLabel(listing.propertyType, listing.propertySubType)} for ${transactionLabel(listing)}`;

  return [
    { label: "Home", href: "/" },
    { label: `${noun} in ${listing.city}`, href: buildSearchUrl(buildSearchCriteria(listing, [])) },
    {
      label: `${noun} in ${listing.locality}, ${listing.city}`,
      href: buildSearchUrl(buildSearchCriteria(listing, [listing.locality])),
    },
    { label: currentLabel },
  ];
}

function buildBase(dto: PublicPropertyDetails, currentLabel: string, pageTitle: string): PropertyDetailsBase {
  const { listing } = dto;

  return {
    id: dto.id,
    displayPropertyId: dto.displayPropertyId,
    listing,
    images: dto.images,
    breadcrumbs: buildBreadcrumbs(listing, currentLabel),
    pageTitle,
    headlineTitle: listing.title,
    headlineSubtitle: listing.subtitle,
    address: dto.address,
    description: dto.description,
    amenities: dto.amenities,
    similarListings: dto.similar,
    poster: dto.poster,
  };
}

const variantArea = (variant: PublicPropertyVariant) =>
  toNumber(variant.superBuiltUpArea) ?? toNumber(variant.carpetArea) ?? toNumber(variant.size);

function matchVariant(variants: PublicPropertyVariant[], label: string | null) {
  if (!label) return undefined;
  const needle = label.toLowerCase();
  return variants.find(
    (variant) =>
      variant.label?.toLowerCase() === needle ||
      (variant.bhk !== undefined && variant.bhk !== null && needle.startsWith(`${variant.bhk} bhk`)),
  );
}

function buildFloorPlans(dto: PublicPropertyDetails): PropertyDetailsFloorPlan[] {
  const variants = dto.variants ?? [];

  return dto.floorPlans.map((plan) => {
    const variant = matchVariant(variants, plan.label);
    const area = variant ? variantArea(variant) : null;
    const price = variant ? formatAmount(variant.price) : null;

    return {
      id: plan.id,
      label: plan.label ?? EMPTY_VALUE,
      planType: plan.planType,
      areaLabel: area === null ? EMPTY_VALUE : `${area.toLocaleString("en-IN")} sqft`,
      areaType: toNumber(variant?.superBuiltUpArea) !== null ? "Super Built-up Area" : "Carpet Area",
      priceLabel: price ?? PRICE_ON_REQUEST,
      imageUrl: plan.path,
    };
  });
}

function buildProjectView(dto: PublicPropertyDetails): PropertyDetailsProjectView {
  const { listing } = dto;
  const project = dto.project;
  const area = formatSearchListingArea(listing);
  const subType = subTypeLabel(listing.propertyType, listing.propertySubType);
  const bhkConfigurations = dto.variants?.length
    ? [...new Set(dto.variants.map((variant) => variant.label ?? `${variant.bhk} BHK ${subType}`))]
    : listing.bedrooms.map((bhk) => `${bhk} BHK ${subType}`);
  const isReady = dto.constructionStatus === "ready-to-move";
  const possessionLabel = isReady ? "Immediate" : (formatDate(dto.possessionDate) ?? EMPTY_VALUE);
  const launchDate = formatDate(project?.launchDate) ?? EMPTY_VALUE;
  const reraNumber = typeof dto.pricing.reraNumber === "string" ? dto.pricing.reraNumber : null;
  const developerName = project?.developerName ?? listing.builderName ?? dto.poster.name;
  const stats = project?.developerStats;

  return {
    ...buildBase(
      dto,
      `${listing.title} in ${listing.locality} ${listing.city}`,
      `${listing.title} - ${listing.bedrooms.length ? `${bedroomSummary(listing.bedrooms)} BHK ` : ""}${subType} Project at ${listing.locality}, ${listing.city}`,
    ),
    kind: "project",
    headlineTitle: `${listing.title} in ${listing.locality}, ${listing.city}`,
    launchDate,
    possessionLabel,
    reraNumber,
    overviewRows: [
      { label: "Area", value: area },
      {
        label: "Configuration",
        value: formatPropertyConfigurationLabel(bhkConfigurations) || EMPTY_VALUE,
      },
      { label: "Date of Launch", value: launchDate },
      { label: "Date of Possession", value: possessionLabel },
      { label: "Total Units", value: project?.totalUnits ? String(project.totalUnits) : EMPTY_VALUE },
      { label: "Total Blocks", value: project?.totalBlocks ? String(project.totalBlocks) : EMPTY_VALUE },
      { label: "ReraId", value: reraNumber ?? "Not Available" },
      { label: "Available Sizes", value: area },
    ],
    floorPlans: buildFloorPlans(dto),
    bhkConfigurations,
    developer: {
      name: developerName,
      totalProjects: stats?.totalProjects ?? 0,
      ongoingProjects: stats?.ongoingProjects ?? 0,
      completedProjects: stats?.completedProjects ?? 0,
      description: `${developerName} lists residential and commercial projects in ${listing.city} on Lokesha.`,
    },
  };
}

function areaWithRate(area: unknown, unit: unknown, price: number | null): string | null {
  const value = toNumber(area);
  if (value === null) return null;

  const unitLabel = (typeof unit === "string" ? unit : "sq-ft").replace(/-/g, " ");
  const rate = price !== null && value > 0 ? ` | ${formatPriceAmount(Math.round(price / value))}/${unitLabel}` : "";
  return `${value.toLocaleString("en-IN")} ${unitLabel}${rate}`;
}

const yesNo = (value: unknown) => (value === true ? "Yes" : value === false ? "No" : null);

function buildUnitRows(dto: PublicPropertyDetails): Pick<PropertyDetailsUnitView, "propertyDetailRows" | "pricingRows"> {
  const { attributes: a, pricing: p, listing } = dto;
  const isSale = listing.listingType === "sale";
  const price = listing.price;
  const floor = toNumber(a.floorNumber);
  const totalFloors = toNumber(a.totalFloors);
  const transaction = typeof a.propertyTransaction === "string" ? a.propertyTransaction : null;

  const propertyDetailRows = toRows([
    ["Property Transaction", transaction ? `${humanize(transaction)} Property` : null],
    ["Furnishing Status", humanize(a.furnishingStatus as string | null)],
    ["Bedrooms", toNumber(a.bedrooms)?.toString() ?? null],
    ["Bathrooms", toNumber(a.bathrooms)?.toString() ?? null],
    ["Super Built-up Area", areaWithRate(a.superBuiltUpArea, a.superBuiltUpAreaUnit, price)],
    ["Carpet Area", areaWithRate(a.carpetArea, a.carpetAreaUnit, price)],
    ["Plot Area", areaWithRate(a.plotArea, a.plotAreaUnit, price)],
    ["Property Age", AGE_LABELS[a.ageOfConstruction as string] ?? null],
    ["Floor Number", floor === null ? null : totalFloors === null ? String(floor) : `${floor} out of ${totalFloors}`],
    ["Balconies", toNumber(a.balconies)?.toString() ?? null],
    ["Facing", humanize(dto.facing)],
    ["Available From", formatDate(dto.availableFrom)],
  ]);

  const parking = toNumber(a.carParkingCount);
  const pricingRows = toRows(
    isSale
      ? [
          ["Expected Price", formatAmount(p.expectedPrice)],
          ["Booking Amount", formatAmount(p.bookingAmount)],
          ["Maintenance Charges", formatAmount(p.maintenanceCharges)],
          ["Price Negotiable", yesNo(p.priceNegotiable)],
          ["Car Parking", parking === null ? null : String(parking)],
        ]
      : [
          ["Monthly Rent", formatAmount(p.monthlyRent)],
          ["Security Deposit", formatAmount(p.depositAmount)],
          ["Maintenance Charges", formatAmount(p.maintenanceCharges)],
          ["Price Negotiable", yesNo(p.priceNegotiable)],
          ["Car Parking", parking === null ? null : String(parking)],
        ],
  );

  return { propertyDetailRows, pricingRows };
}

function buildUnitView(dto: PublicPropertyDetails): PropertyDetailsUnitView {
  const { listing } = dto;
  const subType = subTypeLabel(listing.propertyType, listing.propertySubType);
  const bhk = listing.bedrooms.length ? `${bedroomSummary(listing.bedrooms)} BHK ` : "";
  const priceLabel = listing.price !== null ? formatPriceAmount(listing.price) : PRICE_ON_REQUEST;

  return {
    ...buildBase(
      dto,
      `${bhk}${subType} for ${transactionLabel(listing)} in ${listing.title}, ${listing.locality}, ${listing.city}`,
      `${bhk}${subType} for ${transactionLabel(listing)} in ${listing.title}, ${listing.locality}, ${listing.city}`,
    ),
    kind: "unit",
    headlineTitle: `${priceLabel} | ${listing.title}`,
    furnishingItems: dto.furnishingItems,
    ...buildUnitRows(dto),
  };
}

export function buildPropertyDetailsView(dto: PublicPropertyDetails): PropertyDetailsView {
  return dto.kind === "project" ? buildProjectView(dto) : buildUnitView(dto);
}
