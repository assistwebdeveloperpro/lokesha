import {
  Building,
  Building2,
  CarFront,
  Columns2,
  Factory,
  GraduationCap,
  Home,
  Hotel,
  Landmark,
  LucideIcon,
  LandPlotIcon,
  Map,
  Briefcase,
  Snowflake,
  User,
  Sprout,
  Store,
  TreePine,
  Users,
  Warehouse,
  Wheat,
} from "lucide-react";
import type { StaticImageData } from "next/image";
import type { IndianState } from "@/data/indianStatesCities";
import carParkingInclusionImage from "../../../../public/assets/images/price_inclusion/car-parking.svg";
import clubMembershipInclusionImage from "../../../../public/assets/images/price_inclusion/club_membership.svg";
import plcInclusionImage from "../../../../public/assets/images/price_inclusion/plc.svg";
import commercialImage from "../../../../public/assets/images/property_type/commercial.svg";
import landImage from "../../../../public/assets/images/property_type/land.svg";
import pgImage from "../../../../public/assets/images/property_type/pg.svg";
import plotImage from "../../../../public/assets/images/property_type/plot.svg";
import residentialImage from "../../../../public/assets/images/property_type/residential.svg";
import { parseAmountNumber } from "./postPropertyAmount";
import {
  getFormConfig,
  getSaleFormConfig,
  type SaleDetailsConfig,
} from "./postPropertySaleConfig";

export const FORM_STEPS = [
  { id: 1, label: "Basic Details" },
  { id: 2, label: "Property Details" },
  { id: 3, label: "Amenities" },
  { id: 4, label: "Photos & Videos" },
  { id: 5, label: "Pricing & Others" },
] as const;

export const LISTING_TYPES = [
  { id: "sale", label: "Sale" },
  { id: "rent-lease", label: "Rent/ Lease" },
] as const;

export const PROPERTY_TYPES = [
  { id: "residential", label: "Residential", image: residentialImage },
  { id: "commercial", label: "Commercial", image: commercialImage },
  { id: "pg-co-living", label: "PG/Co-Living", image: pgImage },
  { id: "plot", label: "Plot", image: plotImage },
  { id: "land", label: "Land", image: landImage },
] as const;

export type ListingTypeId = (typeof LISTING_TYPES)[number]["id"];
export type PropertyTypeId = (typeof PROPERTY_TYPES)[number]["id"];

export type PropertySubTypeOption = {
  id: string;
  label: string;
  icon: LucideIcon;
};

export const RESIDENTIAL_SUB_TYPES: PropertySubTypeOption[] = [
  { id: "flat-apartment", label: "Flat/Apartment", icon: Building2 },
  { id: "bungalow-villa", label: "Bungalow/Villa", icon: Home },
  { id: "studio-apartment", label: "Studio Apartment", icon: Building },
  { id: "weekend-homes", label: "Weekend Homes", icon: TreePine },
  { id: "farm-house", label: "Farm House", icon: Wheat },
  { id: "residential-land", label: "Residential Land", icon: Building },
  { id: "penthouse", label: "Penthouse", icon: Landmark },
  { id: "duplex", label: "Duplex", icon: Columns2 },
];

export const COMMERCIAL_SUB_TYPES: PropertySubTypeOption[] = [
  { id: "shop", label: "Shop", icon: Store },
  { id: "office", label: "Office", icon: Building2 },
  { id: "showroom", label: "Showroom", icon: CarFront },
  { id: "cold-storage", label: "Cold Storage", icon: Snowflake },
  { id: "industrial-shed", label: "Industrial Shed", icon: Factory },
  { id: "guest-house", label: "Guest House", icon: Home },
  { id: "hotel-resort", label: "Hotel/Resort", icon: Hotel },
  { id: "warehouse-godown", label: "Warehouse/Godown", icon: Warehouse },
  {
    id: "co-working-space",
    label: "Co-working Space/Business Centre",
    icon: Users,
  },
];

export const PLOT_SUB_TYPES: PropertySubTypeOption[] = [
  { id: "residential-plot", label: "Residential Plot", icon: Home },
  { id: "industrial-plot", label: "Industrial Plot", icon: Factory },
  { id: "commercial-plot", label: "Commercial Plot", icon: Store },
];

export const LAND_SUB_TYPES: PropertySubTypeOption[] = [
  { id: "agriculture-land", label: "Agriculture Land", icon: Sprout },
  { id: "non-agriculture-land", label: "Non-Agriculture Land", icon: Map },
  { id: "commercial-land", label: "Commercial Land", icon: LandPlotIcon },
  { id: "residential-land", label: "Residential Land", icon: Home },
  { id: "industrial-land", label: "Industrial Land", icon: Factory },
];

export const SUB_TYPES_BY_PROPERTY_TYPE: Partial<
  Record<PropertyTypeId, PropertySubTypeOption[]>
> = {
  residential: RESIDENTIAL_SUB_TYPES,
  commercial: COMMERCIAL_SUB_TYPES,
  plot: PLOT_SUB_TYPES,
  land: LAND_SUB_TYPES,
};

export const AREA_TYPE_OPTIONS = [
  { value: "sq-ft", label: "sq ft" },
  { value: "sq-km", label: "sq km" },
  { value: "sq-m", label: "sq m" },
  { value: "sq-yd", label: "sq yd" },
] as const;

export const LAND_AREA_TYPE_OPTIONS = [
  ...AREA_TYPE_OPTIONS,
  { value: "acres", label: "Acres" },
  { value: "guntha", label: "Guntha" },
  { value: "bigha", label: "Bigha" },
] as const;

export const PENTHOUSE_TYPE_OPTIONS = ["Duplex", "Parallel"];
export const TERRACE_ENTRY_OPTIONS = ["Drawing", "Kitchen", "Bedroom", "Passage"];

export const PROPERTY_TRANSACTION_OPTIONS = [
  { id: "new", label: "New" },
  { id: "resale", label: "Resale" },
] as const;

export const CONSTRUCTION_STATUS_OPTIONS = [
  { id: "pre-launch", label: "Pre-launch" },
  { id: "under-construction", label: "Under Construction" },
  { id: "ready-to-move", label: "Ready to move" },
] as const;

