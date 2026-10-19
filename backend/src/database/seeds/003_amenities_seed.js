const AMENITY_DIR = "/assets/images/amenities";
const FURNISHING_DIR = "/assets/images/furnishing";

// [amenity_key, name, image file]; a file starting with "/" is used as the full path
const BASE_AMENITIES = [
  ["lift", "Lift", "lift.svg"],
  ["cctv", "CCTV", "cctv.svg"],
  ["gym", "GYM", "gym.svg"],
  ["garden-park", "Garden/Park", "garden_park.svg"],
  ["kids-play-area", "Kids Play Area", "kids_play_area.svg"],
  ["sports-club", "Sports Club", "sports_club.svg"],
  ["cricket-pitch", "Cricket Pitch", "cricket_pitch.svg"],
  ["basketball-court", "Basket Ball court", "basket_ball_court.svg"],
  ["skating", "Skating", "scatting.svg"],
  ["swimming-pool", "Swimming Pool", "swimming_pool.svg"],
  ["intercom", "Intercom", "intercom.svg"],
  ["gated-community", "Gated Community", "gated_community.svg"],
  ["security", "Security", "security.svg"],
  ["club-house", "Club House", "club_house.svg"],
  ["community-hall", "Community Hall", "community_hall.svg"],
  ["regular-water-supply", "Regular Water Supply", "regular_water_supply.svg"],
  ["generator", "Generator", "generator.svg"],
  ["indoor-games", "Indoor Games", "indoor_games.svg"],
  ["power-backup", "Power Backup", "power_backup.svg"],
  ["pet-allowed", "Pet Allowed", "pet_allowed.svg"],
  ["no-vehicle-zone", "No Vehicle Zone", "no_vehicle_zone.svg"],
  ["gazebo", "Gazebo", "gazebo.svg"],
  ["reserved-parking", "Reserved Parking", "reserved_parking.svg"],
  ["piped-gas", "Piped Gas", "piped_gas.svg"],
  ["vaastu-compliant", "Vaastu Compliant", "vaastu_compliant.svg"],
  ["mini-theatre", "Mini Theatre", "mini_theatre.svg"],
  ["solar-roof", "Solar Roof", "solar_roof.svg"],
];

const EXTRA_AMENITIES = [
  ["wifi", "Wifi", `${FURNISHING_DIR}/wifi.svg`],
  ["house-keeping", "House Keeping", "house_keeping.svg"],
  ["fire-safety", "Fire Safety", "fire_safety.svg"],
  ["wheelchair-access", "WheelChair Access", "wheelchair_access.svg"],
];

const BASE_FURNISHING = [
  ["dining-table", "Dining Table", "dining_table.svg"],
  ["tv", "TV", "tv.svg"],
  ["sofa", "SOFA", "sofa.svg"],
  ["washing-machine", "Washing Machine", "washing_machine.svg"],
  ["microwave", "Microwave/Oven", "microwave_oven.svg"],
  ["stove", "Stove", "stove.svg"],
  ["gas-cylinder", "Gas Cylinder", "gas_cylinder.svg"],
  ["fridge", "Fridge", "fridge.svg"],
  ["water-purifier", "Water Purifier", "water_purifier.svg"],
  ["gas-pipeline", "Gas Pipeline", "gas_pipeline.svg"],
  ["ac", "AC", "ac.svg"],
  ["beds", "Beds", "beds.svg"],
  ["geyser", "Geyser", "gyser.svg"],
  ["electric-fittings", "Electric Fittings", "electric_fittings.svg"],
  ["fan", "Fan", "fan.svg"],
  ["wifi", "Wifi", "wifi.svg"],
  ["wardrobes", "Wardrobes", "wardrobes.svg"],
];

const COMMERCIAL_FURNISHING = [
  ["work-station", "Work Station", "work_station.svg"],
  ["chairs", "Chairs", "chairs.svg"],
  ["tables", "Tables", "tables.svg"],
  ["reception-area", "Reception Area", "reception_area.svg"],
  ["conference-room", "Conference Room", "conference_room.svg"],
  ["waiting-area", "Waiting Area", "waiting_area.svg"],
  ["director-cabin", "Director Cabin", "director_cabin.svg"],
  ["cupboard", "Cupboard", "cupboard.svg"],
  ["partition", "Partition", "partition.svg"],
];

const keysOf = (items) => items.map(([key]) => key);

const BASE_AMENITY_KEYS = keysOf(BASE_AMENITIES);
const BASE_FURNISHING_KEYS = keysOf(BASE_FURNISHING);
const COMMERCIAL_EXTRA_KEYS = keysOf(COMMERCIAL_FURNISHING);
const NOT_FOR_COMMERCIAL = ["dining-table", "washing-machine", "beds", "geyser"];

const COMMERCIAL_FURNISHING_KEYS = [
  ...BASE_FURNISHING_KEYS.filter((key) => !NOT_FOR_COMMERCIAL.includes(key)),
  ...COMMERCIAL_EXTRA_KEYS,
];
const GUEST_HOUSE_FURNISHING_KEYS = [...BASE_FURNISHING_KEYS, ...COMMERCIAL_EXTRA_KEYS];

const SHOP_AMENITY_KEYS = [
  "lift", "cctv", "security", "regular-water-supply", "generator", "power-backup",
  "pet-allowed", "no-vehicle-zone", "reserved-parking", "vaastu-compliant",
  "wifi", "house-keeping", "fire-safety", "wheelchair-access",
];

