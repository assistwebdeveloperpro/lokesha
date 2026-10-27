const { db } = require("../../../../config/db");

function applyFilters(query, { status, listingType, propertyType }) {
  query.where("p.status", status);
  if (listingType) query.where("p.listing_type", listingType);
  if (propertyType) query.where("p.property_type", propertyType);
  return query;
}

// Oldest first, so the longest waiting listing is reviewed first
async function findListings(filters) {
  const { page, limit } = filters;

  return applyFilters(db("properties as p"), filters)
    .join("property_sub_types as st", "st.id", "p.property_sub_type_id")
    .join("users as u", "u.id", "p.user_id")
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
      "st.name as sub_type_name",
      "u.name as owner_name",
      "u.email as owner_email",
      "u.mobile_number as owner_mobile"
    )
    .orderBy("p.updated_at", "asc")
    .orderBy("p.id", "asc")
    .limit(limit)
    .offset((page - 1) * limit);
}

async function countListings(filters) {
  const [{ count }] = await applyFilters(db("properties as p"), filters).count("p.id as count");
  return Number(count);
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
  return trx("properties").where({ id }).forUpdate().first("id", "status", "user_id", "title");
}

module.exports = { findListings, countListings, findPropertyWithOwner, findPropertyForUpdate };
