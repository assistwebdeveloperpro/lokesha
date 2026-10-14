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
import acImage from "../../../../public/assets/images/furnishing/ac.svg";
import bedsImage from "../../../../public/assets/images/furnishing/beds.svg";
import diningTableImage from "../../../../public/assets/images/furnishing/dining_table.svg";
import electricFittingsImage from "../../../../public/assets/images/furnishing/electric_fittings.svg";
import fanImage from "../../../../public/assets/images/furnishing/fan.svg";
import fridgeImage from "../../../../public/assets/images/furnishing/fridge.svg";
import gasCylinderImage from "../../../../public/assets/images/furnishing/gas_cylinder.svg";
import gasPipelineImage from "../../../../public/assets/images/furnishing/gas_pipeline.svg";
import geyserImage from "../../../../public/assets/images/furnishing/gyser.svg";
import microwaveImage from "../../../../public/assets/images/furnishing/microwave_oven.svg";
import sofaImage from "../../../../public/assets/images/furnishing/sofa.svg";
import stoveImage from "../../../../public/assets/images/furnishing/stove.svg";
import tvImage from "../../../../public/assets/images/furnishing/tv.svg";
import wardrobesImage from "../../../../public/assets/images/furnishing/wardrobes.svg";
import washingMachineImage from "../../../../public/assets/images/furnishing/washing_machine.svg";
import waterPurifierImage from "../../../../public/assets/images/furnishing/water_purifier.svg";
import wifiImage from "../../../../public/assets/images/furnishing/wifi.svg";
import basketBallCourtImage from "../../../../public/assets/images/amenities/basket_ball_court.svg";
import cctvImage from "../../../../public/assets/images/amenities/cctv.svg";
import clubHouseImage from "../../../../public/assets/images/amenities/club_house.svg";
import communityHallImage from "../../../../public/assets/images/amenities/community_hall.svg";
import cricketPitchImage from "../../../../public/assets/images/amenities/cricket_pitch.svg";
import gardenParkImage from "../../../../public/assets/images/amenities/garden_park.svg";
import gatedCommunityImage from "../../../../public/assets/images/amenities/gated_community.svg";
import gazeboImage from "../../../../public/assets/images/amenities/gazebo.svg";
import generatorImage from "../../../../public/assets/images/amenities/generator.svg";
import gymImage from "../../../../public/assets/images/amenities/gym.svg";
import indoorGamesImage from "../../../../public/assets/images/amenities/indoor_games.svg";
import intercomImage from "../../../../public/assets/images/amenities/intercom.svg";
import kidsPlayAreaImage from "../../../../public/assets/images/amenities/kids_play_area.svg";
import liftImage from "../../../../public/assets/images/amenities/lift.svg";
import miniTheatreImage from "../../../../public/assets/images/amenities/mini_theatre.svg";
import noVehicleZoneImage from "../../../../public/assets/images/amenities/no_vehicle_zone.svg";
import petAllowedImage from "../../../../public/assets/images/amenities/pet_allowed.svg";
import pipedGasImage from "../../../../public/assets/images/amenities/piped_gas.svg";
import powerBackupImage from "../../../../public/assets/images/amenities/power_backup.svg";
import regularWaterSupplyImage from "../../../../public/assets/images/amenities/regular_water_supply.svg";
import reservedParkingImage from "../../../../public/assets/images/amenities/reserved_parking.svg";
import scattingImage from "../../../../public/assets/images/amenities/scatting.svg";
import securityImage from "../../../../public/assets/images/amenities/security.svg";
import solarRoofImage from "../../../../public/assets/images/amenities/solar_roof.svg";
import sportsClubImage from "../../../../public/assets/images/amenities/sports_club.svg";
import swimmingPoolImage from "../../../../public/assets/images/amenities/swimming_pool.svg";
import vaastuCompliantImage from "../../../../public/assets/images/amenities/vaastu_compliant.svg";
import carParkingInclusionImage from "../../../../public/assets/images/price_inclusion/car-parking.svg";
import clubMembershipInclusionImage from "../../../../public/assets/images/price_inclusion/club_membership.svg";
import plcInclusionImage from "../../../../public/assets/images/price_inclusion/plc.svg";
import commercialImage from "../../../../public/assets/images/property_type/commercial.svg";
import landImage from "../../../../public/assets/images/property_type/land.svg";
import pgImage from "../../../../public/assets/images/property_type/pg.svg";
import plotImage from "../../../../public/assets/images/property_type/plot.svg";
import residentialImage from "../../../../public/assets/images/property_type/residential.svg";
import { parseAmountNumber } from "./postPropertyAmount";

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

export const DEFAULT_RENT_AGE_OF_CONSTRUCTION: AgeOfConstructionId = "lt-1";

