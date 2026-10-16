import type { ListingTypeId, PropertyTypeId } from "./postPropertyForm.shared";

export type Level = "hidden" | "optional" | "required";

export type SaleDetailsConfig = {
  area: "standard" | "plot-only";
  plotArea: Level;
  landUnits: boolean;
  terraceArea: boolean;
  roadWidth: "hidden" | "area" | "section";
  transaction: "hidden" | "full" | "chips";
  transactionRequired: boolean;
  constructionAlways: boolean;
  bedrooms: Level;
  balcony: Level;
  bathrooms: Level;
  lift: boolean;
  totalFloors: boolean;
  floorNumber: boolean;
  cabin: boolean;
  floorsAllowed: Level;
  entrance: boolean;
  availableFrom: Level;
  leasedOut: "hidden" | "checkbox" | "must-answer";
  leaseContractRequired: boolean;
  managedBy: boolean;
  plotChecks: boolean;
  penthouse: boolean;
  food: boolean;
};

export type SaleAmenitiesConfig = {
  status: boolean;
  furnishingSet: "residential" | "commercial" | "guest-house";
  amenities: Level;
  amenityIds: string[] | null;
  facing: Level;
  washrooms: Level;
  roadFacing: boolean;
  businessTypes: boolean;
  carParking: boolean;
  clubMembership: boolean;
  rera: boolean;
  openSides: boolean;
  pantry: boolean;
  cafeteria: boolean;
  cornerShop: boolean;
};

export type SalePhotosConfig = {
  categoryIds: string[] | null;
  required: boolean;
};

export type SalePricingConfig = {
  priceInclusion: boolean;
  bookingAmount: Level;
  assuredReturn: boolean;
  leaseAmount: boolean;
  yearlyIncrement: boolean;
};

export type SaleFormConfig = {
  details: SaleDetailsConfig;
  amenities: SaleAmenitiesConfig;
  photos: SalePhotosConfig;
  pricing: SalePricingConfig;
};

const RESIDENTIAL_PHOTO_IDS = [
  "bedrooms",
  "bathrooms",
  "terrace",
  "kitchen",
  "exterior",
  "main-photo",
  "living-room",
  "floor-plan",
  "master-plan",
  "pooja-room",
  "others",
  "balcony",
];

const COMMERCIAL_PHOTO_IDS = [
  "washroom",
  "exterior",
  "main-photo",
  "floor-plan",
  "master-plan",
  "others",
  "common-area",
];

const BASIC_COMMERCIAL_PHOTO_IDS = [
  "exterior",
  "main-photo",
  "floor-plan",
  "master-plan",
  "others",
];

const HOTEL_PHOTO_IDS = [
  "amenities",
  "exterior",
  "main-photo",
  "floor-plan",
  "master-plan",
  "others",
  "brochure-images",
  "cluster-plan",
  "elevation",
];

const PLOT_LAND_PHOTO_IDS = ["exterior", "master-plan", "main-photo", "others"];

const SHOP_AMENITY_IDS = [
  "lift",
  "cctv",
  "security",
  "regular-water-supply",
  "generator",
  "power-backup",
  "pet-allowed",
  "no-vehicle-zone",
  "reserved-parking",
  "vaastu-compliant",
  "wifi",
  "house-keeping",
  "fire-safety",
  "wheelchair-access",
];

const COLD_STORAGE_AMENITY_IDS = [
  "wifi",
  "house-keeping",
  "fire-safety",
  "wheelchair-access",
];

const GUEST_HOUSE_AMENITY_IDS = [
  "lift",
  "cctv",
  "intercom",
  "security",
  "regular-water-supply",
  "generator",
  "indoor-games",
  "power-backup",
  "pet-allowed",
  "no-vehicle-zone",
  "reserved-parking",
  "piped-gas",
  "vaastu-compliant",
  "solar-roof",
  "wifi",
  "house-keeping",
  "fire-safety",
  "wheelchair-access",
];

