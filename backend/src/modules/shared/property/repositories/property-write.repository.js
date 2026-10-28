const { db } = require("../../../../config/db");

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

const INSERT_BATCH_SIZE = 200;

async function insertMany(trx, table, rows) {
  if (!rows.length) return;
  await trx.batchInsert(table, rows, INSERT_BATCH_SIZE);
}

async function findSubTypes(propertyType, slugs) {
  return db("property_sub_types")
    .where({ property_type: propertyType, is_active: true })
    .whereIn("slug", slugs)
    .select("id", "slug", "name");
}

async function findActiveOptions(groups) {
  return db("property_options")
    .where({ is_active: true })
    .whereIn("option_group", groups)
    .select("id", "option_group", "option_key");
}

// Amenities mapped to this listing, property type (form id) and sub type
async function findAllowedAmenities({ listingType, propertyType, subType }) {
  return db("amenities as a")
    .join("amenity_property_types as apt", "apt.amenity_id", "a.id")
    .where({
      "a.is_active": true,
      "apt.listing_type": listingType,
      "apt.property_type": propertyType,
    })
    .andWhere((builder) =>
      builder.where("apt.property_sub_type", subType).orWhereNull("apt.property_sub_type")
    )
    .distinct("a.kind", "a.amenity_key");
}

async function insertBuilderProject(trx, row) {
  await trx("builder_projects").insert(row);
}

async function updateBuilderProject(trx, id, row) {
  await trx("builder_projects")
    .where({ id })
    .update({ ...row, updated_at: trx.fn.now() });
}

async function deleteProjectChildren(trx, projectId) {
  await trx("builder_highlights").where({ builder_project_id: projectId }).del();
  await trx("builder_faqs").where({ builder_project_id: projectId }).del();
}

async function insertBuilderHighlights(trx, rows) {
  await insertMany(trx, "builder_highlights", rows);
}

async function insertBuilderFaqs(trx, rows) {
  await insertMany(trx, "builder_faqs", rows);
}

async function insertProperty(trx, row) {
  const [property] = await trx("properties")
    .insert(row)
    .returning(["id", "listing_number", "status"]);
  return property;
}

async function insertTypeRow(trx, typeTable, row) {
  await trx(TYPE_TABLES[typeTable]).insert(row);
}

async function insertPlotDetails(trx, row) {
  await trx("property_plot_details").insert(row);
}

async function insertSaleDetails(trx, row) {
  await trx("property_sale_details").insert(row);
}

async function insertRentDetails(trx, row) {
  await trx("property_rent_details").insert(row);
}

async function insertBuilderListingDetails(trx, row) {
  await trx("builder_listing_details").insert(row);
}

async function insertSelections(trx, rows) {
  await insertMany(trx, "property_selections", rows);
}

async function insertAmenities(trx, rows) {
  await insertMany(trx, "property_amenities", rows);
}

async function insertVariants(trx, rows) {
  await insertMany(trx, "property_variants", rows);
}

async function insertVariantTypeRows(trx, typeTable, rows) {
  await insertMany(trx, VARIANT_TYPE_TABLES[typeTable], rows);
}

async function insertVariantCharges(trx, rows) {
  await insertMany(trx, "property_variant_charges", rows);
}

async function insertSpecifications(trx, rows) {
  await insertMany(trx, "builder_specifications", rows);
}

async function insertMedia(trx, rows) {
  await insertMany(trx, "property_media", rows);
}

async function insertFloorPlans(trx, rows) {
  await insertMany(trx, "property_floor_plans", rows);
}

async function insertStatusHistory(trx, row) {
  await trx("property_status_history").insert(row);
}

async function findLastStatusChangeAt(trx, propertyId, toStatus) {
  const row = await trx("property_status_history")
    .where({ property_id: propertyId, to_status: toStatus })
    .orderBy("created_at", "desc")
    .first("created_at");
  return row?.created_at ?? null;
}

async function updatePropertyStatus(trx, id, data) {
  await trx("properties")
    .where({ id })
    .update({ ...data, updated_at: trx.fn.now() });
}

async function deleteDraft(trx, id, owner) {
  const scope = owner.userId ? { user_id: owner.userId } : { admin_id: owner.adminId };
  return trx("property_form_drafts").where({ id, ...scope }).del();
}

async function findDraftForUpdate(trx, id, owner) {
  const scope = owner.userId ? { user_id: owner.userId } : { admin_id: owner.adminId };
  return trx("property_form_drafts").where({ id, ...scope }).forUpdate().first("id");
}

module.exports = {
  findSubTypes,
  findActiveOptions,
  findAllowedAmenities,
  insertBuilderProject,
  updateBuilderProject,
  deleteProjectChildren,
  insertBuilderHighlights,
  insertBuilderFaqs,
  insertProperty,
  insertTypeRow,
  insertPlotDetails,
  insertSaleDetails,
  insertRentDetails,
  insertBuilderListingDetails,
  insertSelections,
  insertAmenities,
  insertVariants,
  insertVariantTypeRows,
  insertVariantCharges,
  insertSpecifications,
  insertMedia,
  insertFloorPlans,
  insertStatusHistory,
  findLastStatusChangeAt,
  updatePropertyStatus,
  deleteDraft,
  findDraftForUpdate,
};