export const AGE_OF_CONSTRUCTION_OPTIONS = [
  { id: "lt-1", label: "<1" },
  { id: "1-to-2", label: "1 to 2" },
  { id: "2-to-3", label: "2 to 3" },
  { id: "3-to-5", label: "3 to 5" },
  { id: "gt-5", label: ">5" },
] as const;

export const TENANT_PREFERENCE_OPTIONS = [
  { id: "family", label: "Family", icon: Home },
  { id: "bachelor", label: "Bachelor", icon: User },
  { id: "student", label: "Student", icon: GraduationCap },
  { id: "professional", label: "Professional", icon: Briefcase },
] as const;

export function numberOptions(start: number, end: number): string[] {
  return Array.from({ length: end - start + 1 }, (_, index) =>
    String(start + index),
  );
}

export const MANAGED_BY_OPTIONS = ["Landlord", "Professional", "Care Taker"];
export const ROAD_FACING_OPTIONS = ["Main Road", "Side Road", "No Road"];
export const PG_PRESENT_IN_OPTIONS = ["Independent Building", "Society", "Flat"];
export const OCCUPANCY_OPTIONS = ["Single", "Double", "Triple", "Triple+"];
export const PG_GENDER_OPTIONS = ["Male", "Female", "Both"];

export const PG_TENANT_PREFERENCE_OPTIONS: ImageTileOption[] = [
  { id: "bachelor", label: "Bachelor", image: "/assets/images/tenant-preferences/bachelor.svg" },
  { id: "student", label: "Student", image: "/assets/images/tenant-preferences/student.svg" },
  { id: "professional", label: "Professional", image: "/assets/images/tenant-preferences/professional.svg" },
];

export const PG_RULE_OPTIONS: ImageTileOption[] = [
  { id: "only-veg", label: "Only veg", image: "/assets/images/pg-rules/only_veg.svg" },
  { id: "no-smoking", label: "No smoking", image: "/assets/images/pg-rules/no_smoking.svg" },
  { id: "no-alcohol", label: "No alcohol", image: "/assets/images/pg-rules/no_alcohol.svg" },
  {
    id: "cross-gender-not-allowed",
    label: "Cross gender not allowed",
    image: "/assets/images/pg-rules/cross_gender_not_allowed.svg",
  },
];

export const FOOD_OPTIONS: ImageTileOption[] = [
  { id: "breakfast", label: "Breakfast", image: "/assets/images/foods/breakfast.svg" },
  { id: "lunch", label: "Lunch", image: "/assets/images/foods/lunch.svg" },
  { id: "dinner", label: "Dinner", image: "/assets/images/foods/dinner.svg" },
  { id: "veg", label: "Veg", image: "/assets/images/foods/veg.svg" },
  { id: "non-veg", label: "Non Veg", image: "/assets/images/foods/non_veg.svg" },
  {
    id: "not-available",
    label: "Not Available",
    image: "/assets/images/foods/not_available.svg",
  },
];

export const BUSINESS_OPTIONS: ImageTileOption[] = [
  { id: "bank", label: "Bank", image: "/assets/images/businesses/bank.svg" },
  { id: "bank-atm", label: "Bank ATM", image: "/assets/images/businesses/bank_atm.svg" },
  { id: "business-house", label: "Business house", image: "/assets/images/businesses/business_house.svg" },
  { id: "business-mall", label: "Business mall", image: "/assets/images/businesses/business_mall.svg" },
  { id: "call-center", label: "Call Center", image: "/assets/images/businesses/call_centre.svg" },
  { id: "classes", label: "Classes", image: "/assets/images/businesses/classes.svg" },
  { id: "clinic", label: "Clinic", image: "/assets/images/businesses/clinic.svg" },
  { id: "factory", label: "Factory", image: "/assets/images/businesses/factory.svg" },
  { id: "gym", label: "GYM", image: "/assets/images/businesses/gym.svg" },
  { id: "hospital", label: "Hospital", image: "/assets/images/businesses/hospital.svg" },
  { id: "hotel", label: "Hotel", image: "/assets/images/businesses/hotel.svg" },
  { id: "medical-shop", label: "Medical Shop", image: "/assets/images/businesses/medical_shop.svg" },
  { id: "multiplex", label: "Multiplex", image: "/assets/images/businesses/multiplex.svg" },
  { id: "office", label: "Office", image: "/assets/images/businesses/office.svg" },
  { id: "parlor", label: "Parlor", image: "/assets/images/businesses/parlor.svg" },
  { id: "petrol-pump", label: "Petrol Pump", image: "/assets/images/businesses/petrol_pump.svg" },
  { id: "resort", label: "Resort", image: "/assets/images/businesses/resort.svg" },
  { id: "restaurant", label: "Restaurant", image: "/assets/images/businesses/restaurant.svg" },
  { id: "school", label: "School", image: "/assets/images/businesses/school.svg" },
  { id: "service-station", label: "Service station", image: "/assets/images/businesses/service_station.svg" },
  { id: "shop", label: "Shop", image: "/assets/images/businesses/shop.svg" },
  { id: "showroom", label: "Showroom", image: "/assets/images/businesses/showroom.svg" },
  { id: "store", label: "Store", image: "/assets/images/businesses/store.svg" },
];

export const ENTRY_TILL_OPTIONS = [
  { value: "", label: "Select time" },
  ...Array.from({ length: 48 }, (_, index) => {
    const hours24 = Math.floor(index / 2);
    const minutes = index % 2 === 0 ? "00" : "30";
    const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
    const label = `${String(hours12).padStart(2, "0")}:${minutes} ${hours24 < 12 ? "AM" : "PM"}`;
    return { value: label, label };
  }),
];

export const PG_OPERATION_YEAR_OPTIONS = [
  { value: "", label: "Select year" },
  ...Array.from({ length: 51 }, (_, index) => {
    const year = String(new Date().getFullYear() - index);
    return { value: year, label: year };
  }),
];

export const DEFAULT_RENT_AGE_OF_CONSTRUCTION: AgeOfConstructionId = "lt-1";

export function isRentListing(listingType: ListingTypeId): boolean {
  return listingType === "rent-lease";
}