const HOTEL_AMENITY_IDS = [
  "lift",
  "cctv",
  "gym",
  "garden-park",
  "kids-play-area",
  "sports-club",
  "swimming-pool",
  "intercom",
  "security",
  "club-house",
  "community-hall",
  "regular-water-supply",
  "generator",
  "indoor-games",
  "power-backup",
  "pet-allowed",
  "no-vehicle-zone",
  "reserved-parking",
  "piped-gas",
  "vaastu-compliant",
  "mini-theatre",
  "solar-roof",
  "wifi",
  "house-keeping",
  "fire-safety",
  "wheelchair-access",
];

const PLOT_AMENITY_IDS = [
  "garden-park",
  "kids-play-area",
  "sports-club",
  "cricket-pitch",
  "basketball-court",
  "skating",
  "swimming-pool",
  "gated-community",
  "security",
  "club-house",
  "community-hall",
  "generator",
  "indoor-games",
  "power-backup",
  "vaastu-compliant",
];

const BASE_DETAILS: SaleDetailsConfig = {
  area: "standard",
  plotArea: "hidden",
  landUnits: false,
  terraceArea: false,
  roadWidth: "hidden",
  transaction: "full",
  transactionRequired: true,
  constructionAlways: false,
  bedrooms: "required",
  balcony: "required",
  bathrooms: "required",
  lift: true,
  totalFloors: true,
  floorNumber: true,
  cabin: false,
  floorsAllowed: "hidden",
  entrance: false,
  availableFrom: "hidden",
  leasedOut: "hidden",
  leaseContractRequired: true,
  managedBy: false,
  plotChecks: false,
  penthouse: false,
  food: false,
};

const BASE_AMENITIES: SaleAmenitiesConfig = {
  status: true,
  furnishingSet: "residential",
  amenities: "required",
  amenityIds: null,
  facing: "optional",
  washrooms: "hidden",
  roadFacing: false,
  businessTypes: false,
  carParking: true,
  clubMembership: true,
  rera: true,
  openSides: true,
  pantry: false,
  cafeteria: false,
  cornerShop: false,
};

const BASE_PRICING: SalePricingConfig = {
  priceInclusion: true,
  bookingAmount: "required",
  assuredReturn: false,
  leaseAmount: false,
  yearlyIncrement: false,
};

const BASE_PHOTOS: SalePhotosConfig = { categoryIds: null, required: true };

function build(
  details: Partial<SaleDetailsConfig>,
  amenities: Partial<SaleAmenitiesConfig>,
  photos: Partial<SalePhotosConfig>,
  pricing: Partial<SalePricingConfig>,
): SaleFormConfig {
  return {
    details: { ...BASE_DETAILS, ...details },
    amenities: { ...BASE_AMENITIES, ...amenities },
    photos: { ...BASE_PHOTOS, ...photos },
    pricing: { ...BASE_PRICING, ...pricing },
  };
}

const RESIDENTIAL_PHOTOS: Partial<SalePhotosConfig> = {
  categoryIds: RESIDENTIAL_PHOTO_IDS,
  required: false,
};

const BUNGALOW = build(
  {
    plotArea: "required",
    roadWidth: "section",
    floorNumber: false,
    floorsAllowed: "optional",
  },
  {},
  RESIDENTIAL_PHOTOS,
  {},
);

const STUDIO = build(
  { bedrooms: "hidden" },
  { clubMembership: false },
  RESIDENTIAL_PHOTOS,
  { priceInclusion: false },
);

const PENTHOUSE = build(
  { terraceArea: true, penthouse: true },
  {},
  RESIDENTIAL_PHOTOS,
  {},
);

const SHOP_DETAILS: Partial<SaleDetailsConfig> = {
  bedrooms: "hidden",
  balcony: "hidden",
  bathrooms: "hidden",
  lift: false,
  cabin: true,
  entrance: true,
  availableFrom: "optional",
  leasedOut: "checkbox",
};

const SHOP_AMENITIES: Partial<SaleAmenitiesConfig> = {
  furnishingSet: "commercial",
  amenityIds: SHOP_AMENITY_IDS,
  washrooms: "required",
  roadFacing: true,
  businessTypes: true,
  clubMembership: false,
  openSides: false,
  pantry: true,
  cornerShop: true,
};

const SHOP_PRICING: Partial<SalePricingConfig> = {
  priceInclusion: false,
  assuredReturn: true,
};

