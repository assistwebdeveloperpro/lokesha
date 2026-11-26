const { db } = require("../../../../config/db");

const TYPE_TABLES = [
  "residential_properties",
  "commercial_properties",
  "pg_properties",
  "plot_properties",
  "land_properties",
];

// Tables holding one listing's own data; the property row itself stays
const LISTING_CHILD_TABLES = [
  ...TYPE_TABLES,
  "property_plot_details",
  "property_sale_details",
  "property_rent_details",
  "builder_listing_details",
  "property_selections",
  "property_amenities",
  "property_variants",
  "builder_specifications",
];

// userId is left out for admins, who can manage any property
const scopeToOwner = (query, column, userId) => (userId ? query.where(column, userId) : query);

async function propertyExistsForOwner(id, userId) {
  const property = await scopeToOwner(db("properties").where({ id }), "user_id", userId).first("id");
  return Boolean(property);
}

const LOCKED_COLUMNS = [
  "p.id",
  "p.status",
  "p.admin_id",
  "p.updated_at",
  "p.listing_type",
  "p.property_type",
  "p.builder_project_id",
  "p.listing_group_id",
  "p.credit_consumed_at",
  "p.expires_at",
  "st.slug as sub_type_slug",
];

const lockableProperties = (trx) =>
  trx("properties as p").join("property_sub_types as st", "st.id", "p.property_sub_type_id");

// Locks the row so concurrent edits and status changes run one at a time
async function findPropertyForUpdate(trx, id, userId) {
  return scopeToOwner(lockableProperties(trx).where({ "p.id": id }), "p.user_id", userId)
    .forUpdate("p")
    .first(...LOCKED_COLUMNS);
}

// Locks the property and the other sub types posted with it; the property itself comes first
async function findGroupForUpdate(trx, id, userId) {
  const property = await findPropertyForUpdate(trx, id, userId);
  if (!property) return [];

  const groupScope = property.listing_group_id
    ? { "p.listing_group_id": property.listing_group_id }
    : property.builder_project_id
      ? { "p.builder_project_id": property.builder_project_id }
      : null;
  if (!groupScope) return [property];

  const siblings = await scopeToOwner(lockableProperties(trx).where(groupScope).whereNot({ "p.id": id }), "p.user_id", userId)
    .orderBy("p.listing_number", "asc")
    .forUpdate("p")
    .select(...LOCKED_COLUMNS);
  return [property, ...siblings];
}

async function updateProperty(trx, id, columns) {
  await trx("properties")
    .where({ id })
    .update({ ...columns, updated_at: trx.fn.now() });
}

async function deleteListingChildren(trx, propertyId) {
  for (const table of LISTING_CHILD_TABLES) {
    await trx(table).where({ property_id: propertyId }).del();
  }
}

const VARIANT_TABLES = [
  "residential_property_variants",
  "commercial_property_variants",
  "pg_property_variants",
  "plot_property_variants",
  "land_property_variants",
  "property_variant_charges",
];
const VOLATILE_COLUMNS = new Set(["id", "variant_id", "created_at", "updated_at"]);

const stripVolatile = (row) => Object.fromEntries(Object.entries(row).filter(([key]) => !VOLATILE_COLUMNS.has(key)));
const toComparableRows = (rows) => rows.map((row) => JSON.stringify(stripVolatile(row))).sort();

// Editable content of a listing and its project, without ids and timestamps that change on every rewrite
async function findContentSnapshot(trx, propertyId, projectId) {
  const snapshot = {};

  snapshot.property = toComparableRows(await trx("properties").where({ id: propertyId }));
  for (const table of [...LISTING_CHILD_TABLES, "property_owner_contacts"]) {
    snapshot[table] = toComparableRows(await trx(table).where({ property_id: propertyId }));
  }

  const variantIds = (await trx("property_variants").where({ property_id: propertyId }).select("id")).map(({ id }) => id);
  for (const table of VARIANT_TABLES) {
    snapshot[table] = toComparableRows(await trx(table).whereIn("variant_id", variantIds));
  }

  if (projectId) {
    snapshot.builder_projects = toComparableRows(await trx("builder_projects").where({ id: projectId }));
    for (const table of ["builder_highlights", "builder_faqs"]) {
      snapshot[table] = toComparableRows(await trx(table).where({ builder_project_id: projectId }));
    }
  }
  return JSON.stringify(snapshot);
}

async function restoreUpdatedAt(trx, id, updatedAt) {
  await trx("properties").where({ id }).update({ updated_at: updatedAt });
}

async function countProjectProperties(trx, projectId) {
  const [{ count }] = await trx("properties").where({ builder_project_id: projectId }).count("id as count");
  return Number(count);
}

async function deleteProperty(trx, id) {
  await trx("properties").where({ id }).del();
}

async function deleteProject(trx, id) {
  await trx("builder_projects").where({ id }).del();
}

async function countMedia(trx, propertyId, { brochure }) {
  const query = trx("property_media").where({ property_id: propertyId });
  query[brochure ? "where" : "whereNot"]({ category: "brochure" });
  const [{ count }] = await query.count("id as count");
  return Number(count);
}

async function countFloorPlans(trx, propertyId) {
  const [{ count }] = await trx("property_floor_plans").where({ property_id: propertyId }).count("id as count");
  return Number(count);
}

async function insertMedia(trx, row) {
  const [media] = await trx("property_media").insert(row).returning("*");
  return media;
}

async function insertFloorPlan(trx, row) {
  const [floorPlan] = await trx("property_floor_plans").insert(row).returning("*");
  return floorPlan;
}

async function findMediaById(trx, id, propertyId) {
  return trx("property_media").where({ id, property_id: propertyId }).first();
}

async function deleteMedia(trx, id) {
  await trx("property_media").where({ id }).del();
}

async function findFloorPlanById(trx, id, propertyId) {
  return trx("property_floor_plans").where({ id, property_id: propertyId }).first();
}

async function deleteFloorPlan(trx, id) {
  await trx("property_floor_plans").where({ id }).del();
}

module.exports = {
  propertyExistsForOwner,
  findPropertyForUpdate,
  findGroupForUpdate,
  updateProperty,
  deleteListingChildren,
  findContentSnapshot,
  restoreUpdatedAt,
  countProjectProperties,
  deleteProperty,
  deleteProject,
  countMedia,
  countFloorPlans,
  insertMedia,
  insertFloorPlan,
  findMediaById,
  deleteMedia,
  findFloorPlanById,
  deleteFloorPlan,
};