export function isRentListing(listingType: ListingTypeId): boolean {
  return listingType === "rent-lease";
}

export type AreaTypeId = (typeof AREA_TYPE_OPTIONS)[number]["value"];
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
};

export type PropertyDetailsFieldErrors = Partial<
  Record<
    | "carpetAreaNumber"
    | "carpetAreaType"
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

export function validatePropertyDetails(
  values: PropertyDetailsValues,
  options?: {
    listingType?: ListingTypeId;
    possessionDatePastAnchor?: string;
    availableFromPastAnchor?: string;
  },
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

  if (!values.superBuildUpType) {
    errors.superBuildUpType = "Please select super build up type";
  }

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

export const FURNISHING_OPTIONS: ImageTileOption[] = [
  { id: "dining-table", label: "Dining Table", image: diningTableImage },
  { id: "tv", label: "TV", image: tvImage },
  { id: "sofa", label: "SOFA", image: sofaImage },
  { id: "washing-machine", label: "Washing Machine", image: washingMachineImage },
  { id: "microwave", label: "Microwave/Oven", image: microwaveImage },
  { id: "stove", label: "Stove", image: stoveImage },
  { id: "gas-cylinder", label: "Gas Cylinder", image: gasCylinderImage },
  { id: "fridge", label: "Fridge", image: fridgeImage },
  { id: "water-purifier", label: "Water Purifier", image: waterPurifierImage },
  { id: "gas-pipeline", label: "Gas Pipeline", image: gasPipelineImage },
  { id: "ac", label: "AC", image: acImage },
  { id: "beds", label: "Beds", image: bedsImage },
  { id: "geyser", label: "Geyser", image: geyserImage },
  { id: "electric-fittings", label: "Electric Fittings", image: electricFittingsImage },
  { id: "fan", label: "Fan", image: fanImage },
  { id: "wifi", label: "Wifi", image: wifiImage },
  { id: "wardrobes", label: "Wardrobes", image: wardrobesImage },
];

export const AMENITY_OPTIONS: ImageTileOption[] = [
  { id: "lift", label: "Lift", image: liftImage },
  { id: "cctv", label: "CCTV", image: cctvImage },
  { id: "gym", label: "GYM", image: gymImage },
  { id: "garden-park", label: "Garden/Park", image: gardenParkImage },
  { id: "kids-play-area", label: "Kids Play Area", image: kidsPlayAreaImage },
  { id: "sports-club", label: "Sports Club", image: sportsClubImage },
  { id: "cricket-pitch", label: "Cricket Pitch", image: cricketPitchImage },
  { id: "basketball-court", label: "Basket Ball court", image: basketBallCourtImage },
  { id: "skating", label: "Skating", image: scattingImage },
  { id: "swimming-pool", label: "Swimming Pool", image: swimmingPoolImage },
  { id: "intercom", label: "Intercom", image: intercomImage },
  { id: "gated-community", label: "Gated Community", image: gatedCommunityImage },
  { id: "security", label: "Security", image: securityImage },
  { id: "club-house", label: "Club House", image: clubHouseImage },
  { id: "community-hall", label: "Community Hall", image: communityHallImage },
  {
    id: "regular-water-supply",
    label: "Regular Water Supply",
    image: regularWaterSupplyImage,
  },
  { id: "generator", label: "Generator", image: generatorImage },
  { id: "indoor-games", label: "Indoor Games", image: indoorGamesImage },
  { id: "power-backup", label: "Power Backup", image: powerBackupImage },
  { id: "pet-allowed", label: "Pet Allowed", image: petAllowedImage },
  { id: "no-vehicle-zone", label: "No Vehicle Zone", image: noVehicleZoneImage },
  { id: "gazebo", label: "Gazebo", image: gazeboImage },
  { id: "reserved-parking", label: "Reserved Parking", image: reservedParkingImage },
  { id: "piped-gas", label: "Piped Gas", image: pipedGasImage },
  { id: "vaastu-compliant", label: "Vaastu Compliant", image: vaastuCompliantImage },
  { id: "mini-theatre", label: "Mini Theatre", image: miniTheatreImage },
  { id: "solar-roof", label: "Solar Roof", image: solarRoofImage },
];

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
};

export type AmenitiesFieldErrors = Partial<
  Record<"status" | "furnishing" | "amenities" | "carParking", string>
>;

export function validateAmenities(
  values: AmenitiesValues,
): AmenitiesFieldErrors {
  const errors: AmenitiesFieldErrors = {};

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
] as const;

export type PhotoCategoryId = (typeof PHOTO_CATEGORY_OPTIONS)[number]["id"];

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
): PricingOthersFieldErrors {
  if (listingType === "rent-lease") {
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
