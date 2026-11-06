import { buildSearchListingFacts } from "@/components/landing/property-search/property-list/buildSearchListingFacts";
import { formatSearchListingArea } from "@/components/landing/property-search/property-list/formatSearchListingArea";
import type { PublicSearchListing } from "@/components/landing/property-search/property-list/publicSearchListing.types";
import { getMergedBuilderConfig } from "@/components/shared/post-property/builder/builderConfig";
import {
  getBuilderDetailsConfig,
  getBuilderSaleFormConfig,
} from "@/components/shared/post-property/config/postPropertySaleConfig";
import {
  SUB_TYPES_BY_PROPERTY_TYPE,
  TENANT_PREFERENCE_OPTIONS,
  type PropertyTypeId,
} from "@/components/shared/post-property/config/postPropertyForm.shared";
import { formatPriceAmount } from "@/components/user/dashboard/manage-properties/managePropertiesShared";
import { buildSearchUrl } from "@/lib/property-search-url/buildSearchUrl";
import { LANDING_CATEGORY_SLUGS, type LandingCategory } from "@/lib/property-search-url/landingUrl.config";
import { EMPTY_MORE_FILTERS } from "@/lib/property-search-url/moreFilters.types";
import { CATEGORY_TRANSACTIONS } from "@/lib/property-search-url/searchUrl.config";
import type { PropertySearchCriteria } from "@/lib/property-search-url/searchUrl.types";
import { toUrlSegment } from "@/lib/property-search-url/slug";
import type {
  PublicPropertyAttributes,
  PublicPropertyDetails,
  PublicPropertyProject,
  PublicPropertyVariant,
} from "@/services/propertySearch.service";
import { formatPropertyConfigurationLabel } from "./propertyDetailsConfigurationLabel";
import { resolveCarParkingLabel } from "./propertyDetailsCarParking";
import { normalizePropertyGalleryCategories } from "./propertyDetailsGallery.utils";
import type {
  PropertyDetailsBase,
  PropertyDetailsFloorPlan,
  PropertyDetailsNearbyPlace,
  PropertyDetailsProjectView,
  PropertyDetailsSpecRow,
  PropertyDetailsUnitView,
  PropertyDetailsFaq,
  PropertyDetailsView,
} from "./propertyDetails.types";

const EMPTY_VALUE = "—";
const PRICE_ON_REQUEST = "Price on request";

const PROJECT_TYPE_LABELS: Record<string, string> = {
  "new-launch": "New Launch",
  "under-construction": "Under Construction",
  ready: "Ready to Move",
  completed: "Completed",
};

const AGE_LABELS: Record<string, string> = {
  "lt-1": "Less than 1 year",
  "1-to-2": "1 to 2 years",
  "2-to-3": "2 to 3 years",
  "3-to-5": "3 to 5 years",
  "gt-5": "More than 5 years",
};

