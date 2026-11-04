const { db } = require("../../../config/db");
const c = require("./property-search.constants");
const { applySearchFilters, normalizedSql, PRICE_MIN_SQL, PRICE_MAX_SQL } = require("./property-search.filters");

const GROUP_KEY = "coalesce(p.listing_group_id, p.builder_project_id, p.id)";

const ORDER_BY = {
  recent: "max(coalesce(p.published_at, p.created_at)) desc",
  "price-asc": `min(${PRICE_MIN_SQL}) asc nulls last`,
  "price-desc": `max(${PRICE_MAX_SQL}) desc nulls last`,
};

const FLOORED_CARD_COLUMNS = {
  carpetArea: "t.carpet_area",
  areaUnit: "t.carpet_area_unit",
  totalFloors: "t.total_floors",
  floorNumber: "t.floor_number",
  furnishingStatus: "t.furnishing_status",
  ageOfConstruction: "t.age_of_construction",
};

const LAND_CARD_COLUMNS = {
  propertyTransaction: "t.property_transaction",
  roadFacing: "t.road_facing",
  openSides: "t.open_sides",
  cornerPlot: "t.corner_plot",
  boundaryWallMade: "t.boundary_wall_made",
  anyConstruction: "t.any_construction",
};

const CARD_TYPE_COLUMNS = {
  residential: { ...FLOORED_CARD_COLUMNS, bedrooms: "t.bedrooms", propertyTransaction: "t.property_transaction" },
  pg: {
    ...FLOORED_CARD_COLUMNS,
    bedrooms: "t.bedrooms",
    pgGender: "t.pg_gender",
    foodChargeType: "t.food_charge_type",
  },
  commercial: {
    ...FLOORED_CARD_COLUMNS,
    propertyTransaction: "t.property_transaction",
    washrooms: "t.washrooms",
    carParkingCount: "t.car_parking_count",
  },
  plot: LAND_CARD_COLUMNS,
  land: LAND_CARD_COLUMNS,
};

const firstOfGroup = (column, alias) => db.raw(`(array_agg(${column} order by p.listing_number))[1] as ${alias}`);

function baseQuery(dbType) {
  return db("properties as p")
    .join(`${c.TYPE_TABLES[dbType]} as t`, "t.property_id", "p.id")
    .join("property_sub_types as st", "st.id", "p.property_sub_type_id")
    .leftJoin("builder_projects as bp", "bp.id", "p.builder_project_id")
    .leftJoin("builder_listing_details as bld", "bld.property_id", "p.id")
    .leftJoin("property_owner_contacts as poc", "poc.property_id", "p.id")
    .leftJoin("users as u", "u.id", "p.user_id");
}

function filteredQuery(filters, { excludeLocalities = [], excludeIds = [] } = {}) {
  const query = applySearchFilters(baseQuery(c.CATEGORY_TO_DB[filters.category]), filters);

  if (excludeLocalities.length) {
    query.whereRaw(
      `${normalizedSql("p.locality")} not in (${excludeLocalities.map(() => "?").join(", ")})`,
      excludeLocalities
    );
  }
  if (excludeIds.length) query.whereNotIn("p.id", excludeIds);
  return query;
}


// One row per posted property; every sub type of a group is folded into its row
function selectCards(query, dbType) {
  const typeColumns = CARD_TYPE_COLUMNS[dbType];
  const areaSql = typeColumns.carpetArea ? `coalesce(${typeColumns.carpetArea}, p.area_sqft)` : "p.area_sqft";

  return query
    .groupByRaw(GROUP_KEY)
    .select(
      firstOfGroup("p.id", "id"),
      firstOfGroup("p.listing_number", "listing_number"),
      firstOfGroup("p.title", "title"),
      firstOfGroup("p.listing_type", "listing_type"),
      firstOfGroup("p.property_type", "property_type"),
      firstOfGroup("p.locality", "locality"),
      firstOfGroup("p.city", "city"),
      firstOfGroup("p.construction_status", "construction_status"),
      firstOfGroup("p.possession_date", "possession_date"),
      firstOfGroup("p.project_name", "society_name"),
      firstOfGroup("st.slug", "sub_type_slug"),
      firstOfGroup("st.name", "sub_type_name"),
      firstOfGroup(c.POSTED_BY_SQL, "posted_by"),
      firstOfGroup("p.listed_by", "listed_by"),
      firstOfGroup("poc.full_name", "owner_contact_name"),
      firstOfGroup("u.name", "poster_name"),
      firstOfGroup("p.builder_project_id", "builder_project_id"),
      firstOfGroup("bp.project_name", "project_name"),
      firstOfGroup("bp.developer_name", "developer_name"),
      firstOfGroup("bp.total_units", "total_units"),
      firstOfGroup("bp.launch_date", "launch_date"),
      firstOfGroup("coalesce(bp.rera_link, '')", "rera_link"),
      firstOfGroup(typeColumns.areaUnit ?? "'sq-ft'::text", "area_unit"),
      firstOfGroup(typeColumns.totalFloors ?? "null::smallint", "total_floors"),
      firstOfGroup(typeColumns.floorNumber ?? "null::smallint", "floor_number"),
      firstOfGroup(typeColumns.furnishingStatus ?? "null::text", "furnishing_status"),
      firstOfGroup(typeColumns.ageOfConstruction ?? "null::text", "age_of_construction"),
      firstOfGroup(typeColumns.propertyTransaction ?? "null::text", "property_transaction"),
      firstOfGroup(typeColumns.washrooms ?? "null::smallint", "washrooms"),
      firstOfGroup(typeColumns.carParkingCount ?? "null::smallint", "car_parking_count"),
      firstOfGroup(typeColumns.pgGender ?? "null::text", "pg_gender"),
      firstOfGroup(typeColumns.foodChargeType ?? "null::text", "food_charge_type"),
      firstOfGroup(typeColumns.roadFacing ?? "null::text", "road_facing"),
      firstOfGroup(typeColumns.openSides ?? "null::smallint", "open_sides"),
      firstOfGroup(typeColumns.cornerPlot ?? "null::boolean", "corner_plot"),
      firstOfGroup(typeColumns.boundaryWallMade ?? "null::boolean", "boundary_wall_made"),
      firstOfGroup(typeColumns.anyConstruction ?? "null::boolean", "any_construction"),
      db.raw("array_agg(p.id order by p.listing_number) as member_ids"),
      db.raw("array_agg(distinct st.slug order by st.slug) as sub_type_slugs"),
      db.raw(`min(${PRICE_MIN_SQL}) as price_min`),
      db.raw(`max(${PRICE_MAX_SQL}) as price_max`),
      db.raw(`min(${areaSql}) as area_min`),
      db.raw(`max(coalesce(bld.carpet_area_max, ${areaSql})) as area_max`),
      typeColumns.bedrooms
        ? db.raw(`array_remove(array_agg(distinct ${typeColumns.bedrooms}), null) as bedrooms`)
        : db.raw("'{}'::smallint[] as bedrooms")
    );
}

