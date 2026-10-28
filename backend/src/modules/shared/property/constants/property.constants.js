const path = require("path");

const LISTING_TYPES = ["sale", "rent-lease"];
const LISTED_BY = ["buyer_owner_tenant", "agent", "builder", "lokesha_staff", "admin"];
const STATUSES = ["draft", "pending", "published", "rejected", "closed"];
const BUILDER_POSTING_ROLES = ["builder", "lokesha_staff"];

// The form sends pg-co-living, the database stores pg
const PROPERTY_TYPE_TO_DB = {
  residential: "residential",
  commercial: "commercial",
  "pg-co-living": "pg",
  plot: "plot",
  land: "land",
};
const PROPERTY_TYPES = Object.keys(PROPERTY_TYPE_TO_DB);
const DEFAULT_PG_SUB_TYPE = "pg";

const FACING = [
  "east",
  "west",
  "north",
  "south",
  "north-east",
  "north-west",
  "south-east",
  "south-west",
];
const CONSTRUCTION_STATUS = ["pre-launch", "under-construction", "ready-to-move"];
const FURNISHING_STATUS = ["unfurnished", "semi-furnished", "furnished"];
const AGE_OF_CONSTRUCTION = ["lt-1", "1-to-2", "2-to-3", "3-to-5", "gt-5"];
const PROPERTY_TRANSACTION = ["new", "resale"];
const MANAGED_BY = ["landlord", "professional", "care-taker"];
const ROAD_FACING = ["main-road", "side-road", "no-road"];
const FOOD_CHARGE_TYPE = ["inclusive", "extra"];
const PENTHOUSE_TYPE = ["duplex", "parallel"];
const PG_GENDER = ["male", "female", "both"];
const PG_PRESENT_IN = ["independent-building", "society", "flat"];
const PROJECT_TYPE = ["new-launch", "under-construction", "ready", "completed"];
const PAYMENT_PLAN = [
  "construction-linked",
  "down-payment",
  "flexi-payment",
  "possession-linked",
];
const CONVERSION_STATUS = ["converted", "not-converted", "in-process"];
const HIGHLIGHT_KINDS = ["project-highlight", "prime-location"];

const STANDARD_AREA_UNITS = ["sq-ft", "sq-m", "sq-yd", "sq-km"];
const LAND_AREA_UNITS = [...STANDARD_AREA_UNITS, "acres", "guntha", "bigha"];

const SQFT_PER_UNIT = {
  "sq-ft": 1,
  "sq-m": 10.7639,
  "sq-yd": 9,
  "sq-km": 10763910.4,
  acres: 43560,
  guntha: 1089,
  bigha: 27225,
};

const OPTION_GROUPS = {
  tenantPreference: "tenant_preference",
  food: "food",
  pgRule: "pg_rule",
  occupancy: "occupancy",
  businessType: "business_type",
  terraceEntry: "terrace_entry",
  infrastructure: "infrastructure",
  irrigationSource: "irrigation_source",
};
const AMENITY_KINDS = ["amenities", "furnishing"];

const MEDIA_CATEGORIES = [
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
  "washroom",
  "common-area",
  "amenities",
  "brochure-images",
  "cluster-plan",
  "elevation",
  "construction-progress",
  "brochure",
];
const FLOOR_PLAN_TYPES = ["2d", "3d"];

const FILE_KINDS = ["media", "floor-plan", "brochure"];
// Server generated names: <kind>-<uuid>.<ext>
const FILE_NAME_PATTERN = /^(media|floor-plan|brochure)-[0-9a-f-]{36}\.[a-z0-9]{2,5}$/;

const MB = 1024 * 1024;
const LIMITS = {
  maxDraftsPerUser: 20,
  maxFormDataBytes: MB,
  maxDraftFolderBytes: 500 * MB,
  maxMediaPerDraft: 50,
  maxMediaBytes: 50 * MB,
  maxBrochureBytes: 100 * MB,
  maxFloorPlanBytes: 20 * MB,
  draftMaxAgeDays: 90,
  maxListingsPerSubmission: 10,
  titleMaxLength: 150,
};