const COLD_STORAGE_AMENITY_KEYS = ["wifi", "house-keeping", "fire-safety", "wheelchair-access"];

const GUEST_HOUSE_AMENITY_KEYS = [
  "lift", "cctv", "intercom", "security", "regular-water-supply", "generator",
  "indoor-games", "power-backup", "pet-allowed", "no-vehicle-zone", "reserved-parking",
  "piped-gas", "vaastu-compliant", "solar-roof",
  "wifi", "house-keeping", "fire-safety", "wheelchair-access",
];

const HOTEL_AMENITY_KEYS = [
  "lift", "cctv", "gym", "garden-park", "kids-play-area", "sports-club", "swimming-pool",
  "intercom", "security", "club-house", "community-hall", "regular-water-supply",
  "generator", "indoor-games", "power-backup", "pet-allowed", "no-vehicle-zone",
  "reserved-parking", "piped-gas", "vaastu-compliant", "mini-theatre", "solar-roof",
  "wifi", "house-keeping", "fire-safety", "wheelchair-access",
];

const PLOT_AMENITY_KEYS = [
  "garden-park", "kids-play-area", "sports-club", "cricket-pitch", "basketball-court",
  "skating", "swimming-pool", "gated-community", "security", "club-house",
  "community-hall", "generator", "indoor-games", "power-backup", "vaastu-compliant",
];

const LISTING_TYPES = ["sale", "rent-lease"];
const RESIDENTIAL_SUB_TYPES = [
  "flat-apartment", "bungalow-villa", "studio-apartment", "weekend-homes",
  "farm-house", "residential-land", "penthouse", "duplex",
];

function mapKeys(kind, keys, targets) {
  return targets.flatMap(([listing, type, subType]) =>
    keys.map((key) => ({ kind, key, listing, type, subType }))
  );
}

// One target per listing type; subTypes [null] is for types without sub types
const subTypeTargets = (type, subTypes) =>
  LISTING_TYPES.flatMap((listing) => subTypes.map((subType) => [listing, type, subType]));

function buildMappings() {
  return [
    ...mapKeys("amenity", BASE_AMENITY_KEYS, subTypeTargets("residential", RESIDENTIAL_SUB_TYPES)),
    ...mapKeys("amenity", SHOP_AMENITY_KEYS, subTypeTargets("commercial", ["shop", "showroom", "warehouse-godown"])),
    ...mapKeys("amenity", [...SHOP_AMENITY_KEYS, "indoor-games"], subTypeTargets("commercial", ["office"])),
    ...mapKeys("amenity", COLD_STORAGE_AMENITY_KEYS, subTypeTargets("commercial", ["cold-storage"])),
    ...mapKeys("amenity", GUEST_HOUSE_AMENITY_KEYS, subTypeTargets("commercial", ["guest-house"])),
    ...mapKeys("amenity", HOTEL_AMENITY_KEYS, subTypeTargets("commercial", ["hotel-resort"])),
    ...mapKeys("amenity", PLOT_AMENITY_KEYS, subTypeTargets("plot", ["residential-plot"])),

    ...mapKeys("furnishing", BASE_FURNISHING_KEYS, [
      ...subTypeTargets("residential", RESIDENTIAL_SUB_TYPES),
      ...subTypeTargets("pg-co-living", [null]),
    ]),
    ...mapKeys(
      "furnishing",
      COMMERCIAL_FURNISHING_KEYS,
      subTypeTargets("commercial", [
        "shop", "office", "showroom", "co-working-space",
        "cold-storage", "warehouse-godown", "industrial-shed",
      ])
    ),
    ...mapKeys(
      "furnishing",
      GUEST_HOUSE_FURNISHING_KEYS,
      subTypeTargets("commercial", ["guest-house", "hotel-resort"])
    ),
  ];
}

function buildCatalog() {
  const toRows = (items, kind, dir) =>
    items.map(([amenity_key, name, file], index) => ({
      kind,
      amenity_key,
      name,
      image_path: file.startsWith("/") ? file : `${dir}/${file}`,
      sort_order: index + 1,
    }));

  return [
    ...toRows([...BASE_AMENITIES, ...EXTRA_AMENITIES], "amenity", AMENITY_DIR),
    ...toRows([...BASE_FURNISHING, ...COMMERCIAL_FURNISHING], "furnishing", FURNISHING_DIR),
  ];
}

/** @param {import('knex').Knex} knex */
exports.seed = async function seed(knex) {
  await knex.transaction(async (trx) => {
    await trx("amenities")
      .insert(buildCatalog())
      .onConflict(["kind", "amenity_key"])
      .merge(["name", "image_path", "sort_order", "updated_at"]);

    const amenities = await trx("amenities").select("id", "kind", "amenity_key");
    const idByKey = new Map(amenities.map((a) => [`${a.kind}:${a.amenity_key}`, a.id]));

    // Rebuild mappings so edits to the rules above always take effect
    await trx("amenity_property_types").del();
    await trx.batchInsert(
      "amenity_property_types",
      buildMappings().map((m) => ({
        amenity_id: idByKey.get(`${m.kind}:${m.key}`),
        listing_type: m.listing,
        property_type: m.type,
        property_sub_type: m.subType,
      })),
      200
    );
  });
};