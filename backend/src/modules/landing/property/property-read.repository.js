const { db } = require("../../../config/db");

const TYPE_TABLES = {
  residential: "residential_properties",
  commercial: "commercial_properties",
  pg: "pg_properties",
  plot: "plot_properties",
  land: "land_properties",
};

const VARIANT_TYPE_TABLES = {
  residential: "residential_property_variants",
  commercial: "commercial_property_variants",
  pg: "pg_property_variants",
  plot: "plot_property_variants",
  land: "land_property_variants",
};

function applyListFilters(query, userId, { status, listingType, propertyType }) {
  query.where("p.user_id", userId);
  if (status) query.where("p.status", status);
  if (listingType) query.where("p.listing_type", listingType);
  if (propertyType) query.where("p.property_type", propertyType);
  return query;
}

// Sub types posted together share a group, and builder posts fall back to their project
const GROUP_KEY = "coalesce(p.listing_group_id, p.builder_project_id, p.id)";

const firstOfGroup = (column, alias) =>
  db.raw(`(array_agg(${column} order by p.listing_number))[1] as ${alias}`);

const GROUP_COLUMNS = {
  id: "p.id",
  listing_number: "p.listing_number",
  title: "p.title",
  status: "p.status",
  listing_type: "p.listing_type",
  property_type: "p.property_type",
  city: "p.city",
};

// One row per posted property; every sub type of a group is folded into its row
// query must already be filtered and may carry extra joins, extraColumns reads from them
function selectGroupedListings(query, { page, limit }, extraColumns = {}, order = "min(p.created_at) desc") {
  return query
    .join("property_sub_types as st", "st.id", "p.property_sub_type_id")
    .leftJoin("builder_projects as bp", "bp.id", "p.builder_project_id")
    .leftJoin("builder_listing_details as bld", "bld.property_id", "p.id")
    .groupByRaw(GROUP_KEY)
    .select(
      ...Object.entries({ ...GROUP_COLUMNS, ...extraColumns }).map(([alias, column]) =>
        firstOfGroup(column, alias)
      ),
      db.raw("array_agg(p.id order by p.listing_number) as member_ids"),
      db.raw("array_agg(st.slug order by p.listing_number) as sub_type_slugs"),
      db.raw("array_agg(st.name order by p.listing_number) as sub_type_names"),
      db.raw("min(coalesce(bld.price_min, p.price)) as price_min"),
      db.raw("max(coalesce(bld.price_max, p.price)) as price_max"),
      db.raw("coalesce(max(bp.project_name), max(p.project_name)) as project_name"),
      db.raw("min(p.created_at) as created_at")
    )
    .orderByRaw(order)
    .orderByRaw(`${GROUP_KEY} desc`)
    .limit(limit)
    .offset((page - 1) * limit);
}

async function countGroupedListings(query) {
  const [{ count }] = await query.select(db.raw(`count(distinct ${GROUP_KEY}) as count`));
  return Number(count);
}

async function findListingsByUser(userId, filters) {
  return selectGroupedListings(applyListFilters(db("properties as p"), userId, filters), filters);
}

async function countListingsByUser(userId, filters) {
  return countGroupedListings(applyListFilters(db("properties as p"), userId, filters));
}

async function findImagesByPropertyIds(propertyIds) {
  if (!propertyIds.length) return [];

  return db("property_media")
    .whereIn("property_id", propertyIds)
    .where({ media_type: "image" })
    .select("property_id", "category", "file_path")
    .orderBy("sort_order", "asc")
    .orderBy("created_at", "asc");
}

// Options mapped to this listing type, property type (form id) and sub type; types without sub types map to null
async function findAmenityOptions({ listingType, propertyType, subType }) {
  return db("amenities as a")
    .join("amenity_property_types as apt", "apt.amenity_id", "a.id")
    .where({
      "a.is_active": true,
      "apt.listing_type": listingType,
      "apt.property_type": propertyType,
    })
    .andWhere((builder) => {
      if (subType) builder.where("apt.property_sub_type", subType).orWhereNull("apt.property_sub_type");
      else builder.whereNull("apt.property_sub_type");
    })
    .distinct("a.kind", "a.amenity_key", "a.name", "a.image_path", "a.sort_order")
    .orderBy([{ column: "a.kind" }, { column: "a.sort_order" }]);
}

// userId is left out for admins, who can open any property
async function findOwnedProperty(id, userId) {
  const query = db("properties as p")
    .join("property_sub_types as st", "st.id", "p.property_sub_type_id")
    .where({ "p.id": id });

  if (userId) query.where("p.user_id", userId);
  return query.first("p.*", "st.slug as sub_type_slug");
}

