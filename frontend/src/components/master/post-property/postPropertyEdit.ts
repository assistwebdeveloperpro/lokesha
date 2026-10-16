import { DEFAULT_STATE } from "@/data/indianStatesCities";
import type { PropertyDetail } from "@/services/property.service";
import {
  EMPTY_AMENITIES_EXTRA,
  EMPTY_PROPERTY_DETAILS_EXTRA,
  normalizePossessionDateForInput,
  type AddressLocationValues,
  type AmenitiesValues,
  type ListingTypeId,
  type PricingOthersValues,
  type PropertyDetailsValues,
  type PropertyTypeId,
} from "./postPropertyForm.shared";

export type EditFormState = {
  listingType: ListingTypeId;
  propertyType: PropertyTypeId;
  propertySubType: string[];
  addressLocation: AddressLocationValues;
  propertyDetails: PropertyDetailsValues;
  amenities: AmenitiesValues;
  pricingOthers: PricingOthersValues;
};

function toText(value: string | number | null | undefined): string {
  return value === null || value === undefined ? "" : String(value);
}

// 0 maps back to the "Ground Floor" label used by the floor chips
function toFloorLabel(value: number | null): string {
  if (value === null) {
    return "";
  }
  return value === 0 ? "Ground Floor" : String(value);
}

export function mapPropertyToFormState(property: PropertyDetail): EditFormState {
  const { address, details, amenities, pricing } = property;

  return {
    listingType: property.listingType as ListingTypeId,
    propertyType: property.propertyType as PropertyTypeId,
    propertySubType: property.propertySubType
      ? property.propertySubType.split(",")
      : [],
    addressLocation: {
      blockNo: toText(address.blockNo),
      flatNumber: toText(address.flatNumber),
      projectName: address.projectName,
      locality: address.locality,
      addressLine2: toText(address.addressLine2),
      landmark: toText(address.landmark),
      pinCode: address.pinCode,
      city: toText(address.city),
      state: (address.state || DEFAULT_STATE) as AddressLocationValues["state"],
      propertyDescription: address.propertyDescription,
    },
    propertyDetails: {
      carpetAreaNumber: toText(details.carpetArea),
      carpetAreaType: (details.carpetAreaUnit ?? "") as PropertyDetailsValues["carpetAreaType"],
      superBuildUpNumber: toText(details.superBuildUpArea),
      superBuildUpType: (details.superBuildUpUnit ?? "") as PropertyDetailsValues["superBuildUpType"],
      propertyTransaction: (details.propertyTransaction ?? "") as PropertyDetailsValues["propertyTransaction"],
      constructionStatus: (details.constructionStatus ?? "") as PropertyDetailsValues["constructionStatus"],
      possessionDate: normalizePossessionDateForInput(
        toText(details.possessionDate),
      ),
      ageOfConstruction: (details.ageOfConstruction ?? "") as PropertyDetailsValues["ageOfConstruction"],
      bedrooms: toText(details.bedrooms),
      balcony: toText(details.balconies),
      totalFloors: toText(details.totalFloors),
      floorNumber: toFloorLabel(details.floorNumber),
      bathrooms: toText(details.bathrooms),
      lift: toText(details.lift),
      fullHouse: details.fullHouse,
      sharingBasis: details.sharingBasis,
      availableFrom: normalizePossessionDateForInput(toText(details.availableFrom)),
      interiorModificationAllowed: details.interiorModificationAllowed,
      tenantPreferences: details.tenantPreferences,
      ...EMPTY_PROPERTY_DETAILS_EXTRA,
    },
    amenities: {
      status: (amenities.furnishingStatus ?? "") as AmenitiesValues["status"],
      furnishing: amenities.furnishing,
      amenities: amenities.amenities,
      facing: (amenities.facing ?? "") as AmenitiesValues["facing"],
      carParkingAvailable: amenities.carParkingAvailable,
      carParking: toText(amenities.carParking),
      clubMembership: amenities.clubMembership,
      reraNumber: toText(amenities.reraNumber),
      openSides: toText(amenities.openSides),
      ...EMPTY_AMENITIES_EXTRA,
    },
    pricingOthers: {
      expectedPrice: toText(pricing.expectedPrice),
      priceInclusion: pricing.priceInclusion as PricingOthersValues["priceInclusion"],
      priceNegotiable: pricing.priceNegotiable,
      transferFee: toText(pricing.transferFee),
      bookingAmount: toText(pricing.bookingAmount),
      maintenanceCharges: toText(pricing.maintenanceCharges),
      benefitsRemarks: toText(pricing.benefitsRemarks),
      monthlyRent: toText(pricing.monthlyRent),
      noticePeriod: toText(pricing.noticePeriod),
      depositAmount: toText(pricing.depositAmount),
      assuredReturn: "",
      yearlyIncrement: "",
      leaseAmount: "",
    },
  };
}
