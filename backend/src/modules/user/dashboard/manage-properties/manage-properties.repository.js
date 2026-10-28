const { db } = require("../../../../config/db");
const readRepository = require("../../../shared/property/repositories/property-read.repository");

function applyListFilters(query, userId, { status, listingType, propertyType }) {
  query.where("p.user_id", userId);
  if (status) query.where("p.status", status);
  if (listingType) query.where("p.listing_type", listingType);
  if (propertyType) query.where("p.property_type", propertyType);
  return query;
}

async function findListingsByUser(userId, filters) {
  return readRepository.selectGroupedListings(applyListFilters(db("properties as p"), userId, filters), filters);
}

async function countListingsByUser(userId, filters) {
  return readRepository.countGroupedListings(applyListFilters(db("properties as p"), userId, filters));
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
  findListingsByUser,
  countListingsByUser,
  findRejectionReasons,
};
