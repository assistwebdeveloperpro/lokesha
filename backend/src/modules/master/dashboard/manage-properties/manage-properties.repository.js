const { db } = require("../../../../config/db");
const readRepository = require("../../../landing/property/property-read.repository");

const SOURCE_FILTERS = {
  admin: (query) => query.whereNotNull("p.admin_id"),
  user: (query) => query.whereNotNull("p.user_id"),
};

function applyFilters(query, { status, listingType, propertyType, source }) {
  if (status) query.where("p.status", status);
  if (listingType) query.where("p.listing_type", listingType);
  if (propertyType) query.where("p.property_type", propertyType);
  if (source) SOURCE_FILTERS[source](query);
  return query;
}

const OWNER_COLUMNS = {
  admin_id: "p.admin_id",
  listed_by: "p.listed_by",
  user_name: "u.name",
  admin_name: "a.name",
};

async function findListings(filters) {
  const query = applyFilters(db("properties as p"), filters)
    .leftJoin("users as u", "u.id", "p.user_id")
    .leftJoin("admins as a", "a.id", "p.admin_id");

  return readRepository.selectGroupedListings(query, filters, OWNER_COLUMNS);
}

async function countListings(filters) {
  return readRepository.countGroupedListings(applyFilters(db("properties as p"), filters));
}

module.exports = { findListings, countListings };