async function findListings(filters, { limit, offset, ...exclusions }) {
  const query = filteredQuery(filters, exclusions);

  return selectCards(query, c.CATEGORY_TO_DB[filters.category])
    .orderByRaw(ORDER_BY[filters.sort])
    .orderByRaw(`${GROUP_KEY} desc`)
    .limit(limit)
    .offset(offset);
}

// The card of the posted property a published row belongs to
async function findCard(property) {
  const groupId = property.listing_group_id ?? property.builder_project_id ?? property.id;
  const query = baseQuery(property.property_type).where("p.status", "published").whereRaw(`${GROUP_KEY} = ?`, [groupId]);

  return selectCards(query, property.property_type).first();
}

async function countListings(filters) {
  const [{ count }] = await filteredQuery(filters).select(db.raw(`count(distinct ${GROUP_KEY}) as count`));
  return Number(count);
}

// Photos, brochures, rera numbers and unit sizes of every member of the listed groups
async function findCardExtras(memberIds) {
  if (!memberIds.length) return { media: [], variants: [], reraRows: [] };

  const [media, variants, reraRows] = await Promise.all([
    db("property_media")
      .whereIn("property_id", memberIds)
      .andWhere((builder) => builder.where({ media_type: "image" }).orWhere({ category: "brochure" }))
      .select("property_id", "category", "file_path")
      .orderBy("sort_order", "asc")
      .orderBy("created_at", "asc"),
    db("property_variants as v")
      .join("residential_property_variants as rv", "rv.variant_id", "v.id")
      .whereIn("v.property_id", memberIds)
      .select("v.property_id", "rv.bhk", "rv.carpet_area", "rv.carpet_area_max", "rv.carpet_area_unit"),
    db("property_sale_details")
      .whereIn("property_id", memberIds)
      .whereRaw("coalesce(rera_number, '') <> ''")
      .select("property_id"),
  ]);

  return { media, variants, reraRows };
}

// Published properties of one id, with the name of whoever listed it
async function findPublishedProperty(id) {
  return db("properties as p")
    .join("property_sub_types as st", "st.id", "p.property_sub_type_id")
    .leftJoin("users as u", "u.id", "p.user_id")
    .where({ "p.id": id, "p.status": "published" })
    .first(
      "p.*",
      "st.slug as sub_type_slug",
      "st.name as sub_type_name",
      "u.name as poster_name",
      "u.agency_name as poster_agency",
      "u.company_name as poster_company"
    );
}

// Published projects of the same developer, split by how far they are
async function countDeveloperProjects(project) {
  const owner = project.user_id ? { "bp.user_id": project.user_id } : { "bp.admin_id": project.admin_id };
  const [row] = await db("builder_projects as bp")
    .where(owner)
    .whereExists(db("properties as p").whereRaw("p.builder_project_id = bp.id").where("p.status", "published"))
    .select(
      db.raw("count(*) as total"),
      db.raw("count(*) filter (where bp.project_type in ('new-launch', 'under-construction')) as ongoing"),
      db.raw("count(*) filter (where bp.project_type in ('ready', 'completed')) as completed")
    );

  return { totalProjects: Number(row.total), ongoingProjects: Number(row.ongoing), completedProjects: Number(row.completed) };
}

async function findAmenityNames(keys) {
  if (!keys.length) return [];
  return db("amenities").whereIn("amenity_key", keys).select("kind", "amenity_key", "name", "image_path");
}

module.exports = {
  findListings,
  findCard,
  countListings,
  findCardExtras,
  findPublishedProperty,
  findAmenityNames,
  countDeveloperProjects,
};