const SHOP_PHOTOS: Partial<SalePhotosConfig> = {
  categoryIds: COMMERCIAL_PHOTO_IDS,
  required: false,
};

const SHOP = build(SHOP_DETAILS, SHOP_AMENITIES, SHOP_PHOTOS, SHOP_PRICING);

const OFFICE = build(
  SHOP_DETAILS,
  {
    ...SHOP_AMENITIES,
    amenityIds: [...SHOP_AMENITY_IDS, "indoor-games"],
    roadFacing: false,
    cornerShop: false,
    cafeteria: true,
  },
  SHOP_PHOTOS,
  SHOP_PRICING,
);

const SHOWROOM = build(
  SHOP_DETAILS,
  { ...SHOP_AMENITIES, cafeteria: true },
  SHOP_PHOTOS,
  SHOP_PRICING,
);

const CO_WORKING = build(
  SHOP_DETAILS,
  {
    ...SHOP_AMENITIES,
    amenities: "hidden",
    businessTypes: false,
    openSides: true,
    cafeteria: true,
  },
  SHOP_PHOTOS,
  SHOP_PRICING,
);

const COLD_STORAGE_DETAILS: Partial<SaleDetailsConfig> = {
  plotArea: "optional",
  roadWidth: "section",
  transaction: "hidden",
  constructionAlways: true,
  bedrooms: "hidden",
  balcony: "hidden",
  bathrooms: "hidden",
  lift: false,
  floorsAllowed: "optional",
  availableFrom: "optional",
  leasedOut: "checkbox",
  managedBy: true,
};

const COLD_STORAGE_AMENITIES: Partial<SaleAmenitiesConfig> = {
  furnishingSet: "commercial",
  amenityIds: COLD_STORAGE_AMENITY_IDS,
  washrooms: "required",
  clubMembership: false,
  pantry: true,
};

const COLD_STORAGE = build(
  COLD_STORAGE_DETAILS,
  COLD_STORAGE_AMENITIES,
  SHOP_PHOTOS,
  {
    ...SHOP_PRICING,
    leaseAmount: true,
    yearlyIncrement: true,
  },
);

const WAREHOUSE = build(
  { ...COLD_STORAGE_DETAILS, cabin: true },
  {
    ...COLD_STORAGE_AMENITIES,
    amenityIds: SHOP_AMENITY_IDS,
    washrooms: "optional",
  },
  { categoryIds: BASIC_COMMERCIAL_PHOTO_IDS, required: false },
  SHOP_PRICING,
);

const INDUSTRIAL_SHED = build(
  {
    ...SHOP_DETAILS,
    plotArea: "optional",
    floorNumber: false,
  },
  {
    furnishingSet: "commercial",
    amenities: "hidden",
    washrooms: "optional",
    roadFacing: true,
    clubMembership: false,
    pantry: true,
    cafeteria: true,
    cornerShop: true,
  },
  { categoryIds: BASIC_COMMERCIAL_PHOTO_IDS, required: false },
  SHOP_PRICING,
);

const GUEST_HOUSE_DETAILS: Partial<SaleDetailsConfig> = {
  plotArea: "optional",
  bedrooms: "optional",
  balcony: "optional",
  bathrooms: "optional",
  lift: false,
  floorNumber: false,
  entrance: true,
  availableFrom: "optional",
  leasedOut: "checkbox",
  food: true,
};

const GUEST_HOUSE = build(
  GUEST_HOUSE_DETAILS,
  {
    furnishingSet: "guest-house",
    amenityIds: GUEST_HOUSE_AMENITY_IDS,
    roadFacing: true,
    pantry: true,
    cafeteria: true,
    cornerShop: true,
  },
  { categoryIds: BASIC_COMMERCIAL_PHOTO_IDS, required: false },
  SHOP_PRICING,
);

const HOTEL_RESORT = build(
  GUEST_HOUSE_DETAILS,
  {
    furnishingSet: "guest-house",
    amenityIds: HOTEL_AMENITY_IDS,
    roadFacing: true,
    cornerShop: true,
  },
  { categoryIds: HOTEL_PHOTO_IDS, required: false },
  SHOP_PRICING,
);

