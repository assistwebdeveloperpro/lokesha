const { LISTING_TYPES, POSTING_AS_VALUES } = require("../../shared/property/constants/property.constants");

const DEFAULT_PAGE_SIZE = 30;
const MAX_PAGE_SIZE = 50;
const MAX_LIST_ITEMS = 50;
const SIMILAR_LIMIT = 8;
const OTHER_LOCALITIES_LIMIT = 12;

const SORTS = ["recent", "price-asc", "price-desc"];
const POSTED_SINCE_INTERVALS = { "24h": "24 hours", "3d": "3 days", "7d": "7 days", "15d": "15 days", "30d": "30 days" };
const AVAILABLE_WITHIN_DAYS = { "15d": 15, "30d": 30, "60d": 60, "90d": 90 };

// Form category id -> database property type
const CATEGORY_TO_DB = {
  residential: "residential",
  commercial: "commercial",
  "pg-co-living": "pg",
  plot: "plot",
  land: "land",
};

const TYPE_TABLES = {
  residential: "residential_properties",
  commercial: "commercial_properties",
  pg: "pg_properties",
  plot: "plot_properties",
  land: "land_properties",
};

const ALL_TYPES = Object.keys(TYPE_TABLES);
const ROOMED_TYPES = ["residential", "commercial", "pg"];
const FLOORED_TYPES = ["residential", "commercial", "pg"];
const SALE_TYPE_TYPES = ["residential", "commercial", "plot", "land"];

// Searchable columns of the type tables; a filter is skipped for types without its column
const COLUMN_FILTERS = {
  balconies: { column: "balconies", numeric: true, types: ROOMED_TYPES },
  bathroomCounts: { column: "bathrooms", numeric: true, types: ROOMED_TYPES },
  ageOfConstruction: { column: "age_of_construction", types: FLOORED_TYPES },
  lifts: { column: "lifts", numeric: true, types: ["residential"] },
  cabins: { column: "cabins", numeric: true, types: ["commercial"] },
  totalFloors: { column: "total_floors", numeric: true, types: FLOORED_TYPES },
  floorNumbers: { column: "floor_number", numeric: true, types: FLOORED_TYPES },
  furnishingStatuses: { column: "furnishing_status", types: ROOMED_TYPES },
  washrooms: { column: "washrooms", numeric: true, types: ["commercial"] },
  roadFacings: { column: "road_facing", types: ["commercial", "pg", "plot", "land"] },
  openSides: { column: "open_sides", numeric: true, types: ALL_TYPES },
  carParkings: { column: "car_parking_count", numeric: true, types: FLOORED_TYPES },
  managedBy: { column: "managed_by", types: ["commercial", "pg", "plot", "land"] },
  penthouseTypes: { column: "penthouse_type", types: ["residential"] },
  pgPresentIn: { column: "pg_present_in", types: ["pg"] },
  pgOperationSince: { column: "operating_since_year", numeric: true, types: ["pg"] },
  pgGenders: { column: "pg_gender", types: ["pg"] },
};

// Any of the picked options must be stored for the listing
const SELECTION_FILTERS = {
  tenantPreferences: "tenant_preference",
  pgRules: "pg_rule",
  foods: "food",
  businessTypes: "business_type",
  terraceEntries: "terrace_entry",
};

// Boolean columns that must be true
const FLAG_FILTERS = {
  boundaryWallMade: { column: "boundary_wall_made", types: ["plot", "land"] },
  cornerPlot: { column: "corner_plot", types: ["plot", "land"] },
  anyConstruction: { column: "any_construction", types: ["plot", "land"] },
  clubMembership: { column: "club_membership", types: ["residential", "commercial", "plot"] },
  pantry: { column: "has_pantry", types: ["commercial", "pg"] },
  cafeteria: { column: "has_cafeteria", types: ["commercial", "pg"] },
  cornerShop: { column: "is_corner_shop", types: ["commercial"] },
};

// Who the listing is shown as, staff and admin pick it while posting
const POSTED_BY_SQL = `case
  when p.listed_by in ('buyer_owner_tenant','agent','builder') then p.listed_by
  else coalesce(p.posted_as, case when p.builder_project_id is not null then 'builder' else 'buyer_owner_tenant' end)
end`;

const POSTED_BY_LABEL = { buyer_owner_tenant: "owner", agent: "dealer", builder: "builder" };

module.exports = {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MAX_LIST_ITEMS,
  SIMILAR_LIMIT,
  OTHER_LOCALITIES_LIMIT,
  SORTS,
  POSTED_SINCE_INTERVALS,
  AVAILABLE_WITHIN_DAYS,
  CATEGORY_TO_DB,
  TYPE_TABLES,
  ROOMED_TYPES,
  SALE_TYPE_TYPES,
  COLUMN_FILTERS,
  SELECTION_FILTERS,
  FLAG_FILTERS,
  POSTED_BY_SQL,
  POSTED_BY_LABEL,
  LISTING_TYPES,
  POSTING_AS_VALUES,
};