const CLEANUP = {
  intervalMs: 24 * 60 * 60 * 1000,
  // A folder can briefly outlive its draft row while a draft is completed
  orphanGraceMs: 60 * 60 * 1000,
  batchSize: 500,
};

const IMAGE_MIME_TYPES = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
  "image/tiff": ".tiff",
  "image/bmp": ".bmp",
  "image/heic": ".heic",
  "image/heif": ".heif",
};

const UPLOAD_MIME_TYPES = {
  media: {
    ...IMAGE_MIME_TYPES,
    "video/mp4": ".mp4",
  },
  "floor-plan": {
    ...IMAGE_MIME_TYPES,
    "application/pdf": ".pdf",
  },
  brochure: {
    "application/pdf": ".pdf",
  },
};

const BACKEND_ROOT = path.resolve(__dirname, "../../../../..");
const STORAGE = {
  tempDraftsDir: path.join(BACKEND_ROOT, "storage", "temp", "drafts"),
  propertiesDir: path.join(BACKEND_ROOT, "uploads", "properties"),
  publicPrefix: "/uploads/properties",
};

// from -> allowed targets; the actor rules live in the service
const STATUS_TRANSITIONS = {
  draft: ["pending"],
  pending: ["published", "rejected"],
  published: ["closed", "pending"],
  rejected: ["pending"],
  closed: ["published", "pending"],
};


const POSTING_AS_ROLES = ["lokesha_staff", "admin"];

const ADMIN_STATUS_TRANSITIONS = {
  draft: ["published"],
  published: ["closed"],
  closed: ["published"],
};

const DEFAULT_RULE = {
  typeTable: "residential",
  plotDetails: false,
  penthouse: false,
  hospitality: false,
  bedrooms: "required",
  floorNumber: true,
  plotArea: "hidden",
  selections: [],
  listingTypes: LISTING_TYPES,
};

const rule = (overrides) => ({ ...DEFAULT_RULE, ...overrides });

const RESIDENTIAL_SELECTIONS = [OPTION_GROUPS.tenantPreference];
const VILLA_RULE = rule({
  plotDetails: true,
  plotArea: "required",
  floorNumber: false,
  selections: RESIDENTIAL_SELECTIONS,
});

const COMMERCIAL_BASE = {
  typeTable: "commercial",
  bedrooms: "forbidden",
  selections: [OPTION_GROUPS.businessType],
};
const SHOP_RULE = rule(COMMERCIAL_BASE);
const STORAGE_RULE = rule({
  ...COMMERCIAL_BASE,
  plotDetails: true,
  plotArea: "optional",
  floorNumber: false,
  selections: [],
});
const HOSPITALITY_RULE = rule({
  typeTable: "commercial",
  hospitality: true,
  plotDetails: true,
  plotArea: "optional",
  bedrooms: "optional",
  floorNumber: false,
});
const PLOT_RULE = rule({
  typeTable: "plot",
  plotDetails: true,
  plotArea: "required",
  bedrooms: "forbidden",
  floorNumber: false,
  selections: [OPTION_GROUPS.infrastructure],
});
const LAND_RULE = rule({
  typeTable: "land",
  plotDetails: true,
  plotArea: "optional",
  bedrooms: "forbidden",
  floorNumber: false,
  selections: [OPTION_GROUPS.infrastructure],
});