const PG_GENDER_LABELS: Record<string, string> = {
  male: "Male",
  female: "Female",
  both: "Both",
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

const AVG_PRICE_UNITS: Record<string, string> = {
  "sq-yd": "SqYd",
  "sq-ft": "SqFt",
  "sq-m": "SqM",
  "sq-km": "SqKm",
};

// "sq-yd" / "sq yd" -> "SqYd"
function formatAvgPriceUnit(unit: unknown): string | null {
  if (typeof unit !== "string") return null;
  const slug = unit.trim().toLowerCase().replace(/[\s._]+/g, "-").replace(/-+/g, "-");
  return AVG_PRICE_UNITS[slug] ?? null;
}

export function formatProjectAvgPrice(amount: unknown, unit: unknown): string | null {
  const price = toNumber(amount);
  if (price === null || price <= 0) return null;

  const unitLabel = formatAvgPriceUnit(unit);
  return unitLabel ? `${formatPriceAmount(price)} / ${unitLabel}` : formatPriceAmount(price);
}

const toRows = (rows: Rows): PropertyDetailsSpecRow[] =>
  rows.flatMap(([label, value]) => (value ? [{ label, value }] : []));

const isPgListing = (listing: PublicSearchListing) => listing.propertyType === "pg-co-living";

const usesSearchListingDetailRows = (listing: PublicSearchListing) =>
  listing.propertyType === "plot" || listing.propertyType === "land";

const FLOORS_ALLOWED_LABEL = "Floor Allowed for Construction";

function floorsAllowedRow(attributes: PublicPropertyAttributes): PropertyDetailsSpecRow | null {
  const floors = toNumber(attributes.floorsAllowed);
  return floors === null ? null : { label: FLOORS_ALLOWED_LABEL, value: String(floors) };
}

function buildSearchListingDetailRows(
  listing: PublicSearchListing,
  attributes: PublicPropertyAttributes,
): PropertyDetailsSpecRow[] {
  const rows: PropertyDetailsSpecRow[] = [];

  if (listing.carpetAreaMin !== null) {
    rows.push({ label: "Area", value: formatSearchListingArea(listing) });
  }

  rows.push(...buildSearchListingFacts(listing).map(({ label, value }) => ({ label, value })));

  const floorsAllowed = floorsAllowedRow(attributes);
  if (floorsAllowed) rows.push(floorsAllowed);

  return rows;
}

const formatPgGender = (value: unknown): string | null => {
  if (typeof value !== "string" || !value.trim()) return null;
  return PG_GENDER_LABELS[value.toLowerCase()] ?? humanize(value);
};

const formatTenantPreferences = (keys: string[] | undefined): string | null => {
  if (!keys?.length) return null;

  const labels = keys.flatMap((key) => {
    const label = TENANT_PREFERENCE_OPTIONS.find((option) => option.id === key)?.label;
    return label ? [label] : humanize(key) ? [humanize(key)!] : [];
  });

  return labels.length ? labels.join(", ") : null;
};

const formatPgOperationSince = (value: unknown): string | null => {
  const year = toNumber(value);
  return year === null ? null : String(year);
};

const projectSubTypes = (listing: PublicSearchListing) =>
  listing.propertySubTypes?.length ? listing.propertySubTypes : [listing.propertySubType];

const showsProjectStatus = (listing: PublicSearchListing) => {
  const propertyType = listing.propertyType as PropertyTypeId;
  return getMergedBuilderConfig(propertyType, projectSubTypes(listing)).showProjectType;
};

const showsTotalFloors = (listing: PublicSearchListing) =>
  projectSubTypes(listing).some((subType) => {
    const propertyType = listing.propertyType as PropertyTypeId;
    const config =
      getBuilderDetailsConfig(propertyType, subType) ??
      getBuilderSaleFormConfig(propertyType, subType)?.details;
    return Boolean(config?.totalFloors);
  });

const showsTotalTower = (listing: PublicSearchListing) => {
  const propertyType = listing.propertyType as PropertyTypeId;
  return !getMergedBuilderConfig(propertyType, projectSubTypes(listing)).hideTotalBlocks;
};

const formatProjectType = (value: string | null | undefined) =>
  value ? (PROJECT_TYPE_LABELS[value] ?? humanize(value)) : null;

const formatProjectArea = (projectAreaSqYd: string | number | null | undefined) => {
  const area = toNumber(projectAreaSqYd);
  if (area === null || area <= 0) return EMPTY_VALUE;
  return `${area.toLocaleString("en-IN")} Sq Yd`;
};

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
    imageCategories: normalizePropertyGalleryCategories(dto.imageCategories),
    breadcrumbs: buildBreadcrumbs(listing, currentLabel),
    pageTitle,
    headlineTitle: listing.title,
    headlineSubtitle: listing.subtitle,
    aboutSectionTitle: `About The ${listing.title}`,
    address: dto.address,
    description: dto.description,
    amenities: dto.amenities,
    nearbyPlaces: buildNearbyPlaces(dto.project?.highlights),
    faqs: buildFaqs(dto.project),
    similarListings: dto.similar,
    similarScope: dto.similarScope,
    poster: dto.poster,
  };
}

const variantArea = (variant: PublicPropertyVariant) =>
  toNumber(variant.superBuiltUpArea) ?? toNumber(variant.carpetArea) ?? toNumber(variant.size);

function normalizeMatchKey(value: string | null | undefined): string {
  return (value ?? "")
    .toLowerCase()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeAreaUnitKey(unit: string | null | undefined): string {
  return normalizeMatchKey(unit).replace(/\./g, "");
}

function areaUnitsMatch(left: string | null | undefined, right: string | null | undefined): boolean {
  const a = normalizeAreaUnitKey(left);
  const b = normalizeAreaUnitKey(right);
  if (!a || !b) return true;
  if (a === b) return true;
  const isSqFt = (unit: string) => unit === "sq ft" || unit === "sqft";
  return isSqFt(a) && isSqFt(b);
}

function parseLabelSizeSuffix(label: string | null | undefined): { amount: number; unit: string } | null {
  if (!label) return null;
  const match = label.match(/\(([\d,.]+)\s*([^)]+)\)\s*$/);
  if (!match) return null;

  const amount = toNumber(match[1].replace(/,/g, ""));
  if (amount === null) return null;

  return { amount, unit: normalizeAreaUnitKey(match[2]) };
}