const PLOT_DETAILS: Partial<SaleDetailsConfig> = {
  area: "plot-only",
  plotArea: "required",
  roadWidth: "area",
  transaction: "chips",
  bedrooms: "hidden",
  balcony: "hidden",
  bathrooms: "hidden",
  lift: false,
  totalFloors: false,
  floorNumber: false,
  floorsAllowed: "required",
  entrance: true,
  availableFrom: "required",
  leasedOut: "checkbox",
  managedBy: true,
  plotChecks: true,
};

const PLOT_AMENITIES: Partial<SaleAmenitiesConfig> = {
  status: false,
  amenities: "optional",
  amenityIds: PLOT_AMENITY_IDS,
  facing: "required",
  roadFacing: true,
  carParking: false,
  openSides: true,
};

const PLOT_PRICING: Partial<SalePricingConfig> = { assuredReturn: true };

const PLOT_PHOTOS: Partial<SalePhotosConfig> = {
  categoryIds: PLOT_LAND_PHOTO_IDS,
  required: false,
};

const RESIDENTIAL_PLOT = build(
  PLOT_DETAILS,
  PLOT_AMENITIES,
  PLOT_PHOTOS,
  PLOT_PRICING,
);

const INDUSTRIAL_PLOT = build(
  { ...PLOT_DETAILS, leasedOut: "must-answer" },
  { ...PLOT_AMENITIES, amenities: "hidden" },
  PLOT_PHOTOS,
  PLOT_PRICING,
);

const LAND = build(
  {
    area: "plot-only",
    plotArea: "optional",
    landUnits: true,
    roadWidth: "section",
    transaction: "chips",
    transactionRequired: false,
    bedrooms: "hidden",
    balcony: "hidden",
    bathrooms: "hidden",
    lift: false,
    totalFloors: false,
    floorNumber: false,
    floorsAllowed: "optional",
    entrance: true,
    availableFrom: "optional",
    leasedOut: "checkbox",
    leaseContractRequired: false,
    managedBy: true,
    plotChecks: true,
  },
  {
    status: false,
    amenities: "hidden",
    roadFacing: true,
    carParking: false,
    clubMembership: false,
  },
  PLOT_PHOTOS,
  { priceInclusion: false, bookingAmount: "optional", assuredReturn: true },
);

const SALE_CONFIGS: Partial<
  Record<PropertyTypeId, Record<string, SaleFormConfig>>
> = {
  residential: {
    "bungalow-villa": BUNGALOW,
    "weekend-homes": BUNGALOW,
    "farm-house": BUNGALOW,
    "studio-apartment": STUDIO,
    penthouse: PENTHOUSE,
  },
  commercial: {
    shop: SHOP,
    office: OFFICE,
    showroom: SHOWROOM,
    "co-working-space": CO_WORKING,
    "cold-storage": COLD_STORAGE,
    "warehouse-godown": WAREHOUSE,
    "industrial-shed": INDUSTRIAL_SHED,
    "guest-house": GUEST_HOUSE,
    "hotel-resort": HOTEL_RESORT,
  },
  plot: {
    "residential-plot": RESIDENTIAL_PLOT,
    "industrial-plot": INDUSTRIAL_PLOT,
    "commercial-plot": INDUSTRIAL_PLOT,
  },
  land: {
    "agriculture-land": LAND,
    "non-agriculture-land": LAND,
    "commercial-land": LAND,
    "residential-land": LAND,
    "industrial-land": LAND,
  },
};

// Returns null for rent listings and sub types that keep the default form
export function getSaleFormConfig(
  listingType: ListingTypeId | undefined,
  propertyType: PropertyTypeId | undefined,
  subType: string | undefined,
): SaleFormConfig | null {
  if (listingType !== "sale" || !propertyType || !subType) {
    return null;
  }

  return SALE_CONFIGS[propertyType]?.[subType] ?? null;
}

// Admin panel can select many sub types; the config applies to a single one
export function resolveSubType(subType: string | string[] | undefined) {
  if (Array.isArray(subType)) {
    return subType.length === 1 ? subType[0] : undefined;
  }
  return subType;
}
