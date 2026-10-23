import { DEFAULT_STATE } from "@/data/indianStatesCities";
import {
  EMPTY_AMENITIES_EXTRA,
  EMPTY_PROPERTY_DETAILS_EXTRA,
  type AddressLocationValues,
  type AmenitiesValues,
  type PricingOthersValues,
  type PropertyDetailsValues,
} from "../config/postPropertyForm.shared";

export const INITIAL_ADDRESS_LOCATION: AddressLocationValues = {
  blockNo: "",
  flatNumber: "",
  projectName: "",
  locality: "",
  addressLine2: "",
  landmark: "",
  pinCode: "",
  city: "",
  state: DEFAULT_STATE,
  propertyDescription: "",
};

export const INITIAL_PROPERTY_DETAILS: PropertyDetailsValues = {
  carpetAreaNumber: "",
  carpetAreaType: "",
  superBuildUpNumber: "",
  superBuildUpType: "",
  propertyTransaction: "",
  constructionStatus: "",
  possessionDate: "",
  ageOfConstruction: "",
  bedrooms: "",
  balcony: "",
  basementFloors: "None",
  totalFloors: "",
  floorNumber: "",
  bathrooms: "",
  lift: "",
  fullHouse: false,
  sharingBasis: false,
  availableFrom: "",
  interiorModificationAllowed: false,
  tenantPreferences: [],
  ...EMPTY_PROPERTY_DETAILS_EXTRA,
};

export const INITIAL_PRICING_OTHERS: PricingOthersValues = {
  monthlyRent: "",
  noticePeriod: "",
  depositAmount: "",
  expectedPrice: "",
  priceInclusion: [],
  priceNegotiable: false,
  transferFee: "",
  bookingAmount: "",
  maintenanceCharges: "",
  benefitsRemarks: "",
  assuredReturn: "",
  yearlyIncrement: "",
  leaseAmount: "",
};

export const INITIAL_AMENITIES: AmenitiesValues = {
  status: "",
  furnishing: [],
  amenities: [],
  facing: "",
  carParkingAvailable: false,
  carParking: "",
  clubMembership: false,
  reraNumber: "",
  openSides: "",
  ...EMPTY_AMENITIES_EXTRA,
};