export type AreaTypeId = (typeof LAND_AREA_TYPE_OPTIONS)[number]["value"];
export type PropertyTransactionId =
  (typeof PROPERTY_TRANSACTION_OPTIONS)[number]["id"];
export type ConstructionStatusId =
  (typeof CONSTRUCTION_STATUS_OPTIONS)[number]["id"];
export type AgeOfConstructionId =
  (typeof AGE_OF_CONSTRUCTION_OPTIONS)[number]["id"];

export function getStepFromSearchParam(step: string | null): number {
  const parsed = Number(step);
  if (Number.isInteger(parsed) && parsed >= 1 && parsed <= FORM_STEPS.length) {
    return parsed;
  }
  return 1;
}

export function getProgressForStep(step: number): number {
  if (FORM_STEPS.length <= 0) {
    return 0;
  }

  return Math.round((step / FORM_STEPS.length) * 100);
}

export function getStepperLineProgress(step: number): number {
  if (FORM_STEPS.length <= 1) {
    return step >= 1 ? 100 : 0;
  }

  const progress = ((step - 1) / (FORM_STEPS.length - 1)) * 100;
  return Math.min(100, Math.round(progress));
}

export const VISIBLE_FLOOR_NUMBER_COUNT = 7;

export function getFloorNumberOptions(totalFloors: string): string[] {
  const total = Number(totalFloors);
  if (!Number.isInteger(total) || total < 1) {
    return [];
  }

  return [
    "Ground Floor",
    ...Array.from({ length: total }, (_, index) => String(index + 1)),
  ];
}

export function getFloorNumberOptionGroups(totalFloors: string): {
  options: string[];
  moreOptions: string[];
} {
  const allOptions = getFloorNumberOptions(totalFloors);

  if (allOptions.length <= VISIBLE_FLOOR_NUMBER_COUNT) {
    return { options: allOptions, moreOptions: [] };
  }

  return {
    options: allOptions.slice(0, VISIBLE_FLOOR_NUMBER_COUNT),
    moreOptions: allOptions.slice(VISIBLE_FLOOR_NUMBER_COUNT),
  };
}

export type AddressLocationValues = {
  blockNo: string;
  flatNumber: string;
  projectName: string;
  locality: string;
  addressLine2: string;
  landmark: string;
  pinCode: string;
  city: string;
  state: IndianState | "";
  propertyDescription: string;
};

export type AddressLocationFieldErrors = Partial<
  Record<
    "projectName" | "locality" | "pinCode" | "propertyDescription",
    string
  >
>;

export function validateAddressLocation(
  values: AddressLocationValues,
): AddressLocationFieldErrors {
  const errors: AddressLocationFieldErrors = {};

  if (!values.projectName.trim()) {
    errors.projectName =
      "Please enter the name of society, building, or project name";
  }

  if (!values.locality.trim()) {
    errors.locality = "Please enter locality";
  }

  if (!values.pinCode.trim()) {
    errors.pinCode = "Please enter pin code";
  } else if (!/^\d{6}$/.test(values.pinCode.trim())) {
    errors.pinCode = "Pin code must be 6 digits";
  }

  if (!values.propertyDescription.trim()) {
    errors.propertyDescription = "Please enter property description";
  }

  return errors;
}

export function hasAddressLocationErrors(
  errors: AddressLocationFieldErrors,
): boolean {
  return Object.keys(errors).length > 0;
}

