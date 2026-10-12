const LISTING_TYPES = ["sale", "rent-lease", "pg-hostel"];
const PROPERTY_TYPES = ["residential", "commercial", "pg-co-living", "plot", "land"];

const SUB_TYPES_BY_PROPERTY_TYPE = {
  residential: [
    "flat-apartment",
    "bungalow-villa",
    "studio-apartment",
    "weekend-homes",
    "farm-house",
    "residential-land",
    "penthouse",
    "duplex",
  ],
  commercial: [
    "shop",
    "office",
    "showroom",
    "cold-storage",
    "industrial-shed",
    "guest-house",
    "hotel-resort",
    "warehouse-godown",
    "co-working-space",
  ],
  "pg-co-living": [],
  plot: ["residential-plot", "industrial-plot", "commercial-plot"],
  land: [
    "agriculture-land",
    "non-agriculture-land",
    "commercial-land",
    "residential-land",
    "industrial-land",
  ],
};

const AREA_UNITS = ["sq-ft", "sq-km", "sq-m", "sq-yd"];
const PROPERTY_TRANSACTIONS = ["new", "resale"];
const CONSTRUCTION_STATUSES = ["pre-launch", "under-construction", "ready-to-move"];
const AGES_OF_CONSTRUCTION = ["lt-1", "1-to-2", "2-to-3", "3-to-5", "gt-5"];
const FURNISHING_STATUSES = ["furnished", "semi-furnished", "unfurnished"];

const FURNISHING_ITEMS = [
  "dining-table",
  "tv",
  "sofa",
  "washing-machine",
  "microwave",
  "stove",
  "gas-cylinder",
  "fridge",
  "water-purifier",
  "gas-pipeline",
  "ac",
  "beds",
  "geyser",
  "electric-fittings",
  "fan",
  "wifi",
  "wardrobes",
];

const AMENITIES = [
  "lift",
  "cctv",
  "gym",
  "garden-park",
  "kids-play-area",
  "sports-club",
  "cricket-pitch",
  "basketball-court",
  "skating",
  "swimming-pool",
  "intercom",
  "gated-community",
  "security",
  "club-house",
  "community-hall",
  "regular-water-supply",
  "generator",
  "indoor-games",
  "power-backup",
  "pet-allowed",
  "no-vehicle-zone",
  "gazebo",
  "reserved-parking",
  "piped-gas",
  "vaastu-compliant",
  "mini-theatre",
  "solar-roof",
];

const FACINGS = [
  "East",
  "North",
  "North - East",
  "North - West",
  "South",
  "South - East",
  "South - West",
  "West",
];

const PRICE_INCLUSIONS = ["car-parking", "club-membership", "plc"];

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
];

const PROPERTY_STATUSES = ["draft", "pending", "published", "rejected"];

const MAX_MEDIA_FILES = 50;
const MAX_MEDIA_SIZE_BYTES = 50 * 1024 * 1024;
const MAX_BROCHURE_SIZE_BYTES = 100 * 1024 * 1024;
const MEDIA_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/heic", "video/mp4"];
const MEDIA_EXTENSIONS = [".jpg", ".jpeg", ".png", ".heic", ".mp4"];

module.exports = {
  LISTING_TYPES,
  PROPERTY_TYPES,
  SUB_TYPES_BY_PROPERTY_TYPE,
  AREA_UNITS,
  PROPERTY_TRANSACTIONS,
  CONSTRUCTION_STATUSES,
  AGES_OF_CONSTRUCTION,
  FURNISHING_STATUSES,
  FURNISHING_ITEMS,
  AMENITIES,
  FACINGS,
  PRICE_INCLUSIONS,
  MEDIA_CATEGORIES,
  PROPERTY_STATUSES,
  MAX_MEDIA_FILES,
  MAX_MEDIA_SIZE_BYTES,
  MAX_BROCHURE_SIZE_BYTES,
  MEDIA_MIME_TYPES,
  MEDIA_EXTENSIONS,
};
