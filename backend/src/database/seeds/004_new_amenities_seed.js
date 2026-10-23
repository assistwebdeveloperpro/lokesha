const AMENITY_DIR = "/assets/images/amenities";

const LISTING_TYPES = ["sale", "rent-lease"];
const RESIDENTIAL_SUB_TYPES = [
  "flat-apartment", "bungalow-villa", "studio-apartment", "weekend-homes",
  "farm-house", "residential-land", "penthouse", "duplex",
];
const COMMERCIAL_SUB_TYPES = [
  "shop", "office", "showroom", "warehouse-godown", "guest-house", "hotel-resort",
];

// [amenity_key, name, image file, also applies to commercial]
const NEW_AMENITIES = [
  ["laundry-service", "Laundry Service", "laundry_service.svg", false],
  ["skydeck", "Skydeck", "skydeck.svg", true],
  ["outdoor-tennis-court", "Outdoor Tennis Court", "outdoor_tennis_court.svg", false],
  ["visitor-parking", "Visitor Parking", "visitor_parking.svg", true],
  ["banquet-hall", "Banquet Hall", "banquet_hall.svg", false],
  ["bar-lounge", "Bar/ Lounge", "lounge.svg", false],
  ["service-goods-lift", "Service/Goods Lift", "goods_lift.svg", true],
  ["fireplace", "Fireplace", "fireplace.svg", true],
  ["water-front", "Water Front", "water_front.svg", true],
  ["jogging-strolling-track", "Jogging and Strolling Track", "jogging_strolling_track.svg", false],
  ["library-business-centre", "Library and Business Centre", "library_business_centre.svg", true],
  ["solar-energy", "Solar Energy", "solar_energy.svg", true],
  ["meditation-area", "Meditation Area", "meditation_area.svg", false],
  ["kids-splash-pool", "Kids Splash Pool", "kids_splash_pool.svg", false],
  ["private-terrace", "Private Terrace", "private_terrace.svg", false],
];

const subTypeTargets = (type, subTypes) =>
  LISTING_TYPES.flatMap((listing) => subTypes.map((subType) => [listing, type, subType]));

/** @param {import('knex').Knex} knex */
exports.seed = async function seed(knex) {
  await knex.transaction(async (trx) => {
    const [{ max }] = await trx("amenities").where({ kind: "amenity" }).max("sort_order as max");
    const existing = await trx("amenities")
      .where({ kind: "amenity" })
      .whereIn("amenity_key", NEW_AMENITIES.map(([key]) => key))
      .select("amenity_key", "sort_order");
    const sortByKey = new Map(existing.map((a) => [a.amenity_key, a.sort_order]));

    // Keep sort_order stable on re-run, append new ones after the current max
    let nextSort = Number(max) || 0;
    const rows = NEW_AMENITIES.map(([amenity_key, name, file]) => ({
      kind: "amenity",
      amenity_key,
      name,
      image_path: `${AMENITY_DIR}/${file}`,
      sort_order: sortByKey.get(amenity_key) ?? ++nextSort,
    }));

    const saved = await trx("amenities")
      .insert(rows)
      .onConflict(["kind", "amenity_key"])
      .merge(["name", "image_path", "sort_order", "updated_at"])
      .returning(["id", "amenity_key"]);
    const idByKey = new Map(saved.map((a) => [a.amenity_key, a.id]));

    const residentialTargets = subTypeTargets("residential", RESIDENTIAL_SUB_TYPES);
    const commercialTargets = subTypeTargets("commercial", COMMERCIAL_SUB_TYPES);

    const mappings = NEW_AMENITIES.flatMap(([key, , , isCommercial]) =>
      [...residentialTargets, ...(isCommercial ? commercialTargets : [])].map(
        ([listing_type, property_type, property_sub_type]) => ({
          amenity_id: idByKey.get(key),
          listing_type,
          property_type,
          property_sub_type,
        })
      )
    );

    // Rebuild only these amenities' mappings so re-runs stay idempotent
    await trx("amenity_property_types").whereIn("amenity_id", [...idByKey.values()]).del();
    await trx.batchInsert("amenity_property_types", mappings, 200);
  });
};