// The other sub types posted together with this property, in posting order
async function findGroupSiblings(property) {
  const scope = property.listing_group_id
    ? { "p.listing_group_id": property.listing_group_id }
    : property.builder_project_id
      ? { "p.builder_project_id": property.builder_project_id }
      : null;
  if (!scope) return [];

  return db("properties as p")
    .join("property_sub_types as st", "st.id", "p.property_sub_type_id")
    .where(scope)
    .whereNot({ "p.id": property.id })
    .orderBy("p.listing_number", "asc")
    .select("p.*", "st.slug as sub_type_slug");
}

async function findTypeRow(typeTable, propertyId) {
  return db(TYPE_TABLES[typeTable]).where({ property_id: propertyId }).first();
}

async function findPlotDetails(propertyId) {
  return db("property_plot_details").where({ property_id: propertyId }).first();
}

async function findSaleDetails(propertyId) {
  return db("property_sale_details").where({ property_id: propertyId }).first();
}

async function findRentDetails(propertyId) {
  return db("property_rent_details").where({ property_id: propertyId }).first();
}

async function findBuilderListingDetails(propertyId) {
  return db("builder_listing_details").where({ property_id: propertyId }).first();
}

async function findSpecifications(propertyId) {
  return db("builder_specifications").where({ property_id: propertyId }).orderBy("sort_order", "asc");
}

async function findSelections(propertyId) {
  return db("property_selections as s")
    .join("property_options as o", "o.id", "s.option_id")
    .where("s.property_id", propertyId)
    .select("o.option_group", "o.option_key")
    .orderBy("o.sort_order", "asc");
}

async function findAmenities(propertyId) {
  return db("property_amenities")
    .where({ property_id: propertyId })
    .select("kind", "amenity_key")
    .orderBy("created_at", "asc");
}

async function findVariants(propertyId, typeTable) {
  const variants = await db("property_variants").where({ property_id: propertyId }).orderBy("sort_order", "asc");
  const ids = variants.map(({ id }) => id);
  if (!ids.length) return [];

  const [typeRows, chargeRows] = await Promise.all([
    db(VARIANT_TYPE_TABLES[typeTable]).whereIn("variant_id", ids),
    db("property_variant_charges").whereIn("variant_id", ids),
  ]);
  const typeById = new Map(typeRows.map((row) => [row.variant_id, row]));
  const chargesById = new Map(chargeRows.map((row) => [row.variant_id, row]));

  return variants.map((variant) => ({
    ...variant,
    typeRow: typeById.get(variant.id),
    charges: chargesById.get(variant.id),
  }));
}

async function findMedia(propertyId) {
  return db("property_media").where({ property_id: propertyId }).orderBy("sort_order", "asc").orderBy("created_at", "asc");
}

async function findFloorPlans(propertyId) {
  return db("property_floor_plans")
    .where({ property_id: propertyId })
    .orderBy("sort_order", "asc")
    .orderBy("created_at", "asc");
}

async function findProject(projectId) {
  const [project, highlights, faqs] = await Promise.all([
    db("builder_projects").where({ id: projectId }).first(),
    db("builder_highlights").where({ builder_project_id: projectId }).orderBy("sort_order", "asc"),
    db("builder_faqs").where({ builder_project_id: projectId }).orderBy("sort_order", "asc"),
  ]);
  return project ? { ...project, highlights, faqs } : null;
}

async function findLastRejectionReason(propertyId) {
  const row = await db("property_status_history")
    .where({ property_id: propertyId, to_status: "rejected" })
    .orderBy("created_at", "desc")
    .first("reason");
  return row?.reason ?? null;
}

// The newest rejection of each property, for the list
async function findRejectionReasons(propertyIds) {
  if (!propertyIds.length) return [];

  return db("property_status_history")
    .whereIn("property_id", propertyIds)
    .where({ to_status: "rejected" })
    .distinctOn("property_id")
    .select("property_id", "reason")
    .orderBy([{ column: "property_id" }, { column: "created_at", order: "desc" }]);
}

module.exports = {
  selectGroupedListings,
  countGroupedListings,
  findRejectionReasons,
  findListingsByUser,
  countListingsByUser,
  findImagesByPropertyIds,
  findAmenityOptions,
  findOwnedProperty,
  findGroupSiblings,
  findTypeRow,
  findPlotDetails,
  findSaleDetails,
  findRentDetails,
  findBuilderListingDetails,
  findSpecifications,
  findSelections,
  findAmenities,
  findVariants,
  findMedia,
  findFloorPlans,
  findProject,
  findLastRejectionReason,
};
