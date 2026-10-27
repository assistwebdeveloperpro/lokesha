import {
  BHK_OPTIONS,
  CONVERSION_STATUS_OPTIONS,
  INFRASTRUCTURE_OPTIONS,
  IRRIGATION_OPTIONS,
  LAND_SIZE_UNIT_OPTIONS,
  PAYMENT_PLAN_OPTIONS,
  PROJECT_AREA_UNIT_OPTIONS,
  createAvailableSizeRow,
  createInitialProjectDetails,
  createInitialSpecifications,
  createRowId,
  type BhkCharges,
  type BhkCarParking,
  type BrochureImage,
  type FloorPlanRow,
  type ProjectDetailsValues,
  type SpecificationGroup,
} from "@/components/master/post-property/postPropertyProjectDetails";
import { DEFAULT_STATE } from "@/data/indianStatesCities";
import { getAssetUrl } from "@/services/apiClient";
import type {
  DraftFileKind,
  PayloadFields,
  PropertyDetailResponse,
  PropertyFloorPlanDto,
  PropertyListingPayload,
  PropertyMediaFileDto,
  PropertyPayload,
} from "@/services/property.service";
import type { PostingAsId } from "../config/postingAs";
import {
  FACING_OPTIONS,
  MANAGED_BY_OPTIONS,
  PENTHOUSE_TYPE_OPTIONS,
  PG_GENDER_OPTIONS,
  PG_PRESENT_IN_OPTIONS,
  ROAD_FACING_OPTIONS,
  SUB_TYPES_BY_PROPERTY_TYPE,
  TERRACE_ENTRY_OPTIONS,
  createEmptyPhotosVideosValues,
  type AddressLocationValues,
  type AmenitiesValues,
  type ListingTypeId,
  type PhotosVideosValues,
  type PricingOthersValues,
  type PropertyDetailsValues,
  type PropertyMediaFile,
  type PropertyTypeId,
} from "../config/postPropertyForm.shared";
import {
  INITIAL_ADDRESS_LOCATION,
  INITIAL_AMENITIES,
  INITIAL_PRICING_OTHERS,
  INITIAL_PROPERTY_DETAILS,
} from "../state/postPropertyInitialValues";
import type { SerializableFormState } from "../state/postPropertyDraftSnapshot";
import {
  BROCHURE_IMAGE_CATEGORY,
  OCCUPANCY_KEYS,
  PRICE_INCLUSION_KEYS,
  PROJECT_TYPE_KEYS,
  toSlug,
} from "./postPropertyPayload";

export type EditedForm = {
  form: SerializableFormState;
  postingAs: PostingAsId | "";
};

const BHK_PLUS_THRESHOLD = 6;
const STAR_LABEL_SUFFIX = "Star";

// Reads of the backend values; anything missing is an empty form value
const text = (value: unknown) => (value === undefined || value === null ? "" : String(value));
const flag = (value: unknown) => value === true;
const list = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

// "north-east" -> "North - East": the form shows labels, the backend stores slugs
const labelOf = (options: readonly string[], slug: unknown) =>
  options.find((option) => toSlug(option) === slug) ?? "";

const labelsOf = (options: readonly string[], slugs: unknown) =>
  list(slugs).flatMap((slug) => labelOf(options, slug) || []);

// Ground floor is 0 in the backend
const toFloorLabel = (value: unknown) => (value === undefined || value === null ? "" : value === 0 ? "Ground Floor" : text(value));

