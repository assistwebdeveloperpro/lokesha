import {
  PHOTO_CATEGORY_OPTIONS,
  showsFurnishingField,
  type AddressLocationValues,
  type AmenitiesValues,
  type ListingTypeId,
  type PhotosVideosValues,
  type PricingOthersValues,
  type PropertyDetailsValues,
  type PropertyTypeId,
} from "./postPropertyForm.shared";

type PostPropertyFormState = {
  listingType: ListingTypeId;
  propertyType: PropertyTypeId;
  propertySubType: string;
  addressLocation: AddressLocationValues;
  propertyDetails: PropertyDetailsValues;
  amenities: AmenitiesValues;
  photosVideos: PhotosVideosValues;
  pricingOthers: PricingOthersValues;
};

function toNumberOrNull(value: string): number | null {
  const trimmed = value.trim();
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

export function buildPropertyFormData(state: PostPropertyFormState): FormData {
  const { addressLocation, propertyDetails, amenities, pricingOthers } = state;
  const hasSuperBuildUp = toNumberOrNull(propertyDetails.superBuildUpNumber) !== null;
  const hasFurnishing = showsFurnishingField(amenities.status);

  const formData = new FormData();
  const mediaCategories: string[] = [];

  // Files are appended in category order so mediaCategories lines up by index
  for (const category of PHOTO_CATEGORY_OPTIONS) {
    for (const item of state.photosVideos.mediaByCategory[category.id]) {
      formData.append("media", item.file);
      mediaCategories.push(category.id);
    }
  }

  if (state.photosVideos.brochure) {
    formData.append("brochure", state.photosVideos.brochure.file);
  }

  const data = {
    listingType: state.listingType,
    propertyType: state.propertyType,
    propertySubType: state.propertySubType || null,
    address: {
      blockNo: toTextOrNull(addressLocation.blockNo),
      flatNumber: toTextOrNull(addressLocation.flatNumber),
      societyName: addressLocation.societyName.trim(),
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
      superBuildUpUnit: hasSuperBuildUp ? propertyDetails.superBuildUpType || null : null,
      propertyTransaction: propertyDetails.propertyTransaction || null,
      constructionStatus: propertyDetails.constructionStatus || null,
      possessionDate: propertyDetails.possessionDate || null,
      ageOfConstruction: propertyDetails.ageOfConstruction || null,
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
      clubMembership: amenities.clubMembership,
      reraNumber: toTextOrNull(amenities.reraNumber),
      openSides: toNumberOrNull(amenities.openSides),
    },
    pricing: {
      expectedPrice: toNumberOrNull(pricingOthers.expectedPrice),
      priceInclusion: pricingOthers.priceInclusion,
      priceNegotiable: pricingOthers.priceNegotiable,
      transferFee: toNumberOrNull(pricingOthers.transferFee),
      bookingAmount: toNumberOrNull(pricingOthers.bookingAmount),
      maintenanceCharges: toNumberOrNull(pricingOthers.maintenanceCharges),
      benefitsRemarks: toTextOrNull(pricingOthers.benefitsRemarks),
    },
    mediaCategories,
  };

  formData.append("data", JSON.stringify(data));
  return formData;
}