function variantListedSize(variant: PublicPropertyVariant): number | null {
  return toNumber(variant.size) ?? toNumber(variant.superBuiltUpArea) ?? toNumber(variant.carpetArea);
}

function variantAreaUnit(variant: PublicPropertyVariant): string | null {
  if (toNumber(variant.superBuiltUpArea) !== null) {
    return variant.superBuiltUpAreaUnit ?? variant.sizeUnit ?? "sq-ft";
  }
  if (toNumber(variant.carpetArea) !== null) {
    return variant.carpetAreaUnit ?? variant.sizeUnit ?? "sq-ft";
  }
  return variant.sizeUnit ?? "sq-ft";
}

function parseBhkFromLabel(label: string | null | undefined): number | null {
  const match = label?.match(/^(\d+)\s*bhk/i);
  if (!match) return null;
  const bhk = Number(match[1]);
  return Number.isFinite(bhk) ? bhk : null;
}

export function resolveFloorPlanVariant(
  variants: PublicPropertyVariant[],
  label: string | null | undefined,
): PublicPropertyVariant | undefined {
  if (!label || variants.length === 0) return undefined;

  const needle = normalizeMatchKey(label);
  const exact = variants.find((variant) => variant.label && normalizeMatchKey(variant.label) === needle);
  if (exact) return exact;

  const planSize = parseLabelSizeSuffix(label);
  const planBhk = parseBhkFromLabel(label);

  if (planSize) {
    const sizedMatches = variants.filter((variant) => {
      const listedSize = variantListedSize(variant);
      if (listedSize === null || Math.abs(listedSize - planSize.amount) >= 0.01) {
        return false;
      }

      const unit = variantAreaUnit(variant);
      if (!areaUnitsMatch(unit, planSize.unit)) {
        return false;
      }

      if (planBhk !== null && variant.bhk !== undefined && variant.bhk !== null) {
        return variant.bhk === planBhk;
      }

      return true;
    });

    if (sizedMatches.length === 1) {
      return sizedMatches[0];
    }

    if (sizedMatches.length > 1 && planBhk !== null) {
      const bhkMatch = sizedMatches.find((variant) => variant.bhk === planBhk);
      if (bhkMatch) return bhkMatch;
    }
  }

  if (planBhk !== null) {
    const sameBhk = variants.filter((variant) => variant.bhk === planBhk);
    if (sameBhk.length === 1) {
      return sameBhk[0];
    }
  }

  return undefined;
}

function buildFloorPlans(dto: PublicPropertyDetails): PropertyDetailsFloorPlan[] {
  const variants = dto.variants ?? [];

  return dto.floorPlans.map((plan) => {
    const variant = resolveFloorPlanVariant(variants, plan.label);
    const area = variant ? variantArea(variant) : null;
    const price = variant ? formatAmount(variant.price) : null;
    const areaUnit = variant ? variantAreaUnit(variant) : "sq-ft";

    return {
      id: plan.id,
      label: plan.label ?? EMPTY_VALUE,
      planType: plan.planType,
      areaLabel: area === null ? EMPTY_VALUE : (formatArea(area, areaUnit) ?? EMPTY_VALUE),
      areaType: toNumber(variant?.superBuiltUpArea) !== null ? "Super Built-up Area" : "Carpet Area",
      priceLabel: price ?? PRICE_ON_REQUEST,
      imageUrl: plan.path,
    };
  });
}

const PROJECT_USP_KIND = "project-highlight";
const PRIME_LOCATION_KIND = "prime-location";

function buildProjectUsps(highlights: PublicPropertyProject["highlights"] | undefined): string[] {
  return (highlights ?? [])
    .filter(({ kind }) => kind === PROJECT_USP_KIND)
    .map(({ text }) => text.trim())
    .filter(Boolean);
}

function buildNearbyPlaces(
  highlights: PublicPropertyProject["highlights"] | undefined,
): PropertyDetailsNearbyPlace[] {
  return (highlights ?? [])
    .filter(({ kind }) => kind === PRIME_LOCATION_KIND)
    .map(({ text, distance }) => ({
      place: text.trim(),
      distance: distance?.trim() || null,
    }))
    .filter(({ place }) => place.length > 0);
}

