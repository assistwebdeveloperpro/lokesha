const repository = require("./seen-properties.repository");
const { AppError } = require("../../../shared/property/utils/property.errors");
const { findListingsByPropertyId, withGalleryImages } = require("../shared/published-listings");

const MAX_VIEWED_PER_USER = 50;

// Newest timestamp per property, never in the future, newest first, capped to the limit
function normalizeEntries(properties, now) {
  const newestByProperty = properties.reduce((acc, { propertyId, viewedAt }) => {
    const time = Math.min(viewedAt.getTime(), now.getTime());
    return acc.has(propertyId) && acc.get(propertyId) >= time ? acc : acc.set(propertyId, time);
  }, new Map());

  return [...newestByProperty]
    .sort(([, a], [, b]) => b - a)
    .slice(0, MAX_VIEWED_PER_USER)
    .map(([propertyId, time]) => ({ propertyId, viewedAt: new Date(time) }));
}

function toViewedItem(row, listings) {
  return {
    id: row.id,
    propertyId: row.property_id,
    viewedAt: row.viewed_at,
    isAvailable: true,
    property: listings.get(row.property_id),
  };
}

async function recordView(userId, propertyId) {
  // Guests are tracked in the browser only
  if (!userId) {
    return { recorded: false };
  }

  const property = await repository.findPublishedProperty(propertyId);
  if (!property) {
    throw new AppError("Property not found", 404);
  }

  if (property.user_id === userId) {
    return { recorded: false };
  }

  const now = new Date();

  await repository.runInTransaction(async (trx) => {
    await repository.lockUser(trx, userId);
    await repository.upsertViews(trx, [
      { user_id: userId, property_id: propertyId, viewed_at: now, updated_at: now },
    ]);
    await repository.trimToLimit(trx, userId, MAX_VIEWED_PER_USER);
  });

  return { recorded: true };
}

async function syncViews(userId, properties) {
  const now = new Date();
  const entries = normalizeEntries(properties, now);

  // Unknown, unpublished and own listings are skipped
  const eligible = await repository.findPublishedProperties(entries.map((entry) => entry.propertyId));
  const eligibleIds = new Set(
    eligible.filter(({ user_id: ownerId }) => ownerId !== userId).map(({ id }) => id)
  );
  const candidates = entries.filter(({ propertyId }) => eligibleIds.has(propertyId));

  if (!candidates.length) {
    return { synced: 0 };
  }

  return repository.runInTransaction(async (trx) => {
    await repository.lockUser(trx, userId);

    const existing = await repository.findExistingViews(
      trx,
      userId,
      candidates.map((entry) => entry.propertyId)
    );
    const existingTimes = new Map(
      existing.map(({ property_id: id, viewed_at: viewedAt }) => [id, new Date(viewedAt).getTime()])
    );

    // A guest timestamp never overwrites a newer stored one
    const rows = candidates
      .filter(({ propertyId, viewedAt }) => viewedAt.getTime() > (existingTimes.get(propertyId) ?? 0))
      .map(({ propertyId, viewedAt }) => ({
        user_id: userId,
        property_id: propertyId,
        viewed_at: viewedAt,
        updated_at: now,
      }));

    if (rows.length) {
      await repository.upsertViews(trx, rows);
    }
    await repository.trimToLimit(trx, userId, MAX_VIEWED_PER_USER);

    return { synced: rows.length };
  });
}

async function listViewedProperties(userId, query) {
  const [rows, total] = await Promise.all([
    repository.findViewedRows(userId, query),
    repository.countViewed(userId),
  ]);
  const listings = await findListingsByPropertyId(rows, withGalleryImages);

  return {
    items: rows.filter((row) => listings.has(row.property_id)).map((row) => toViewedItem(row, listings)),
    page: query.page,
    limit: query.limit,
    total,
  };
}

module.exports = { recordView, syncViews, listViewedProperties };