// "22:30" -> "10:30 PM"
function toEntryLabel(value: unknown) {
  const match = /^(\d{2}):(\d{2})$/.exec(text(value));
  if (!match) return "";

  const hours = Number(match[1]);
  const hours12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${String(hours12).padStart(2, "0")}:${match[2]} ${hours < 12 ? "AM" : "PM"}`;
}

const toBhkLabel = (value: unknown) => {
  const bhk = Number(value);
  if (!Number.isFinite(bhk) || bhk < 1) return "";
  return bhk >= BHK_PLUS_THRESHOLD ? BHK_OPTIONS[BHK_OPTIONS.length - 1] : `${bhk} BHK`;
};

function mapAddress(payload: PropertyPayload, description: string): AddressLocationValues {
  const address = payload.address;

  return {
    ...INITIAL_ADDRESS_LOCATION,
    blockNo: text(address.blockNo),
    flatNumber: text(address.flatNumber),
    projectName: text(address.projectName),
    locality: text(address.locality),
    addressLine2: text(address.addressLine2),
    landmark: text(address.landmark),
    pinCode: text(address.pinCode),
    city: text(address.city),
    state: (text(address.state) || DEFAULT_STATE) as AddressLocationValues["state"],
    propertyDescription: description,
  };
}

function mapDetails(listing: PropertyListingPayload): PropertyDetailsValues {
  const details: PayloadFields = listing.details ?? {};
  const plot: PayloadFields = listing.plotDetails ?? {};
  const selections = listing.selections ?? {};
  const construction = listing.construction ?? {};

  return {
    ...INITIAL_PROPERTY_DETAILS,
    carpetAreaNumber: text(details.carpetArea),
    carpetAreaType: text(details.carpetAreaUnit) as PropertyDetailsValues["carpetAreaType"],
    superBuildUpNumber: text(details.superBuiltUpArea),
    superBuildUpType: text(details.superBuiltUpAreaUnit) as PropertyDetailsValues["superBuildUpType"],
    propertyTransaction: text(details.propertyTransaction) as PropertyDetailsValues["propertyTransaction"],
    constructionStatus: text(construction.status) as PropertyDetailsValues["constructionStatus"],
    possessionDate: text(construction.possessionDate),
    ageOfConstruction: text(details.ageOfConstruction) as PropertyDetailsValues["ageOfConstruction"],
    bedrooms: text(details.bedrooms),
    balcony: text(details.balconies),
    basementFloors: details.basementFloors ? `${text(details.basementFloors)}B` : "None",
    totalFloors: text(details.totalFloors),
    floorNumber: toFloorLabel(details.floorNumber),
    bathrooms: text(details.bathrooms),
    lift: text(details.lifts),
    fullHouse: flag(details.isFullHouse),
    sharingBasis: flag(details.isSharingBasis),
    availableFrom: text(listing.availableFrom),
    interiorModificationAllowed: flag(listing.pricing.interiorModificationAllowed),
    tenantPreferences: selections.tenantPreference ?? [],
    cabins: text(details.cabins),
    entranceWidth: text(details.entranceWidthM),
    currentlyLeasedOut: flag(details.isLeasedOut),
    leaseContractTill: text(details.leaseContractTill),
    plotLengthNumber: text(plot.plotLength),
    plotLengthType: text(plot.plotLengthUnit) as PropertyDetailsValues["plotLengthType"],
    plotBreadthNumber: text(plot.plotBreadth),
    plotBreadthType: text(plot.plotBreadthUnit) as PropertyDetailsValues["plotBreadthType"],
    roadWidth: text(plot.roadWidthM),
    anyConstruction: flag(details.anyConstruction),
    boundaryWallMade: flag(details.boundaryWallMade),
    cornerPlot: flag(details.cornerPlot),
    floorsAllowed: text(plot.floorsAllowed),
    managedBy: labelOf(MANAGED_BY_OPTIONS, details.managedBy),
    pgOperationSince: text(details.operatingSinceYear),
    pgPresentIn: labelOf(PG_PRESENT_IN_OPTIONS, details.pgPresentIn),
    pgName: text(details.pgName),
    occupancies: list(selections.occupancy).flatMap(
      (key) => Object.keys(OCCUPANCY_KEYS).find((label) => OCCUPANCY_KEYS[label] === key) ?? [],
    ),
    pgGender: labelOf(PG_GENDER_OPTIONS, details.pgGender),
    pgRules: selections.pgRule ?? [],
    entryTill: toEntryLabel(details.entryTill),
    foods: selections.food ?? [],
    plotAreaNumber: text(plot.plotArea),
    plotAreaType: text(plot.plotAreaUnit) as PropertyDetailsValues["plotAreaType"],
    terraceAreaNumber: text(details.terraceArea),
    terraceAreaType: text(details.terraceAreaUnit) as PropertyDetailsValues["terraceAreaType"],
    penthouseType: labelOf(PENTHOUSE_TYPE_OPTIONS, details.penthouseType),
    terraceEntry: labelsOf(TERRACE_ENTRY_OPTIONS, selections.terraceEntry),
    // A saved listing already has its lease answer
    leasedOutAnswered: true,
  };
}

function mapAmenities(listing: PropertyListingPayload): AmenitiesValues {
  const details: PayloadFields = listing.details ?? {};
  const parkingCount = Number(details.carParkingCount);
  const hasParking = Number.isFinite(parkingCount) && parkingCount > 0;

  return {
    ...INITIAL_AMENITIES,
    status: text(details.furnishingStatus) as AmenitiesValues["status"],
    furnishing: listing.amenities?.furnishing ?? [],
    amenities: listing.amenities?.amenities ?? [],
    facing: labelOf(FACING_OPTIONS, listing.facing) as AmenitiesValues["facing"],
    carParkingAvailable: hasParking,
    carParking: hasParking ? text(parkingCount) : "",
    clubMembership: flag(details.clubMembership),
    reraNumber: text(listing.pricing.reraNumber),
    openSides: text(details.openSides),
    washrooms: text(details.washrooms),
    roadFacing: labelOf(ROAD_FACING_OPTIONS, details.roadFacing),
    businessTypes: listing.selections?.businessType ?? [],
    pantry: flag(details.hasPantry),
    cafeteria: flag(details.hasCafeteria),
    cornerShop: flag(details.isCornerShop),
  };
}

function mapPricing(listing: PropertyListingPayload): PricingOthersValues {
  const pricing = listing.pricing;
  const details: PayloadFields = listing.details ?? {};
  const inclusions = [
    pricing.includesCarParking && PRICE_INCLUSION_KEYS.carParking,
    pricing.includesClubMembership && PRICE_INCLUSION_KEYS.clubMembership,
    pricing.includesPlc && PRICE_INCLUSION_KEYS.plc,
  ].filter((key): key is string => typeof key === "string");

  return {
    ...INITIAL_PRICING_OTHERS,
    expectedPrice: text(pricing.expectedPrice),
    priceInclusion: inclusions,
    priceNegotiable: flag(pricing.priceNegotiable),
    transferFee: text(pricing.transferFee),
    bookingAmount: text(pricing.bookingAmount),
    maintenanceCharges: text(pricing.maintenanceCharges),
    benefitsRemarks: text(pricing.benefitsRemarks),
    monthlyRent: text(pricing.monthlyRent),
    noticePeriod: text(pricing.noticePeriodMonths),
    depositAmount: text(pricing.depositAmount),
    assuredReturn: text(pricing.assuredReturnPercent),
    yearlyIncrement: text(details.leaseYearlyIncrementPercent),
    leaseAmount: text(details.leaseAmount),
  };
}

const fileName = (path: string) => path.split("/").pop() ?? path;

function toMediaFile(media: PropertyMediaFileDto, kind: DraftFileKind): PropertyMediaFile {
  return {
    id: media.id,
    name: media.originalName ?? fileName(media.path),
    type: media.mediaType === "video" ? "video" : "image",
    status: "uploaded",
    remote: { id: media.id, path: media.path, kind },
    // Posted files are public, so no download is needed to show them
    previewUrl: media.mediaType === "document" ? "" : getAssetUrl(media.path),
  };
}

function mapPhotos(media: PropertyMediaFileDto[], isBuilder: boolean) {
  const photos: PhotosVideosValues = createEmptyPhotosVideosValues();
  const brochureImages: BrochureImage[] = [];

  for (const item of media) {
    if (item.category === "brochure") {
      photos.brochure = toMediaFile(item, "brochure");
    } else if (item.category === BROCHURE_IMAGE_CATEGORY && isBuilder) {
      brochureImages.push({
        id: item.id,
        name: item.originalName ?? fileName(item.path),
        previewUrl: getAssetUrl(item.path),
        status: "uploaded",
        remote: { id: item.id, path: item.path, kind: "media" },
      });
    } else if (item.category in photos.mediaByCategory) {
      photos.mediaByCategory[item.category as keyof PhotosVideosValues["mediaByCategory"]].push(
        toMediaFile(item, "media"),
      );
    }
  }

  return { photos, brochureImages };
}

function mapFloorPlans(floorPlans: PropertyFloorPlanDto[]): FloorPlanRow[] {
  return floorPlans.map((plan) => ({
    id: plan.id,
    label: plan.label ?? "",
    planType: plan.planType === "3d" ? "3d" : "2d",
    file: null,
    previewUrl: getAssetUrl(plan.path),
    status: "uploaded",
    remote: { id: plan.id, path: plan.path, kind: "floor-plan" },
  }));
}

// Standard fields keep their place in the first group; extra groups and custom fields follow
function mapSpecifications(
  specifications: NonNullable<NonNullable<PropertyListingPayload["builder"]>["specifications"]>,
): SpecificationGroup[] {
  const [base] = createInitialSpecifications();
  const groups = new Map<string, SpecificationGroup>([["", base]]);

  for (const spec of specifications) {
    const title = spec.groupTitle === "General" ? "" : spec.groupTitle;
    const group = groups.get(title) ?? { id: createRowId(), title, items: [] };
    groups.set(title, group);

    const standard = !spec.isCustom && group.items.find((item) => !item.custom && item.label === spec.label);
    if (standard) {
      standard.value = spec.value;
    } else {
      group.items.push({ id: createRowId(), label: spec.label, value: spec.value, custom: Boolean(spec.isCustom) });
    }
  }

  return [...groups.values()];
}

function mapProject(
  payload: PropertyPayload,
  listing: PropertyListingPayload,
  propertyType: PropertyTypeId,
  floorPlans: PropertyFloorPlanDto[],
  brochureImages: BrochureImage[],
): ProjectDetailsValues {
  const project = payload.project;
  const details: PayloadFields = listing.details ?? {};
  const builder = listing.builder?.listing ?? {};
  const subTypeLabel =
    SUB_TYPES_BY_PROPERTY_TYPE[propertyType]?.find((option) => option.id === listing.propertySubType)?.label ?? "";

  const bhkCarParking: Record<string, BhkCarParking> = {};
  const bhkCharges: Record<string, BhkCharges> = {};
  const availableSizes = (listing.variants ?? []).map((variant) => {
    const bhk = toBhkLabel(variant.details?.bhk);
    const charges = variant.charges;

    if (charges) {
      bhkCarParking[bhk] = {
        available: flag(charges.carParkingAvailable),
        count: text(charges.carParkingCount),
        clubMembership: flag(charges.clubMembership),
      };
      bhkCharges[bhk] = {
        transferFee: text(charges.transferFee),
        bookingAmount: text(charges.bookingAmount),
        maintenanceCharges: text(charges.maintenanceCharges),
        benefitsRemarks: text(charges.benefitsRemarks),
      };
    }

    return {
      ...createAvailableSizeRow(subTypeLabel),
      bhk,
      sizeUnit: labelOf(LAND_SIZE_UNIT_OPTIONS, variant.sizeUnit) || LAND_SIZE_UNIT_OPTIONS[0],
      size: text(variant.size),
      price: text(variant.price),
      unitsAvailable: text(variant.unitsAvailable),
    };
  });

  const initial = createInitialProjectDetails(subTypeLabel);
  const projectTypeLabel = Object.keys(PROJECT_TYPE_KEYS).find((label) => PROJECT_TYPE_KEYS[label] === project?.projectType);

  return {
    ...initial,
    projectType: projectTypeLabel ?? "",
    developerName: text(project?.developerName),
    launchDate: text(project?.launchDate),
    totalUnits: text(project?.totalUnits),
    totalBlocks: text(project?.totalBlocks),
    projectArea: text(project?.projectAreaAcres),
    openSpacePercent: text(project?.openSpacePercent),
    approvedBy: text(project?.approvedBy),
    reraLink: text(project?.reraLink),
    virtualTourLink: text(project?.virtualTourLink),
    videoLink: text(project?.videoLink),
    paymentPlan: labelOf(PAYMENT_PLAN_OPTIONS, project?.paymentPlan),
    areaUnit: labelOf(PROJECT_AREA_UNIT_OPTIONS, builder.areaUnit) || initial.areaUnit,
    projectSize: text(builder.projectSize),
    avgPrice: text(builder.avgPrice),
    pricePerSqft: text(builder.pricePerSqft),
    priceMin: text(builder.priceMin),
    priceMax: text(builder.priceMax),
    carpetAreaMax: text(builder.carpetAreaMax),
    superBuildUpMax: text(builder.superBuiltUpMax),
    plotAreaMax: text(builder.plotAreaMax),
    terraceAreaMax: text(builder.terraceAreaMax),
    distanceFromCity: text(builder.distanceFromCityKm),
    storageCapacity: text(builder.storageCapacityTons),
    powerLoad: text(builder.powerLoadKva),
    loadingBays: text(builder.loadingBays),
    clearHeight: text(builder.clearHeightFt),
    conversionStatus: labelOf(CONVERSION_STATUS_OPTIONS, builder.conversionStatus),
    naConversionDone: flag(builder.naConversionDone),
    starCategory: details.starCategory ? `${text(details.starCategory)} ${STAR_LABEL_SUFFIX}` : "",
    infrastructure: labelsOf(INFRASTRUCTURE_OPTIONS, listing.selections?.infrastructure),
    irrigationSources: labelsOf(IRRIGATION_OPTIONS, listing.selections?.irrigationSource),
    specifications: mapSpecifications(listing.builder?.specifications ?? []),
    brochureImages,
    availableSizes: availableSizes.length > 0 ? availableSizes : initial.availableSizes,
    bhkCarParking,
    bhkCharges,
    projectHighlights: project?.highlights?.length
      ? project.highlights.map((item) => ({ id: createRowId(), text: item.text }))
      : initial.projectHighlights,
    primeLocationHighlights: project?.primeLocations?.length
      ? project.primeLocations.map((item) => ({ id: createRowId(), place: item.text, distance: text(item.distance) }))
      : initial.primeLocationHighlights,
    faqs: project?.faqs?.length
      ? project.faqs.map((item) => ({ id: createRowId(), question: item.question, answer: item.answer }))
      : initial.faqs,
    floorPlans: floorPlans.length > 0 ? mapFloorPlans(floorPlans) : initial.floorPlans,
  };
}

// The inverse of buildPropertyPayload: a loaded listing becomes the form state again
export function mapDetailToForm(detail: PropertyDetailResponse): EditedForm {
  const { payload } = detail;
  const [listing] = payload.listings;
  const propertyType = payload.propertyType as PropertyTypeId;
  const isBuilder = Boolean(payload.project);
  const { photos, brochureImages } = mapPhotos(detail.media, isBuilder);

  return {
    postingAs: payload.postingAs === "builder" ? "builder" : "",
    form: {
      listingType: payload.listingType as ListingTypeId,
      propertyType,
      // PG listings have no sub type picker
      propertySubTypes: [propertyType === "pg-co-living" ? "" : listing.propertySubType],
      addressLocation: mapAddress(payload, listing.description),
      propertyDetails: mapDetails(listing),
      amenities: mapAmenities(listing),
      pricingOthers: mapPricing(listing),
      photosVideos: photos,
      projectDetails: isBuilder
        ? mapProject(payload, listing, propertyType, detail.floorPlans, brochureImages)
        : createInitialProjectDetails(),
    },
  };
}
