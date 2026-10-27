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

async function findListingsByUser(userId, filters) {
  const { page, limit } = filters;

  return applyListFilters(db("properties as p"), userId, filters)
    .join("property_sub_types as st", "st.id", "p.property_sub_type_id")
    .select(
      "p.id",
      "p.listing_number",
      "p.title",
      "p.price",
      "p.status",
      "p.listing_type",
      "p.property_type",
      "p.city",
      "p.created_at",
      "st.slug as sub_type_slug",
      "st.name as sub_type_name"
    )
    .orderBy("p.created_at", "desc")
    .orderBy("p.id", "desc")
    .limit(limit)
    .offset((page - 1) * limit);
}

async function countListingsByUser(userId, filters) {
  const [{ count }] = await applyListFilters(db("properties as p"), userId, filters).count("p.id as count");
  return Number(count);
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

async function findOwnedProperty(id, userId) {
  return db("properties as p")
    .join("property_sub_types as st", "st.id", "p.property_sub_type_id")
    .where({ "p.id": id, "p.user_id": userId })
    .first("p.*", "st.slug as sub_type_slug");
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
  findRejectionReasons,
  findListingsByUser,
  countListingsByUser,
  findImagesByPropertyIds,
  findAmenityOptions,
  findOwnedProperty,
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