export function getTodayIsoDate(referenceDate: Date = new Date()): string {
  const year = referenceDate.getFullYear();
  const month = String(referenceDate.getMonth() + 1).padStart(2, "0");
  const day = String(referenceDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseIsoDateValue(value: string): string | null {
  const trimmed = value.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return trimmed;
}

export function normalizePossessionDateForInput(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  const fullDate = parseIsoDateValue(trimmed);
  if (fullDate) {
    return fullDate;
  }

  const monthMatch = /^(\d{4})-(\d{2})$/.exec(trimmed);
  if (monthMatch) {
    return `${monthMatch[1]}-${monthMatch[2]}-01`;
  }

  return trimmed;
}

function isAllowedPossessionDate(
  dateValue: string,
  referenceDate: Date = new Date(),
  allowedPastDate?: string,
): boolean {
  const parsed = parseIsoDateValue(dateValue);
  if (!parsed) {
    return false;
  }

  if (parsed >= getTodayIsoDate(referenceDate)) {
    return true;
  }

  const allowedPast = allowedPastDate
    ? parseIsoDateValue(allowedPastDate)
    : null;
  return Boolean(allowedPast && parsed === allowedPast);
}

export function getPossessionDateInputMin(currentValue: string): string {
  const today = getTodayIsoDate();
  const parsed = parseIsoDateValue(currentValue);
  if (parsed && parsed < today) {
    return parsed;
  }
  return today;
}

export type PropertyDetailsValues = {
  carpetAreaNumber: string;
  carpetAreaType: AreaTypeId | "";
  superBuildUpNumber: string;
  superBuildUpType: AreaTypeId | "";
  propertyTransaction: PropertyTransactionId | "";
  constructionStatus: ConstructionStatusId | "";
  possessionDate: string;
  ageOfConstruction: AgeOfConstructionId | "";
  bedrooms: string;
  balcony: string;
  totalFloors: string;
  floorNumber: string;
  bathrooms: string;
  lift: string;
  fullHouse: boolean;
  sharingBasis: boolean;
  availableFrom: string;
  interiorModificationAllowed: boolean;
  tenantPreferences: string[];
  cabins: string;
  entranceWidth: string;
  currentlyLeasedOut: boolean;
  leaseContractTill: string;
  plotLengthNumber: string;
  plotLengthType: AreaTypeId | "";
  plotBreadthNumber: string;
  plotBreadthType: AreaTypeId | "";
  roadWidth: string;
  anyConstruction: boolean;
  boundaryWallMade: boolean;
  cornerPlot: boolean;
  floorsAllowed: string;
  managedBy: string;
  pgOperationSince: string;
  pgPresentIn: string;
  pgName: string;
  occupancies: string[];
  pgGender: string;
  pgRules: string[];
  entryTill: string;
  foods: string[];
  plotAreaNumber: string;
  plotAreaType: AreaTypeId | "";
  terraceAreaNumber: string;
  terraceAreaType: AreaTypeId | "";
  penthouseType: string;
  terraceEntry: string[];
  leasedOutAnswered: boolean;
};

export const EMPTY_PROPERTY_DETAILS_EXTRA = {
  plotAreaNumber: "",
  plotAreaType: "",
  terraceAreaNumber: "",
  terraceAreaType: "",
  penthouseType: "",
  terraceEntry: [],
  leasedOutAnswered: false,
  cabins: "",
  entranceWidth: "",
  currentlyLeasedOut: false,
  leaseContractTill: "",
  plotLengthNumber: "",
  plotLengthType: "",
  plotBreadthNumber: "",
  plotBreadthType: "",
  roadWidth: "",
  anyConstruction: false,
  boundaryWallMade: false,
  cornerPlot: false,
  floorsAllowed: "",
  managedBy: "",
  pgOperationSince: "",
  pgPresentIn: "",
  pgName: "",
  occupancies: [],
  pgGender: "",
  pgRules: [],
  entryTill: "",
  foods: [],
} satisfies Partial<PropertyDetailsValues>;

export type PropertyDetailsFieldErrors = Partial<
  Record<
    | "pgName"
    | "occupancies"
    | "pgGender"
    | "leaseContractTill"
    | "currentlyLeasedOut"
    | "plotAreaNumber"
    | "plotAreaType"
    | "terraceAreaNumber"
    | "terraceAreaType"
    | "penthouseType"
    | "floorsAllowed"
    | "carpetAreaNumber"
    | "carpetAreaType"
    | "superBuildUpNumber"
    | "superBuildUpType"
    | "availableFrom"
    | "tenantPreferences"
    | "propertyTransaction"
    | "constructionStatus"
    | "ageOfConstruction"
    | "possessionDate"
    | "bedrooms"
    | "balcony"
    | "totalFloors"
    | "floorNumber"
    | "bathrooms",
    string
  >
>;

type PropertyDetailsValidationOptions = {
  listingType?: ListingTypeId;
  propertyType?: PropertyTypeId;
  subType?: string;
  possessionDatePastAnchor?: string;
  availableFromPastAnchor?: string;
};

function validateCarpetArea(
  values: PropertyDetailsValues,
  errors: PropertyDetailsFieldErrors,
) {
  if (!values.carpetAreaNumber.trim()) {
    errors.carpetAreaNumber = "Please enter carpet area";
  } else {
    const carpetArea = Number(values.carpetAreaNumber);
    if (!Number.isFinite(carpetArea) || carpetArea <= 0) {
      errors.carpetAreaNumber = "Please enter a valid carpet area";
    }
  }

  if (!values.carpetAreaType) {
    errors.carpetAreaType = "Please select carpet area type";
  }
}

function validateSuperBuildUp(
  values: PropertyDetailsValues,
  errors: PropertyDetailsFieldErrors,
) {
  if (!values.superBuildUpNumber.trim()) {
    errors.superBuildUpNumber = "Please enter super built-up area";
  } else {
    const superBuildUp = Number(values.superBuildUpNumber);
    if (!Number.isFinite(superBuildUp) || superBuildUp <= 0) {
      errors.superBuildUpNumber = "Please enter a valid super built-up area";
    }
  }

  if (!values.superBuildUpType) {
    errors.superBuildUpType = "Please select super build up type";
  }
}

function validateAvailableFrom(
  values: PropertyDetailsValues,
  errors: PropertyDetailsFieldErrors,
  required: boolean,
  pastAnchor?: string,
) {
  if (!values.availableFrom.trim()) {
    if (required) {
      errors.availableFrom = "Please select available from date";
    }
  } else if (
    !isAllowedPossessionDate(values.availableFrom, new Date(), pastAnchor)
  ) {
    errors.availableFrom = "Available from date cannot be in the past";
  }
}

export function getCurrentMonthValue(referenceDate: Date = new Date()): string {
  return getTodayIsoDate(referenceDate).slice(0, 7);
}

function validateLeaseContract(
  values: PropertyDetailsValues,
  errors: PropertyDetailsFieldErrors,
  required: boolean,
) {
  if (required && values.currentlyLeasedOut && !values.leaseContractTill) {
    errors.leaseContractTill = "Please select lease contract till month and year";
  }
}

function validateSaleLeaseContract(
  values: PropertyDetailsValues,
  errors: PropertyDetailsFieldErrors,
  cfg: SaleDetailsConfig,
) {
  if (cfg.leasedOut === "hidden") {
    return;
  }

  if (cfg.leasedOut === "must-answer" && !values.leasedOutAnswered) {
    errors.currentlyLeasedOut = "Please select if the property is currently leased out";
  }

  if (!values.currentlyLeasedOut) {
    return;
  }

  if (!values.leaseContractTill) {
    if (cfg.leaseContractRequired) {
      errors.leaseContractTill = "Please select lease contract till month and year";
    }
  } else if (values.leaseContractTill < getCurrentMonthValue()) {
    errors.leaseContractTill = "Lease contract date cannot be in the past";
  }
}

function validateLevel(
  level: SaleDetailsConfig["bedrooms"],
  value: string,
  errors: PropertyDetailsFieldErrors,
  key: "bedrooms" | "balcony" | "bathrooms" | "floorsAllowed",
  message: string,
) {
  if (level === "required" && !value) {
    errors[key] = message;
  }
}

function validateAreaPair(
  numberValue: string,
  typeValue: string,
  errors: PropertyDetailsFieldErrors,
  keys: { number: "carpetAreaNumber" | "plotAreaNumber" | "terraceAreaNumber"; type: "carpetAreaType" | "plotAreaType" | "terraceAreaType" },
  label: string,
) {
  if (!numberValue.trim()) {
    errors[keys.number] = `Please enter ${label}`;
  } else if (!Number.isFinite(Number(numberValue)) || Number(numberValue) <= 0) {
    errors[keys.number] = `Please enter a valid ${label}`;
  }

  if (!typeValue) {
    errors[keys.type] = `Please select ${label} type`;
  }
}

function validateSaleDetails(
  values: PropertyDetailsValues,
  cfg: SaleDetailsConfig,
  options?: PropertyDetailsValidationOptions,
): PropertyDetailsFieldErrors {
  const errors: PropertyDetailsFieldErrors = {};

  if (cfg.area === "standard") {
    validateCarpetArea(values, errors);
    validateSuperBuildUp(values, errors);
    if (cfg.plotArea === "required") {
      validateAreaPair(values.plotAreaNumber, values.plotAreaType, errors, { number: "plotAreaNumber", type: "plotAreaType" }, "plot area");
    }
    if (cfg.terraceArea) {
      validateAreaPair(values.terraceAreaNumber, values.terraceAreaType, errors, { number: "terraceAreaNumber", type: "terraceAreaType" }, "terrace area");
    }
  } else if (cfg.plotArea === "required") {
    validateAreaPair(values.carpetAreaNumber, values.carpetAreaType, errors, { number: "carpetAreaNumber", type: "carpetAreaType" }, "plot area");
  }

  if (cfg.transaction === "full") {
    validateSaleTransaction(values, errors, options);
  } else if (cfg.transaction === "chips" && cfg.transactionRequired && !values.propertyTransaction) {
    errors.propertyTransaction = "Please select property transaction";
  }

  if (cfg.constructionAlways) {
    if (!values.constructionStatus) {
      errors.constructionStatus = "Please select construction status";
    }
    if (!values.possessionDate.trim()) {
      errors.possessionDate = "Please select possession date";
    } else if (
      !isAllowedPossessionDate(
        values.possessionDate,
        new Date(),
        options?.possessionDatePastAnchor,
      )
    ) {
      errors.possessionDate = "Possession date cannot be in the past";
    }
    if (!values.ageOfConstruction) {
      errors.ageOfConstruction = "Please select age of construction";
    }
  }

  validateLevel(cfg.bedrooms, values.bedrooms, errors, "bedrooms", "Please select number of bedrooms");
  validateLevel(cfg.balcony, values.balcony, errors, "balcony", "Please select number of balconies");
  validateLevel(cfg.bathrooms, values.bathrooms, errors, "bathrooms", "Please select number of bathrooms");
  validateLevel(cfg.floorsAllowed, values.floorsAllowed, errors, "floorsAllowed", "Please select floors allowed for construction");

  if (cfg.totalFloors) {
    if (!values.totalFloors) {
      errors.totalFloors = "Please select total floors";
    } else if (cfg.floorNumber && !values.floorNumber) {
      errors.floorNumber = "Please select floor number";
    }
  }

  if (cfg.penthouse && !values.penthouseType) {
    errors.penthouseType = "Please select type of penthouse";
  }

  if (cfg.ageOfConstruction && !values.ageOfConstruction) {
    errors.ageOfConstruction = "Please select age of construction";
  }

  if (cfg.rentalSection && values.tenantPreferences.length === 0) {
    errors.tenantPreferences = "Please select at least one tenant preference";
  }

  if (cfg.entrance || cfg.availableFrom !== "hidden") {
    validateAvailableFrom(
      values,
      errors,
      cfg.availableFrom === "required",
      options?.availableFromPastAnchor,
    );
  }

  validateSaleLeaseContract(values, errors, cfg);

  return errors;
}

function validateTotalFloors(
  values: PropertyDetailsValues,
  errors: PropertyDetailsFieldErrors,
) {
  if (!values.totalFloors) {
    errors.totalFloors = "Please select total floors";
  } else if (!values.floorNumber) {
    errors.floorNumber = "Please select floor number";
  }
}

function validateSaleTransaction(
  values: PropertyDetailsValues,
  errors: PropertyDetailsFieldErrors,
  options?: PropertyDetailsValidationOptions,
) {
  if (!values.propertyTransaction) {
    errors.propertyTransaction = "Please select property transaction";
  }

  if (values.propertyTransaction === "new") {
    if (!values.constructionStatus) {
      errors.constructionStatus = "Please select construction status";
    }

    if (!values.possessionDate.trim()) {
      errors.possessionDate = "Please select possession date";
    } else if (
      !isAllowedPossessionDate(
        values.possessionDate,
        new Date(),
        options?.possessionDatePastAnchor,
      )
    ) {
      errors.possessionDate = "Possession date cannot be in the past";
    }
  }

  if (values.propertyTransaction === "resale" && !values.ageOfConstruction) {
    errors.ageOfConstruction = "Please select age of construction";
  }
}

function validateCommercialDetails(
  values: PropertyDetailsValues,
  options?: PropertyDetailsValidationOptions,
): PropertyDetailsFieldErrors {
  const errors: PropertyDetailsFieldErrors = {};

  validateCarpetArea(values, errors);
  validateSuperBuildUp(values, errors);

  if (options?.listingType === "rent-lease") {
    if (!values.ageOfConstruction) {
      errors.ageOfConstruction = "Please select age of construction";
    }
  } else {
    validateSaleTransaction(values, errors, options);
  }

  validateTotalFloors(values, errors);
  validateAvailableFrom(values, errors, false, options?.availableFromPastAnchor);
  validateLeaseContract(values, errors, true);

  return errors;
}

function validatePgDetails(
  values: PropertyDetailsValues,
  options?: PropertyDetailsValidationOptions,
): PropertyDetailsFieldErrors {
  const errors: PropertyDetailsFieldErrors = {};

  if (!values.bedrooms) {
    errors.bedrooms = "Please select number of bedrooms";
  }

  if (!values.balcony) {
    errors.balcony = "Please select number of balconies";
  }

  validateTotalFloors(values, errors);

  if (!values.bathrooms) {
    errors.bathrooms = "Please select number of bathrooms";
  }

  if (!values.ageOfConstruction) {
    errors.ageOfConstruction = "Please select age of construction";
  }

  validateAvailableFrom(values, errors, true, options?.availableFromPastAnchor);

  if (values.tenantPreferences.length === 0) {
    errors.tenantPreferences = "Please select at least one tenant preference";
  }

  if (!values.pgName.trim()) {
    errors.pgName = "Please enter name of PG";
  }

  if (values.occupancies.length === 0) {
    errors.occupancies = "Please select at least one occupancy";
  }

  if (!values.pgGender) {
    errors.pgGender = "Please select gender";
  }

  return errors;
}

function validatePlotDetails(
  values: PropertyDetailsValues,
  options?: PropertyDetailsValidationOptions,
): PropertyDetailsFieldErrors {
  const errors: PropertyDetailsFieldErrors = {};

  if (!values.carpetAreaNumber.trim()) {
    errors.carpetAreaNumber = "Please enter plot area";
  } else if (Number(values.carpetAreaNumber) <= 0) {
    errors.carpetAreaNumber = "Please enter a valid plot area";
  }

  if (!values.carpetAreaType) {
    errors.carpetAreaType = "Please select plot area type";
  }

  validateAvailableFrom(values, errors, true, options?.availableFromPastAnchor);

  if (!values.propertyTransaction) {
    errors.propertyTransaction = "Please select property transaction";
  }

  return errors;
}

function validateLandDetails(
  values: PropertyDetailsValues,
  options?: PropertyDetailsValidationOptions,
): PropertyDetailsFieldErrors {
  const errors: PropertyDetailsFieldErrors = {};

  validateAvailableFrom(values, errors, false, options?.availableFromPastAnchor);

  return errors;
}

export function validatePropertyDetails(
  values: PropertyDetailsValues,
  options?: PropertyDetailsValidationOptions,
): PropertyDetailsFieldErrors {
  const saleConfig = getFormConfig(
    options?.listingType,
    options?.propertyType,
    options?.subType,
  );
  if (saleConfig) {
    return validateSaleDetails(values, saleConfig.details, options);
  }

  switch (options?.propertyType) {
    case "commercial":
      return validateCommercialDetails(values, options);
    case "pg-co-living":
      return validatePgDetails(values, options);
    case "plot":
      return validatePlotDetails(values, options);
    case "land":
      return validateLandDetails(values, options);
    default:
      return validateResidentialDetails(values, options);
  }
}

function validateResidentialDetails(
  values: PropertyDetailsValues,
  options?: PropertyDetailsValidationOptions,
): PropertyDetailsFieldErrors {
  const errors: PropertyDetailsFieldErrors = {};
  const isRent = options?.listingType === "rent-lease";

  if (!values.carpetAreaNumber.trim()) {
    errors.carpetAreaNumber = "Please enter carpet area";
  } else {
    const carpetArea = Number(values.carpetAreaNumber);
    if (!Number.isFinite(carpetArea) || carpetArea <= 0) {
      errors.carpetAreaNumber = "Please enter a valid carpet area";
    }
  }

  if (!values.carpetAreaType) {
    errors.carpetAreaType = "Please select carpet area type";
  }

  validateSuperBuildUp(values, errors);

  if (isRent) {
    if (!values.ageOfConstruction) {
      errors.ageOfConstruction = "Please select age of construction";
    }

    if (!values.availableFrom.trim()) {
      errors.availableFrom = "Please select available from date";
    } else if (
      !isAllowedPossessionDate(
        values.availableFrom,
        new Date(),
        options?.availableFromPastAnchor,
      )
    ) {
      errors.availableFrom = "Available from date cannot be in the past";
    }

    if (values.tenantPreferences.length === 0) {
      errors.tenantPreferences = "Please select at least one tenant preference";
    }
  } else if (!values.propertyTransaction) {
    errors.propertyTransaction = "Please select property transaction";
  }

  if (!isRent && values.propertyTransaction === "new") {
    if (!values.constructionStatus) {
      errors.constructionStatus = "Please select construction status";
    }

    if (!values.possessionDate.trim()) {
      errors.possessionDate = "Please select possession date";
    } else if (
      !isAllowedPossessionDate(
        values.possessionDate,
        new Date(),
        options?.possessionDatePastAnchor,
      )
    ) {
      errors.possessionDate = "Possession date cannot be in the past";
    }
  }

  if (!isRent && values.propertyTransaction === "resale") {
    if (!values.ageOfConstruction) {
      errors.ageOfConstruction = "Please select age of construction";
    }
  }

  if (!values.bedrooms) {
    errors.bedrooms = "Please select number of bedrooms";
  }

  if (!values.balcony) {
    errors.balcony = "Please select number of balconies";
  }

  if (!values.totalFloors) {
    errors.totalFloors = "Please select total floors";
  } else if (!values.floorNumber) {
    errors.floorNumber = "Please select floor number";
  }

  if (!values.bathrooms) {
    errors.bathrooms = "Please select number of bathrooms";
  }

  return errors;
}

export function hasPropertyDetailsErrors(
  errors: PropertyDetailsFieldErrors,
): boolean {
  return Object.keys(errors).length > 0;
}

export type ImageTileOption = {
  id: string;
  label: string;
  image: StaticImageData | string;
};

export const FURNISHING_STATUS_OPTIONS = [
  { id: "furnished", label: "Furnished" },
  { id: "semi-furnished", label: "Semi Furnished" },
  { id: "unfurnished", label: "Unfurnished" },
] as const;

export type FurnishingStatusId =
  (typeof FURNISHING_STATUS_OPTIONS)[number]["id"];

export const FACING_OPTIONS = [
  "East",
  "North",
  "North - East",
  "North - West",
  "South",
  "South - East",
  "South - West",
  "West",
] as const;

export type FacingOption = (typeof FACING_OPTIONS)[number];

export const VISIBLE_ICON_TILE_COUNT = 5;

export function showsFurnishingField(status: FurnishingStatusId | ""): boolean {
  return status === "furnished" || status === "semi-furnished";
}

export type AmenitiesValues = {
  status: FurnishingStatusId | "";
  furnishing: string[];
  amenities: string[];
  facing: FacingOption | "";
  carParkingAvailable: boolean;
  carParking: string;
  clubMembership: boolean;
  reraNumber: string;
  openSides: string;
  washrooms: string;
  roadFacing: string;
  businessTypes: string[];
  pantry: boolean;
  cafeteria: boolean;
  cornerShop: boolean;
};

export const EMPTY_AMENITIES_EXTRA = {
  washrooms: "",
  roadFacing: "",
  businessTypes: [],
  pantry: false,
  cafeteria: false,
  cornerShop: false,
} satisfies Partial<AmenitiesValues>;

export type AmenitiesFieldErrors = Partial<
  Record<
    "status" | "furnishing" | "amenities" | "carParking" | "washrooms" | "facing",
    string
  >
>;

export function validateAmenities(
  values: AmenitiesValues,
  propertyType?: PropertyTypeId,
  context?: { listingType?: ListingTypeId; subType?: string },
): AmenitiesFieldErrors {
  const errors: AmenitiesFieldErrors = {};
  const saleConfig = getFormConfig(
    context?.listingType,
    propertyType,
    context?.subType,
  );

  if (saleConfig) {
    const cfg = saleConfig.amenities;

    if (cfg.washrooms === "required" && !values.washrooms) {
      errors.washrooms = "Please select number of washrooms";
    }

    if (cfg.status) {
      if (!values.status) {
        errors.status = "Please select furnishing status";
      } else if (
        showsFurnishingField(values.status) &&
        values.furnishing.length === 0
      ) {
        errors.furnishing = "Please select at least one furnishing item";
      }
    }

    if (cfg.amenities === "required" && values.amenities.length === 0) {
      errors.amenities = "Please select at least one amenity";
    }

    if (cfg.facing === "required" && !values.facing) {
      errors.facing = "Please select facing";
    }

    if (cfg.carParking && values.carParkingAvailable && !values.carParking) {
      errors.carParking = "Please select number of car parkings";
    }

    return errors;
  }

  if (propertyType === "land") {
    return errors;
  }

  if (propertyType === "plot") {
    if (!values.facing) {
      errors.facing = "Please select facing";
    }
    return errors;
  }

  if (propertyType === "pg-co-living") {
    if (!values.status) {
      errors.status = "Please select furnishing status";
    } else if (
      showsFurnishingField(values.status) &&
      values.furnishing.length === 0
    ) {
      errors.furnishing = "Please select at least one furnishing item";
    }

    if (values.carParkingAvailable && !values.carParking) {
      errors.carParking = "Please select number of car parkings";
    }
    return errors;
  }

  if (propertyType === "commercial" && !values.washrooms) {
    errors.washrooms = "Please select number of washrooms";
  }

  if (!values.status) {
    errors.status = "Please select furnishing status";
  } else if (showsFurnishingField(values.status) && values.furnishing.length === 0) {
    errors.furnishing = "Please select at least one furnishing item";
  }

  if (values.amenities.length === 0) {
    errors.amenities = "Please select at least one amenity";
  }

  if (values.carParkingAvailable && !values.carParking) {
    errors.carParking = "Please select number of car parkings";
  }

  return errors;
}

export function hasAmenitiesErrors(errors: AmenitiesFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

export const PHOTO_CATEGORY_OPTIONS = [
  { id: "bedrooms", label: "Bedrooms" },
  { id: "bathrooms", label: "Bathrooms" },
  { id: "terrace", label: "Terrace" },
  { id: "kitchen", label: "Kitchen" },
  { id: "exterior", label: "Exterior" },
  { id: "main-photo", label: "Main Photo" },
  { id: "living-room", label: "Living Room" },
  { id: "floor-plan", label: "Floor Plan" },
  { id: "master-plan", label: "Master Plan" },
  { id: "pooja-room", label: "Pooja Room" },
  { id: "others", label: "Others" },
  { id: "balcony", label: "Balcony" },
  { id: "washroom", label: "Washroom" },
  { id: "common-area", label: "Common Area" },
  { id: "amenities", label: "Amenities" },
  { id: "brochure-images", label: "Brochure Images" },
  { id: "cluster-plan", label: "Cluster Plan" },
  { id: "elevation", label: "Elevation" },
] as const;

export type PhotoCategoryId = (typeof PHOTO_CATEGORY_OPTIONS)[number]["id"];

const COMMERCIAL_PHOTO_CATEGORY_IDS: PhotoCategoryId[] = [
  "washroom",
  "exterior",
  "main-photo",
  "floor-plan",
  "master-plan",
  "others",
  "common-area",
];

const LIMITED_PHOTO_CATEGORY_IDS: PhotoCategoryId[] = [
  "exterior",
  "master-plan",
  "main-photo",
  "others",
];

// Main photo is always the first category
export function getPhotoCategories(
  propertyType: PropertyTypeId,
  context?: { listingType?: ListingTypeId; subType?: string },
) {
  const categories = getBasePhotoCategories(propertyType, context);
  const main = categories.filter((category) => category.id === "main-photo");
  return [
    ...main,
    ...categories.filter((category) => category.id !== "main-photo"),
  ];
}

function getBasePhotoCategories(
  propertyType: PropertyTypeId,
  context?: { listingType?: ListingTypeId; subType?: string },
) {
  const saleConfig = getFormConfig(
    context?.listingType,
    propertyType,
    context?.subType,
  );
  if (saleConfig?.photos.categoryIds) {
    return saleConfig.photos.categoryIds.map(
      (id) => PHOTO_CATEGORY_OPTIONS.find((category) => category.id === id)!,
    );
  }

  const ids =
    propertyType === "commercial"
      ? COMMERCIAL_PHOTO_CATEGORY_IDS
      : propertyType === "residential"
        ? null
        : LIMITED_PHOTO_CATEGORY_IDS;

  return ids
    ? ids.map(
        (id) => PHOTO_CATEGORY_OPTIONS.find((category) => category.id === id)!,
      )
    : PHOTO_CATEGORY_OPTIONS;
}

export function arePhotosRequired(
  propertyType: PropertyTypeId,
  context?: { listingType?: ListingTypeId; subType?: string },
): boolean {
  const saleConfig = getFormConfig(
    context?.listingType,
    propertyType,
    context?.subType,
  );
  if (saleConfig) {
    return saleConfig.photos.required;
  }

  return propertyType === "residential";
}

export const MAX_PROPERTY_MEDIA_COUNT = 50;
export const MAX_PROPERTY_MEDIA_SIZE_BYTES = 50 * 1024 * 1024;
export const MAX_BROCHURE_SIZE_BYTES = 100 * 1024 * 1024;
export const ACCEPTED_MEDIA_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/heic",
  "video/mp4",
];
export const ACCEPTED_MEDIA_EXTENSIONS = ".jpg,.jpeg,.heic,.png,.mp4";
export const ACCEPTED_BROCHURE_TYPES = ["application/pdf"];
export const ACCEPTED_BROCHURE_EXTENSIONS = ".pdf";
export const MIN_PHOTOS_FOR_WARNING = 5;

export type PropertyMediaFile = {
  id: string;
  previewUrl: string;
  file: File;
  type: "image" | "video";
};

export type PhotosVideosValues = {
  mediaByCategory: Record<PhotoCategoryId, PropertyMediaFile[]>;
  brochure: PropertyMediaFile | null;
};

export function createEmptyPhotosVideosValues(): PhotosVideosValues {
  const mediaByCategory = PHOTO_CATEGORY_OPTIONS.reduce(
    (accumulator, category) => {
      accumulator[category.id] = [];
      return accumulator;
    },
    {} as Record<PhotoCategoryId, PropertyMediaFile[]>,
  );

  return {
    mediaByCategory,
    brochure: null,
  };
}

export function createPropertyMediaFromFile(file: File): PropertyMediaFile {
  return {
    id: `media-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    previewUrl: URL.createObjectURL(file),
    file,
    type: file.type.startsWith("video/") ? "video" : "image",
  };
}

export function getTotalMediaCount(values: PhotosVideosValues): number {
  return PHOTO_CATEGORY_OPTIONS.reduce(
    (total, category) => total + values.mediaByCategory[category.id].length,
    0,
  );
}

export const PRICE_INCLUSION_OPTIONS: ImageTileOption[] = [
  {
    id: "car-parking",
    label: "Car Parking",
    image: carParkingInclusionImage,
  },
  {
    id: "club-membership",
    label: "Club Membership",
    image: clubMembershipInclusionImage,
  },
  {
    id: "plc",
    label: "PLC (Preferential Location Charges)",
    image: plcInclusionImage,
  },
];

export type PricingOthersValues = {
  expectedPrice: string;
  priceInclusion: string[];
  priceNegotiable: boolean;
  transferFee: string;
  bookingAmount: string;
  maintenanceCharges: string;
  benefitsRemarks: string;
  monthlyRent: string;
  noticePeriod: string;
  depositAmount: string;
  assuredReturn: string;
  yearlyIncrement: string;
  leaseAmount: string;
};

export type PricingOthersFieldErrors = Partial<
  Record<
    | "expectedPrice"
    | "bookingAmount"
    | "monthlyRent"
    | "noticePeriod"
    | "depositAmount",
    string
  >
>;

export const MAX_NOTICE_PERIOD_MONTHS = 60;

function validateRentPricing(
  values: PricingOthersValues,
): PricingOthersFieldErrors {
  const errors: PricingOthersFieldErrors = {};

  if (!values.monthlyRent.trim()) {
    errors.monthlyRent = "Please enter monthly rent";
  } else if (parseAmountNumber(values.monthlyRent) < 0) {
    errors.monthlyRent = "Please enter a valid monthly rent";
  }

  const noticePeriod = Number(values.noticePeriod);
  if (!values.noticePeriod.trim()) {
    errors.noticePeriod = "Please enter notice period";
  } else if (
    !Number.isInteger(noticePeriod) ||
    noticePeriod < 0 ||
    noticePeriod > MAX_NOTICE_PERIOD_MONTHS
  ) {
    errors.noticePeriod = `Notice period must be between 0 and ${MAX_NOTICE_PERIOD_MONTHS} months`;
  }

  if (!values.depositAmount.trim()) {
    errors.depositAmount = "Please enter deposit amount";
  } else if (parseAmountNumber(values.depositAmount) < 0) {
    errors.depositAmount = "Please enter a valid deposit amount";
  }

  return errors;
}

export function validatePricingOthers(
  values: PricingOthersValues,
  listingType?: ListingTypeId,
  propertyType?: PropertyTypeId,
  subType?: string,
): PricingOthersFieldErrors {
  const saleConfig = getSaleFormConfig(listingType, propertyType, subType);
  if (saleConfig) {
    const errors: PricingOthersFieldErrors = {};

    if (!values.expectedPrice.trim()) {
      errors.expectedPrice = "Please enter expected price";
    } else if (parseAmountNumber(values.expectedPrice) < 0) {
      errors.expectedPrice = "Please enter a valid expected price";
    }

    if (saleConfig.pricing.bookingAmount === "required") {
      if (!values.bookingAmount.trim()) {
        errors.bookingAmount = "Please enter booking amount";
      } else if (parseAmountNumber(values.bookingAmount) < 0) {
        errors.bookingAmount = "Please enter a valid booking amount";
      }
    }

    return errors;
  }

  if (propertyType === "pg-co-living") {
    return validateRentPricing(values);
  }

  if (propertyType === "plot") {
    const errors: PricingOthersFieldErrors = {};

    if (!values.monthlyRent.trim()) {
      errors.monthlyRent = "Please enter monthly rent";
    }

    if (!values.depositAmount.trim()) {
      errors.depositAmount = "Please enter deposit amount";
    }

    return errors;
  }

  if (listingType === "rent-lease" && propertyType !== "land") {
    return validateRentPricing(values);
  }

  const errors: PricingOthersFieldErrors = {};

  if (!values.expectedPrice.trim()) {
    errors.expectedPrice = "Please enter expected price";
  } else if (parseAmountNumber(values.expectedPrice) < 0) {
    errors.expectedPrice = "Please enter a valid expected price";
  }

  if (!values.bookingAmount.trim()) {
    errors.bookingAmount = "Please enter booking amount";
  } else if (parseAmountNumber(values.bookingAmount) < 0) {
    errors.bookingAmount = "Please enter a valid booking amount";
  }

  return errors;
}

export function hasPricingOthersErrors(
  errors: PricingOthersFieldErrors,
): boolean {
  return Object.keys(errors).length > 0;
}
