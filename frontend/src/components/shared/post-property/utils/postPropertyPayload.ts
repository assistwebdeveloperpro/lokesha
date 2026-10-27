import type { ProjectDetailsValues } from "@/components/master/post-property/postPropertyProjectDetails";
import type {
  PayloadFields,
  PropertyListingPayload,
  PropertyPayload,
  PropertyProjectPayload,
  PropertyVariantPayload,
} from "@/services/property.service";
import {
  PHOTO_CATEGORY_OPTIONS,
  SUB_TYPES_BY_PROPERTY_TYPE,
  isRentListing,
  showsFurnishingField,
  type AddressLocationValues,
  type AmenitiesValues,
  type ListingTypeId,
  type PhotosVideosValues,
  type PricingOthersValues,
  type PropertyDetailsValues,
  type PropertyTypeId,
} from "../config/postPropertyForm.shared";
import { sanitizeAmountRaw } from "./postPropertyAmount";

// Everything one listing (the single form, or one sub type tab) is built from
export type ListingFormInput = {
  subType: string;
  details: PropertyDetailsValues;
  amenities: AmenitiesValues;
  pricing: PricingOthersValues;
  photos: PhotosVideosValues;
  // Builder only: project values with this sub type's own maximum areas
  project?: ProjectDetailsValues;
};

export type PropertyPayloadInput = {
  listingType: ListingTypeId;
  propertyType: PropertyTypeId;
  address: AddressLocationValues;
  listings: ListingFormInput[];
  // Present for builder posts; project wide files go with the first listing
  builderProject?: ProjectDetailsValues;
  postingAsBuilder?: boolean;
};

const DEFAULT_PG_SUB_TYPE = "pg";
export const BROCHURE_IMAGE_CATEGORY = "brochure-images";

// The form shows these as labels; the backend stores fixed keys
export const OCCUPANCY_KEYS: Record<string, string> = {
  Single: "single",
  Double: "double",
  Triple: "triple",
  "Triple+": "triple-plus",
};

export const PROJECT_TYPE_KEYS: Record<string, string> = {
  "New Launch": "new-launch",
  "Under Construction": "under-construction",
  "Ready to Move": "ready",
  Completed: "completed",
};

export const PRICE_INCLUSION_KEYS = {
  carParking: "car-parking",
  clubMembership: "club-membership",
  plc: "plc",
} as const;

const hasValue = (value: unknown) => value !== undefined && value !== null && value !== "";

// Empty values are left out; the backend treats a missing field as not answered
function compact(fields: Record<string, unknown>): PayloadFields {
  return Object.fromEntries(Object.entries(fields).filter(([, value]) => hasValue(value)));
}