function buildFaqs(project: PublicPropertyDetails["project"]): PropertyDetailsFaq[] {
  return (project?.faqs ?? []).flatMap(({ question, answer }) => {
    const q = question?.trim();
    const a = answer?.trim();
    return q && a ? [{ question: q, answer: a }] : [];
  });
}

function buildProjectView(dto: PublicPropertyDetails): PropertyDetailsProjectView {
  const { listing } = dto;
  const project = dto.project;
  const subType = subTypeLabel(listing.propertyType, listing.propertySubType);
  const bhkConfigurations = dto.variants?.length
    ? dto.variants.map((variant) => variant.label ?? `${variant.bhk} BHK ${subType}`)
    : listing.bedrooms.map((bhk) => `${bhk} BHK ${subType}`);
  const isReady = dto.constructionStatus === "ready-to-move";
  const possessionLabel = isReady ? "Immediate" : (formatDate(dto.possessionDate) ?? EMPTY_VALUE);
  const launchDate = formatDate(project?.launchDate) ?? EMPTY_VALUE;
  const reraNumber = typeof dto.pricing.reraNumber === "string" ? dto.pricing.reraNumber : null;
  const avgPrice = formatProjectAvgPrice(dto.builderListing?.avgPrice, dto.builderListing?.areaUnit);
  const developerName = project?.developerName ?? listing.builderName ?? dto.poster.name;
  const stats = project?.developerStats;
  const hasDeveloperStats =
    (stats?.totalProjects ?? 0) > 0 ||
    (stats?.ongoingProjects ?? 0) > 0 ||
    (stats?.completedProjects ?? 0) > 0;
  const plotFloorsAllowed = usesSearchListingDetailRows(listing) ? floorsAllowedRow(dto.attributes) : null;
  const overviewRows: PropertyDetailsSpecRow[] = [
    { label: "Avg. Price", value: avgPrice ?? EMPTY_VALUE },
    {
      label: "Configuration",
      value: formatPropertyConfigurationLabel(bhkConfigurations) || EMPTY_VALUE,
    },
    ...(showsProjectStatus(listing)
      ? [{ label: "Project Status", value: formatProjectType(project?.projectType) ?? EMPTY_VALUE }]
      : []),
    { label: "Date of Launch", value: launchDate },
    { label: "Date of Possession", value: possessionLabel },
    { label: "Total Units", value: project?.totalUnits ? String(project.totalUnits) : EMPTY_VALUE },
    ...(showsTotalTower(listing)
      ? [
          {
            label: "Total Tower",
            value: project?.totalBlocks ? String(project.totalBlocks) : EMPTY_VALUE,
          },
        ]
      : []),
    ...(showsTotalFloors(listing)
      ? [
          {
            label: "No. of Floors",
            value: listing.totalFloors !== null ? String(listing.totalFloors) : EMPTY_VALUE,
          },
        ]
      : []),
    { label: "Project Area", value: formatProjectArea(project?.projectAreaAcres) },
    { label: "ReraId", value: reraNumber ?? "Not Available" },
    ...(plotFloorsAllowed ? [plotFloorsAllowed] : []),
  ];

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
    overviewRows,
    pricingRows: buildPricingRows(dto),
    floorPlans: buildFloorPlans(dto),
    bhkConfigurations,
    projectUsps: buildProjectUsps(project?.highlights),
    developer: {
      name: developerName,
      totalProjects: stats?.totalProjects ?? 0,
      ongoingProjects: stats?.ongoingProjects ?? 0,
      completedProjects: stats?.completedProjects ?? 0,
      description: hasDeveloperStats
        ? `${developerName} lists residential and commercial projects in ${listing.city} on Lokesha.`
        : "",
    },
  };
}

function formatArea(area: unknown, unit: unknown): string | null {
  const value = toNumber(area);
  if (value === null) return null;

  const unitLabel = (typeof unit === "string" ? unit : "sq-ft").replace(/-/g, " ");
  return `${value.toLocaleString("en-IN")} ${unitLabel}`;
}

function areaWithRate(area: unknown, unit: unknown, price: number | null): string | null {
  const areaLabel = formatArea(area, unit);
  if (!areaLabel) return null;

  const value = toNumber(area);
  const unitLabel = (typeof unit === "string" ? unit : "sq-ft").replace(/-/g, " ");
  const rate = price !== null && value !== null && value > 0 ? ` | ${formatPriceAmount(Math.round(price / value))}/${unitLabel}` : "";
  return `${areaLabel}${rate}`;
}

