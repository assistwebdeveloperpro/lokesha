const { db } = require("../../../../config/db");
const readRepository = require("../../../landing/property/property-read.repository");

function applyFilters(query, { status, listingType, propertyType }) {
  query.where("p.status", status);
  if (listingType) query.where("p.listing_type", listingType);
  if (propertyType) query.where("p.property_type", propertyType);
  return query;
}

// Oldest first, so the longest waiting listing is reviewed first
const OWNER_COLUMNS = {
  owner_name: "u.name",
  owner_email: "u.email",
  owner_mobile: "u.mobile_number",
};

// One row per posted property, so a post with several sub types is reviewed once
async function findListings(filters) {
  const query = applyFilters(db("properties as p"), filters).join("users as u", "u.id", "p.user_id");

  return readRepository.selectGroupedListings(query, filters, OWNER_COLUMNS, "min(p.updated_at) asc");
}

async function countListings(filters) {
  return readRepository.countGroupedListings(applyFilters(db("properties as p"), filters));
}

// The other sub types posted with the property, locked so the whole post is decided together
async function findGroupForUpdate(trx, id) {
  const property = await findPropertyForUpdate(trx, id);
  if (!property) return [];

  const scope = property.listing_group_id
    ? { listing_group_id: property.listing_group_id }
    : property.builder_project_id
      ? { builder_project_id: property.builder_project_id }
      : null;
  if (!scope) return [property];

  const siblings = await trx("properties")
    .where(scope)
    .whereNot({ id })
    .orderBy("listing_number", "asc")
    .forUpdate()
    .select("id", "status", "user_id", "title", "listing_group_id", "builder_project_id");
  return [property, ...siblings];
}

async function findPropertyWithOwner(id) {
  return db("properties as p")
    .join("property_sub_types as st", "st.id", "p.property_sub_type_id")
    .join("users as u", "u.id", "p.user_id")
    .where({ "p.id": id })
    .first(
      "p.*",
      "st.slug as sub_type_slug",
      "u.name as owner_name",
      "u.email as owner_email",
      "u.mobile_number as owner_mobile",
      "u.role as owner_role"
    );
}

// Locks the row so two reviewers cannot decide the same listing
async function findPropertyForUpdate(trx, id) {
  return trx("properties").where({ id }).forUpdate().first("id", "status", "user_id", "title", "listing_group_id", "builder_project_id");
}

module.exports = { findListings, countListings, findPropertyWithOwner, findPropertyForUpdate, findGroupForUpdate };