// RULES[propertyType][subType]; keys are the form ids
const RULES = {
  residential: {
    "flat-apartment": rule({ selections: RESIDENTIAL_SELECTIONS }),
    duplex: rule({ selections: RESIDENTIAL_SELECTIONS }),
    "studio-apartment": rule({ bedrooms: "forbidden", selections: RESIDENTIAL_SELECTIONS }),
    penthouse: rule({
      penthouse: true,
      selections: [...RESIDENTIAL_SELECTIONS, OPTION_GROUPS.terraceEntry],
    }),
    "bungalow-villa": VILLA_RULE,
    "weekend-homes": VILLA_RULE,
    "farm-house": VILLA_RULE,
    "residential-land": rule({
      plotDetails: true,
      plotArea: "required",
      bedrooms: "optional",
      floorNumber: false,
    }),
  },
  commercial: {
    shop: SHOP_RULE,
    office: SHOP_RULE,
    showroom: SHOP_RULE,
    "co-working-space": rule({ ...COMMERCIAL_BASE, selections: [] }),
    "cold-storage": STORAGE_RULE,
    "warehouse-godown": STORAGE_RULE,
    "industrial-shed": rule({
      ...COMMERCIAL_BASE,
      plotDetails: true,
      plotArea: "optional",
      floorNumber: false,
      selections: [],
    }),
    "guest-house": HOSPITALITY_RULE,
    "hotel-resort": HOSPITALITY_RULE,
  },
  "pg-co-living": {
    pg: rule({
      typeTable: "pg",
      bedrooms: "optional",
      selections: [
        OPTION_GROUPS.tenantPreference,
        OPTION_GROUPS.food,
        OPTION_GROUPS.pgRule,
        OPTION_GROUPS.occupancy,
      ],
      listingTypes: ["rent-lease"],
    }),
    hostel: rule({
      typeTable: "pg",
      bedrooms: "optional",
      selections: [
        OPTION_GROUPS.tenantPreference,
        OPTION_GROUPS.food,
        OPTION_GROUPS.pgRule,
        OPTION_GROUPS.occupancy,
      ],
      listingTypes: ["rent-lease"],
    }),
  },
  plot: {
    "residential-plot": PLOT_RULE,
    "industrial-plot": PLOT_RULE,
    "commercial-plot": PLOT_RULE,
  },
  land: {
    "agriculture-land": rule({
      ...LAND_RULE,
      selections: [OPTION_GROUPS.infrastructure, OPTION_GROUPS.irrigationSource],
    }),
    "non-agriculture-land": LAND_RULE,
    "commercial-land": LAND_RULE,
    "residential-land": LAND_RULE,
    "industrial-land": LAND_RULE,
  },
};

const getRule = (propertyType, subType) => RULES[propertyType]?.[subType] ?? null;

// Builder listings are sale only and never PG
const isBuilderAllowed = (propertyType, listingType) =>
  listingType === "sale" && propertyType !== "pg-co-living";

module.exports = {
  LISTING_TYPES,
  LISTED_BY,
  STATUSES,
  BUILDER_POSTING_ROLES,
  PROPERTY_TYPE_TO_DB,
  PROPERTY_TYPES,
  DEFAULT_PG_SUB_TYPE,
  FACING,
  CONSTRUCTION_STATUS,
  FURNISHING_STATUS,
  AGE_OF_CONSTRUCTION,
  PROPERTY_TRANSACTION,
  MANAGED_BY,
  ROAD_FACING,
  FOOD_CHARGE_TYPE,
  PENTHOUSE_TYPE,
  PG_GENDER,
  PG_PRESENT_IN,
  PROJECT_TYPE,
  PAYMENT_PLAN,
  CONVERSION_STATUS,
  HIGHLIGHT_KINDS,
  STANDARD_AREA_UNITS,
  LAND_AREA_UNITS,
  SQFT_PER_UNIT,
  OPTION_GROUPS,
  AMENITY_KINDS,
  MEDIA_CATEGORIES,
  FLOOR_PLAN_TYPES,
  FILE_KINDS,
  FILE_NAME_PATTERN,
  LIMITS,
  CLEANUP,
  UPLOAD_MIME_TYPES,
  STORAGE,
  STATUS_TRANSITIONS,
  ADMIN_STATUS_TRANSITIONS,
  POSTING_AS_ROLES,
  RULES,
  getRule,
  isBuilderAllowed,
};
