import { sanitizeAmountRaw } from "./postPropertyAmount";
import {
  PHOTO_CATEGORY_OPTIONS,
  getTotalMediaCount,
  isRentListing,
  showsFurnishingField,
  type AddressLocationValues,
  type AmenitiesValues,
  type ListingTypeId,
  type PhotosVideosValues,
  type PricingOthersValues,
  type PropertyDetailsValues,
  type PropertyTypeId,
} from "./postPropertyForm.shared";

import {
  getUnitTypeConfig,
  type ProjectDetailsValues,
} from "./postPropertyProjectDetails";

export type PostPropertyFormState = {
  listingType: ListingTypeId;
  propertyType: PropertyTypeId;
  propertySubType: string[];
  addressLocation: AddressLocationValues;
  propertyDetails: PropertyDetailsValues;
  amenities: AmenitiesValues;
  photosVideos: PhotosVideosValues;
  pricingOthers: PricingOthersValues;
};

function toNumberOrNull(value: string): number | null {
  const trimmed = sanitizeAmountRaw(value.trim());
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function toTextOrNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

// "Ground Floor" maps to 0, numeric strings to numbers
function toFloorNumber(value: string): number | null {
  return /ground/i.test(value) ? 0 : toNumberOrNull(value);
}

function buildPropertyData(state: PostPropertyFormState) {
  const { addressLocation, propertyDetails, amenities, pricingOthers } = state;
  const isRent = isRentListing(state.listingType);
  const hasFurnishing = showsFurnishingField(amenities.status);

  return {
    listingType: state.listingType,
    propertyType: state.propertyType,
    propertySubType: state.propertySubType.join(",") || null,
    address: {
      blockNo: toTextOrNull(addressLocation.blockNo),
      flatNumber: toTextOrNull(addressLocation.flatNumber),
      projectName: addressLocation.projectName.trim(),
      locality: addressLocation.locality.trim(),
      addressLine2: toTextOrNull(addressLocation.addressLine2),
      landmark: toTextOrNull(addressLocation.landmark),
      pinCode: addressLocation.pinCode.trim(),
      city: toTextOrNull(addressLocation.city),
      state: addressLocation.state,
      propertyDescription: addressLocation.propertyDescription.trim(),
    },
    details: {
      carpetArea: toNumberOrNull(propertyDetails.carpetAreaNumber),
      carpetAreaUnit: propertyDetails.carpetAreaType || null,
      superBuildUpArea: toNumberOrNull(propertyDetails.superBuildUpNumber),
      superBuildUpUnit: propertyDetails.superBuildUpType || null,
      propertyTransaction: isRent ? null : propertyDetails.propertyTransaction || null,
      constructionStatus: isRent ? null : propertyDetails.constructionStatus || null,
      possessionDate: isRent ? null : propertyDetails.possessionDate || null,
      ageOfConstruction: propertyDetails.ageOfConstruction || null,
      fullHouse: isRent && propertyDetails.fullHouse,
      sharingBasis: isRent && propertyDetails.sharingBasis,
      availableFrom: isRent ? propertyDetails.availableFrom || null : null,
      interiorModificationAllowed: isRent && propertyDetails.interiorModificationAllowed,
      tenantPreferences: isRent ? propertyDetails.tenantPreferences : [],
      bedrooms: toNumberOrNull(propertyDetails.bedrooms),
      balconies: toNumberOrNull(propertyDetails.balcony),
      totalFloors: toNumberOrNull(propertyDetails.totalFloors),
      floorNumber: toFloorNumber(propertyDetails.floorNumber),
      bathrooms: toNumberOrNull(propertyDetails.bathrooms),
      lift: toNumberOrNull(propertyDetails.lift),
    },
    amenities: {
      furnishingStatus: amenities.status || null,
      furnishing: hasFurnishing ? amenities.furnishing : [],
      amenities: amenities.amenities,
      facing: amenities.facing || null,
      carParkingAvailable: amenities.carParkingAvailable,
      carParking: amenities.carParkingAvailable ? toNumberOrNull(amenities.carParking) : null,
      clubMembership: !isRent && amenities.clubMembership,
      reraNumber: isRent ? null : toTextOrNull(amenities.reraNumber),
      openSides: toNumberOrNull(amenities.openSides),
    },
    pricing: isRent
      ? {
          monthlyRent: toNumberOrNull(pricingOthers.monthlyRent),
          noticePeriod: toNumberOrNull(pricingOthers.noticePeriod),
          depositAmount: toNumberOrNull(pricingOthers.depositAmount),
          maintenanceCharges: toNumberOrNull(pricingOthers.maintenanceCharges),
          benefitsRemarks: toTextOrNull(pricingOthers.benefitsRemarks),
        }
      : {
          expectedPrice: toNumberOrNull(pricingOthers.expectedPrice),
          priceInclusion: pricingOthers.priceInclusion,
          priceNegotiable: pricingOthers.priceNegotiable,
          transferFee: toNumberOrNull(pricingOthers.transferFee),
          bookingAmount: toNumberOrNull(pricingOthers.bookingAmount),
          maintenanceCharges: toNumberOrNull(pricingOthers.maintenanceCharges),
          benefitsRemarks: toTextOrNull(pricingOthers.benefitsRemarks),
        },
  };
}

// Files are appended in category order so mediaCategories lines up by index
function appendMediaFiles(formData: FormData, photosVideos: PhotosVideosValues): string[] {
  const mediaCategories: string[] = [];

  for (const category of PHOTO_CATEGORY_OPTIONS) {
    for (const item of photosVideos.mediaByCategory[category.id]) {
      formData.append("media", item.file);
      mediaCategories.push(category.id);
    }
  }

  if (photosVideos.brochure) {
    formData.append("brochure", photosVideos.brochure.file);
  }

  return mediaCategories;
}

export function buildPropertyFormData(state: PostPropertyFormState): FormData {
  const formData = new FormData();
  const mediaCategories = appendMediaFiles(formData, state.photosVideos);

  formData.append("data", JSON.stringify({ ...buildPropertyData(state), mediaCategories }));
  return formData;
}

const slugify = (value: string) => value.trim().toLowerCase().replace(/\s+/g, "-");

function buildProjectData(
  project: ProjectDetailsValues,
  isRent: boolean,
  showBhk: boolean,
) {
  const sale = (value: number | string | null) => (isRent ? null : value);

  return {
    developerName: toTextOrNull(project.developerName),
    launchDate: toTextOrNull(project.launchDate),
    totalUnits: toNumberOrNull(project.totalUnits),
    totalBlocks: toNumberOrNull(project.totalBlocks),
    projectArea: toNumberOrNull(project.projectArea),
    openSpacePercent: toNumberOrNull(project.openSpacePercent),
    carpetAreaMax: toNumberOrNull(project.carpetAreaMax),
    superBuildUpMax: toNumberOrNull(project.superBuildUpMax),
    priceMin: sale(toNumberOrNull(project.priceMin)),
    priceMax: sale(toNumberOrNull(project.priceMax)),
    pricePerSqft: sale(toNumberOrNull(project.pricePerSqft)),
    paymentPlan: sale(project.paymentPlan ? slugify(project.paymentPlan) : null),
    videoLink: toTextOrNull(project.videoLink),
    configurations: project.configurations.map(({ unitType, bhk }) => ({
      unitType,
      bhk: showBhk ? bhk : "",
    })),
    availableSizes: project.availableSizes.map((row) => ({
      bhk: showBhk ? row.bhk : "",
      unitType: row.unitType,
      size: toNumberOrNull(row.size),
      price: toNumberOrNull(row.price),
    })),
    primeLocationHighlights: project.primeLocationHighlights.map(({ place, distance }) => ({
      place,
      distance,
    })),
    projectHighlights: project.projectHighlights.map(({ text }) => ({ text })),
    faqs: project.faqs.map(({ question, answer }) => ({ question, answer })),
  };
}

// Admin create: standard payload plus project details and floor plan files
export function buildAdminPropertyFormData(
  state: PostPropertyFormState,
  project: ProjectDetailsValues,
): FormData {
  const formData = new FormData();
  const mediaCategories = appendMediaFiles(formData, state.photosVideos);

  // Only rows with an image are sent; labels line up with files by index
  const floorPlans = project.floorPlans.filter((row) => row.file);
  floorPlans.forEach((row) => formData.append("floorPlans", row.file as File));

  formData.append(
    "data",
    JSON.stringify({
      ...buildPropertyData(state),
      mediaCategories,
      projectDetails: buildProjectData(
        project,
        isRentListing(state.listingType),
        getUnitTypeConfig(state.propertyType, state.propertySubType).showBhk,
      ),
      floorPlanLabels: floorPlans.map((row) => row.label.trim()),
      floorPlanPlanTypes: floorPlans.map((row) => row.planType),
    }),
  );
  return formData;
}

// JSON body for PUT /property/:id (media is sent separately)
export function buildPropertyUpdateData(state: PostPropertyFormState) {
  return buildPropertyData(state);
}

export function hasNewMedia(photosVideos: PhotosVideosValues): boolean {
  return getTotalMediaCount(photosVideos) > 0 || photosVideos.brochure !== null;
}

// FormData for POST /property/:id/media
export function buildMediaFormData(photosVideos: PhotosVideosValues): FormData {
  const formData = new FormData();
  const mediaCategories = appendMediaFiles(formData, photosVideos);

  formData.append("data", JSON.stringify({ mediaCategories }));
  return formData;
}
