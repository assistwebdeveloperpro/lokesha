const repository = require("./saved-properties.repository");
const { AppError } = require("../../../shared/property/utils/property.errors");
const {
  PUBLISHED_STATUS,
  findListingsByPropertyId,
  withGalleryImages,
  toUnavailableProperty,
} = require("../shared/published-listings");

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
  const listings = await findListingsByPropertyId(rows, withGalleryImages);

  return {
    items: rows.map((row) => toSavedItem(row, listings)),
    page: query.page,
    limit: query.limit,
    total,
  };
}

module.exports = { saveProperty, unsaveProperty, listSavedPropertyIds, listSavedProperties };