function buildPricingRows(dto: PublicPropertyDetails): PropertyDetailsSpecRow[] {
  const { attributes: a, pricing: p, listing } = dto;
  const isSale = listing.listingType === "sale";
  const parkingLabel = resolveCarParkingLabel({
    attributeCount: toNumber(a.carParkingCount),
    listingCount: listing.carParkingCount,
    variants: dto.variants,
  });
  const parkingRow: Rows = isPgListing(listing) ? [] : [["Car Parking", parkingLabel]];
  const rows: Rows = isSale
    ? [
        ["Booking Amount", formatAmount(p.bookingAmount)],
        ["Maintenance Charges", formatAmount(p.maintenanceCharges)],
        ...parkingRow,
      ]
    : [
        ["Monthly Rent", formatAmount(p.monthlyRent)],
        ["Security Deposit", formatAmount(p.depositAmount)],
        ["Maintenance Charges", formatAmount(p.maintenanceCharges)],
        ...parkingRow,
      ];

  return toRows(rows);
}

function buildUnitRows(dto: PublicPropertyDetails): Pick<PropertyDetailsUnitView, "propertyDetailRows" | "pricingRows"> {
  const { attributes: a, listing, selections } = dto;

  if (usesSearchListingDetailRows(listing)) {
    return {
      propertyDetailRows: buildSearchListingDetailRows(listing, a),
      pricingRows: buildPricingRows(dto),
    };
  }

  const price = listing.price;
  const floor = toNumber(a.floorNumber);
  const totalFloors = toNumber(a.totalFloors);
  const transaction = typeof a.propertyTransaction === "string" ? a.propertyTransaction : null;
  const pgListing = isPgListing(listing);

  const pgOrUnitDetailRows: Rows = pgListing
    ? [
        ["PG Operation Since", formatPgOperationSince(a.operatingSinceYear)],
        ["Tenant Preference", formatTenantPreferences(selections.tenantPreference)],
        ["Gender", formatPgGender(a.pgGender ?? listing.pgGender)],
      ]
    : [
        ["Balconies", toNumber(a.balconies)?.toString() ?? null],
        ["Facing", humanize(dto.facing)],
      ];

  const propertyDetailRows = toRows([
    ["Property Transaction", transaction ? `${humanize(transaction)} Property` : null],
    ["Furnishing Status", humanize(a.furnishingStatus as string | null)],
    ["Bedrooms", toNumber(a.bedrooms)?.toString() ?? null],
    ["Bathrooms", toNumber(a.bathrooms)?.toString() ?? null],
    ["Super Built-up Area", formatArea(a.superBuiltUpArea, a.superBuiltUpAreaUnit)],
    ["Carpet Area", formatArea(a.carpetArea, a.carpetAreaUnit)],
    ["Plot Area", areaWithRate(a.plotArea, a.plotAreaUnit, price)],
    ["Property Age", AGE_LABELS[a.ageOfConstruction as string] ?? null],
    ["Floor Number", floor === null ? null : totalFloors === null ? String(floor) : `${floor} out of ${totalFloors}`],
    ...pgOrUnitDetailRows,
    ["Available From", formatDate(dto.availableFrom)],
  ]);

  return { propertyDetailRows, pricingRows: buildPricingRows(dto) };
}

function buildUnitView(dto: PublicPropertyDetails): PropertyDetailsUnitView {
  const { listing } = dto;
  const subType = subTypeLabel(listing.propertyType, listing.propertySubType);
  const bhk = listing.bedrooms.length ? `${bedroomSummary(listing.bedrooms)} BHK ` : "";

  return {
    ...buildBase(
      dto,
      `${bhk}${subType} for ${transactionLabel(listing)} in ${listing.title}, ${listing.locality}, ${listing.city}`,
      `${bhk}${subType} for ${transactionLabel(listing)} in ${listing.title}, ${listing.locality}, ${listing.city}`,
    ),
    kind: "unit",
    headlineTitle: listing.title,
    furnishingItems: dto.furnishingItems,
    ...buildUnitRows(dto),
  };
}

export function buildPropertyDetailsView(dto: PublicPropertyDetails): PropertyDetailsView {
  return dto.kind === "project" ? buildProjectView(dto) : buildUnitView(dto);
}