function toNumber(value: string): number | undefined {
  const trimmed = sanitizeAmountRaw(value.trim());
  if (!trimmed) return undefined;

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toText(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed || undefined;
}

// "North - East" -> "north-east", "sq ft" -> "sq-ft"
export function toSlug(value: string): string | undefined {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || undefined;
}

// "Ground Floor" is 0, numeric strings are numbers
function toFloorNumber(value: string): number | undefined {
  return /ground/i.test(value) ? 0 : toNumber(value);
}

// "10:30 PM" -> "22:30"
function toTime24(value: string): string | undefined {
  const match = /^(\d{1,2}):(\d{2}) (AM|PM)$/.exec(value.trim());
  if (!match) return undefined;

  const hours = (Number(match[1]) % 12) + (match[3] === "PM" ? 12 : 0);
  return `${String(hours).padStart(2, "0")}:${match[2]}`;
}

// "3 BHK" -> 3, "6+ BHK" -> 6
const toBhk = (value: string) => toNumber(value.replace(/\D+.*$/, ""));

const toStarCategory = (value: string) => {
  const match = /^(\d) Star$/.exec(value);
  return match ? Number(match[1]) : undefined;
};

const toSlugs = (values: string[]) => values.flatMap((value) => toSlug(value) ?? []);

function buildDetails(
  { details, amenities, pricing, project }: ListingFormInput,
  isRent: boolean,
): PayloadFields {
  return compact({
    carpetArea: toNumber(details.carpetAreaNumber),
    carpetAreaUnit: details.carpetAreaType,
    superBuiltUpArea: toNumber(details.superBuildUpNumber),
    superBuiltUpAreaUnit: details.superBuildUpType,
    furnishingStatus: amenities.status,
    bedrooms: toNumber(details.bedrooms),
    balconies: toNumber(details.balcony),
    bathrooms: toNumber(details.bathrooms),
    lifts: toNumber(details.lift),
    totalFloors: toNumber(details.totalFloors),
    basementFloors: toNumber(details.basementFloors),
    floorNumber: toFloorNumber(details.floorNumber),
    ageOfConstruction: details.ageOfConstruction,
    propertyTransaction: isRent ? undefined : details.propertyTransaction,
    isFullHouse: isRent ? details.fullHouse : undefined,
    isSharingBasis: isRent ? details.sharingBasis : undefined,
    terraceArea: toNumber(details.terraceAreaNumber),
    terraceAreaUnit: details.terraceAreaType,
    penthouseType: toSlug(details.penthouseType),
    cabins: toNumber(details.cabins),
    entranceWidthM: toNumber(details.entranceWidth),
    washrooms: toNumber(amenities.washrooms),
    roadFacing: toSlug(amenities.roadFacing),
    hasPantry: amenities.pantry,
    hasCafeteria: amenities.cafeteria,
    isCornerShop: amenities.cornerShop,
    managedBy: toSlug(details.managedBy),
    carParkingCount: amenities.carParkingAvailable ? toNumber(amenities.carParking) : 0,
    clubMembership: isRent ? undefined : amenities.clubMembership,
    openSides: toNumber(amenities.openSides),
    isLeasedOut: isRent ? undefined : details.currentlyLeasedOut,
    leaseContractTill: isRent ? undefined : toText(details.leaseContractTill),
    leaseAmount: toNumber(pricing.leaseAmount),
    leaseYearlyIncrementPercent: toNumber(pricing.yearlyIncrement),
    anyConstruction: details.anyConstruction,
    boundaryWallMade: details.boundaryWallMade,
    cornerPlot: details.cornerPlot,
    starCategory: project ? toStarCategory(project.starCategory) : undefined,
    pgName: toText(details.pgName),
    pgGender: toSlug(details.pgGender),
    pgPresentIn: toSlug(details.pgPresentIn),
    operatingSinceYear: toNumber(details.pgOperationSince),
    entryTill: toTime24(details.entryTill),
  });
}

function buildPlotDetails({ details }: ListingFormInput): PayloadFields {
  return compact({
    plotArea: toNumber(details.plotAreaNumber),
    plotAreaUnit: details.plotAreaType,
    plotLength: toNumber(details.plotLengthNumber),
    plotLengthUnit: details.plotLengthType,
    plotBreadth: toNumber(details.plotBreadthNumber),
    plotBreadthUnit: details.plotBreadthType,
    roadWidthM: toNumber(details.roadWidth),
    floorsAllowed: toNumber(details.floorsAllowed),
  });
}

function buildPricing({ details, amenities, pricing }: ListingFormInput, isRent: boolean): PayloadFields {
  if (isRent) {
    return compact({
      monthlyRent: toNumber(pricing.monthlyRent),
      depositAmount: toNumber(pricing.depositAmount),
      maintenanceCharges: toNumber(pricing.maintenanceCharges),
      noticePeriodMonths: toNumber(pricing.noticePeriod),
      priceNegotiable: pricing.priceNegotiable,
      interiorModificationAllowed: details.interiorModificationAllowed,
      benefitsRemarks: toText(pricing.benefitsRemarks),
    });
  }

  return compact({
    expectedPrice: toNumber(pricing.expectedPrice),
    priceNegotiable: pricing.priceNegotiable,
    transferFee: toNumber(pricing.transferFee),
    bookingAmount: toNumber(pricing.bookingAmount),
    maintenanceCharges: toNumber(pricing.maintenanceCharges),
    assuredReturnPercent: toNumber(pricing.assuredReturn),
    includesCarParking: pricing.priceInclusion.includes(PRICE_INCLUSION_KEYS.carParking),
    includesClubMembership: pricing.priceInclusion.includes(PRICE_INCLUSION_KEYS.clubMembership),
    includesPlc: pricing.priceInclusion.includes(PRICE_INCLUSION_KEYS.plc),
    reraNumber: toText(amenities.reraNumber),
    benefitsRemarks: toText(pricing.benefitsRemarks),
  });
}

// Groups the backend does not know for a sub type are dropped there
function buildSelections(
  { details, amenities, project }: ListingFormInput,
  isRent: boolean,
): Record<string, string[]> {
  return {
    tenantPreference: isRent ? details.tenantPreferences : [],
    food: details.foods,
    pgRule: details.pgRules,
    occupancy: details.occupancies.flatMap((label) => OCCUPANCY_KEYS[label] ?? []),
    businessType: amenities.businessTypes,
    terraceEntry: toSlugs(details.terraceEntry),
    infrastructure: toSlugs(project?.infrastructure ?? []),
    irrigationSource: toSlugs(project?.irrigationSources ?? []),
  };
}

function buildFiles(
  photos: PhotosVideosValues,
  projectFiles?: ProjectDetailsValues,
): NonNullable<PropertyListingPayload["files"]> {
  const media = PHOTO_CATEGORY_OPTIONS.flatMap((category) =>
    photos.mediaByCategory[category.id].flatMap((item) =>
      item.remote ? [{ path: item.remote.path, category: category.id, originalName: item.name }] : [],
    ),
  );

  const brochureImages = (projectFiles?.brochureImages ?? []).flatMap((image) =>
    image.remote ? [{ path: image.remote.path, category: BROCHURE_IMAGE_CATEGORY, originalName: image.name }] : [],
  );
  const floorPlans = (projectFiles?.floorPlans ?? []).flatMap((row) =>
    row.remote
      ? [{ path: row.remote.path, label: toText(row.label), planType: row.planType }]
      : [],
  );
  const brochure = photos.brochure?.remote
    ? { path: photos.brochure.remote.path, originalName: photos.brochure.name }
    : undefined;

  return { media: [...media, ...brochureImages], floorPlans, ...(brochure && { brochure }) };
}

function buildVariants(
  project: ProjectDetailsValues,
  unitTypeLabel: string,
  propertyType: PropertyTypeId,
  isFirstListing: boolean,
): PropertyVariantPayload[] {
  return project.availableSizes
    .filter((row) => row.unitType === unitTypeLabel || (!row.unitType && isFirstListing))
    .filter((row) => row.bhk || hasValue(toNumber(row.size)) || hasValue(toNumber(row.price)))
    .map((row) => {
      const parking = project.bhkCarParking[row.bhk];
      const charges = project.bhkCharges[row.bhk];
      const chargeFields = compact({
        carParkingAvailable: parking?.available,
        carParkingCount: parking?.available ? toNumber(parking.count) : undefined,
        clubMembership: parking?.clubMembership,
        transferFee: charges ? toNumber(charges.transferFee) : undefined,
        bookingAmount: charges ? toNumber(charges.bookingAmount) : undefined,
        maintenanceCharges: charges ? toNumber(charges.maintenanceCharges) : undefined,
        benefitsRemarks: charges ? toText(charges.benefitsRemarks) : undefined,
      });

      return {
        label: toText([row.bhk, row.unitType].filter(Boolean).join(" ")),
        size: toNumber(row.size),
        sizeUnit: toSlug(row.sizeUnit),
        price: toNumber(row.price),
        unitsAvailable: toNumber(row.unitsAvailable),
        details: propertyType === "residential" ? compact({ bhk: toBhk(row.bhk) }) : {},
        ...(Object.keys(chargeFields).length > 0 && { charges: chargeFields }),
      };
    });
}

function buildBuilderBlock(project: ProjectDetailsValues): NonNullable<PropertyListingPayload["builder"]> {
  return {
    listing: compact({
      areaUnit: toSlug(project.areaUnit),
      avgPrice: toNumber(project.avgPrice),
      projectSize: toNumber(project.projectSize),
      pricePerSqft: toNumber(project.pricePerSqft),
      priceMin: toNumber(project.priceMin),
      priceMax: toNumber(project.priceMax),
      carpetAreaMax: toNumber(project.carpetAreaMax),
      superBuiltUpMax: toNumber(project.superBuildUpMax),
      plotAreaMax: toNumber(project.plotAreaMax),
      terraceAreaMax: toNumber(project.terraceAreaMax),
      distanceFromCityKm: toNumber(project.distanceFromCity),
      conversionStatus: toSlug(project.conversionStatus),
      naConversionDone: project.naConversionDone,
      storageCapacityTons: toNumber(project.storageCapacity),
      powerLoadKva: toNumber(project.powerLoad),
      loadingBays: toNumber(project.loadingBays),
      clearHeightFt: toNumber(project.clearHeight),
    }),
    specifications: project.specifications.flatMap((group) =>
      group.items.flatMap((item) => {
        const value = toText(item.value);
        return value
          ? [{ groupTitle: group.title.trim() || "General", label: item.label, value, isCustom: item.custom }]
          : [];
      }),
    ),
  };
}

function buildProject(project: ProjectDetailsValues, address: AddressLocationValues): PropertyProjectPayload {
  return {
    ...compact({
      projectType: PROJECT_TYPE_KEYS[project.projectType],
      developerName: toText(project.developerName),
      launchDate: toText(project.launchDate),
      totalUnits: toNumber(project.totalUnits),
      totalBlocks: toNumber(project.totalBlocks),
      projectAreaAcres: toNumber(project.projectArea),
      openSpacePercent: toNumber(project.openSpacePercent),
      approvedBy: toText(project.approvedBy),
      reraLink: toText(project.reraLink),
      virtualTourLink: toText(project.virtualTourLink),
      videoLink: toText(project.videoLink),
      paymentPlan: toSlug(project.paymentPlan),
    }),
    projectName: toText(address.projectName) ?? toText(address.locality) ?? "",
    highlights: project.projectHighlights.flatMap((row) => (toText(row.text) ? [{ text: row.text.trim() }] : [])),
    primeLocations: project.primeLocationHighlights.flatMap((row) =>
      toText(row.place) ? [{ text: row.place.trim(), ...(toText(row.distance) && { distance: row.distance.trim() }) }] : [],
    ),
    faqs: project.faqs.flatMap((row) =>
      toText(row.question) && toText(row.answer)
        ? [{ question: row.question.trim(), answer: row.answer.trim() }]
        : [],
    ),
  };
}

function resolveSubType(propertyType: PropertyTypeId, subType: string) {
  return propertyType === "pg-co-living" ? subType || DEFAULT_PG_SUB_TYPE : subType;
}

function buildListing(
  input: PropertyPayloadInput,
  listing: ListingFormInput,
  index: number,
): PropertyListingPayload {
  const { listingType, propertyType, address, builderProject } = input;
  const isRent = isRentListing(listingType);
  const { details, amenities } = listing;
  const unitTypeLabel =
    SUB_TYPES_BY_PROPERTY_TYPE[propertyType]?.find((option) => option.id === listing.subType)?.label ?? "";

  return {
    propertySubType: resolveSubType(propertyType, listing.subType),
    description: address.propertyDescription.trim(),
    ...compact({
      facing: toSlug(amenities.facing),
      availableFrom: toText(details.availableFrom),
    }),
    construction: compact({
      status: isRent ? undefined : details.constructionStatus,
      possessionDate: isRent ? undefined : toText(details.possessionDate),
    }),
    details: buildDetails(listing, isRent),
    plotDetails: buildPlotDetails(listing),
    pricing: buildPricing(listing, isRent),
    selections: buildSelections(listing, isRent),
    amenities: {
      amenities: amenities.amenities,
      furnishing: showsFurnishingField(amenities.status) ? amenities.furnishing : [],
    },
    files: buildFiles(listing.photos, index === 0 ? builderProject : undefined),
    ...(builderProject && {
      variants: buildVariants(builderProject, unitTypeLabel, propertyType, index === 0),
      builder: buildBuilderBlock(listing.project ?? builderProject),
    }),
  };
}

// The request body of POST /property/drafts/:id/complete and PUT /property/:id
export function buildPropertyPayload(input: PropertyPayloadInput): PropertyPayload {
  const { listingType, propertyType, address, builderProject, postingAsBuilder } = input;

  return {
    listingType,
    propertyType,
    ...(postingAsBuilder && { postingAs: "builder" as const }),
    address: compact({
      projectName: toText(address.projectName),
      blockNo: toText(address.blockNo),
      flatNumber: toText(address.flatNumber),
      locality: toText(address.locality),
      addressLine2: toText(address.addressLine2),
      landmark: toText(address.landmark),
      pinCode: toText(address.pinCode),
      city: toText(address.city),
      state: address.state,
    }),
    ...(builderProject && { project: buildProject(builderProject, address) }),
    listings: input.listings.map((listing, index) => buildListing(input, listing, index)),
  };
}
