const repository = require("./saved-properties.repository");
const { AppError } = require("../../../shared/property/utils/property.errors");
const { toGalleryImagePaths } = require("../../../landing/property-search/property-search.mapper");
const {
  PUBLISHED_STATUS,
  findListingsByPropertyId,
  toUnavailableProperty,
} = require("../shared/published-listings");

// Adds the slider images of every sub type in the card's group
function withImageUrls(listing, card, extras) {
  const media = extras.media.filter(({ property_id: id }) => card.member_ids.includes(id));

  return { ...listing, imageUrls: toGalleryImagePaths(media, listing.imageUrl) };
}

function toSavedItem(row, listings) {
  const isAvailable = row.status === PUBLISHED_STATUS;
  const property = isAvailable ? listings.get(row.property_id) : null;

  return {
    id: row.id,
    propertyId: row.property_id,
    savedAt: row.created_at,
    isAvailable,
    property: property ?? toUnavailableProperty(row),
  };
}

async function saveProperty(userId, propertyId) {
  const property = await repository.findPublishedProperty(propertyId);
  if (!property) {
    throw new AppError("Property not found", 404);
  }

  if (property.user_id === userId) {
    throw new AppError("You cannot save your own property", 400);
  }

  await repository.insertSaved(userId, propertyId);

  return { saved: true };
}

async function unsaveProperty(userId, propertyId) {
  await repository.deleteSaved(userId, propertyId);

  return { saved: false };
}

async function listSavedPropertyIds(userId) {
  return { propertyIds: await repository.findSavedIds(userId) };
}

async function listSavedProperties(userId, query) {
  const [rows, total] = await Promise.all([
    repository.findSavedRows(userId, query),
    repository.countSaved(userId),
  ]);
  const listings = await findListingsByPropertyId(rows, withImageUrls);

  return {
    items: rows.map((row) => toSavedItem(row, listings)),
    page: query.page,
    limit: query.limit,
    total,
  };
}

module.exports = { saveProperty, unsaveProperty, listSavedPropertyIds, listSavedProperties };
