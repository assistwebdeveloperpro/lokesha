const repository = require("./recent-searches.repository");
const { AppError } = require("../../../shared/property/utils/property.errors");
const { buildCriteriaHash } = require("./recent-searches.criteria");
const { buildSearchTitle, buildSearchSubtitle } = require("./recent-searches.title");
const { MAX_RECENT_SEARCHES, syncEntrySchema } = require("./recent-searches.validation");

// Title, subtitle and hash are always generated here, never taken from the client
function toRow(userId, { searchCriteria, searchUrl }, searchedAt, now) {
  return {
    user_id: userId,
    search_criteria: JSON.stringify(searchCriteria),
    search_title: buildSearchTitle(searchCriteria),
    search_subtitle: buildSearchSubtitle(searchCriteria),
    search_url: searchUrl,
    criteria_hash: buildCriteriaHash(searchCriteria),
    searched_at: searchedAt,
    updated_at: now,
  };
}

function toItem(row) {
  return {
    id: row.id,
    title: row.search_title,
    subtitle: row.search_subtitle,
    searchCriteria: row.search_criteria,
    searchUrl: row.search_url,
    searchedAt: row.searched_at,
  };
}

// Invalid guest entries are skipped, future dates clamped to now
function parseGuestEntries(searches, now) {
  return searches.flatMap((entry) => {
    const { error, value } = syncEntrySchema.validate(entry, { abortEarly: false, stripUnknown: true });
    if (error) return [];

    return [{ ...value, searchedAt: new Date(Math.min(value.searchedAt.getTime(), now.getTime())) }];
  });
}

// Newest entry per hash, newest first, capped to the limit
function normalizeGuestRows(userId, searches, now) {
  const newestByHash = parseGuestEntries(searches, now)
    .map((entry) => toRow(userId, entry, entry.searchedAt, now))
    .reduce((acc, row) => {
      const current = acc.get(row.criteria_hash);
      return current && current.searched_at >= row.searched_at ? acc : acc.set(row.criteria_hash, row);
    }, new Map());

  return [...newestByHash.values()]
    .sort((a, b) => b.searched_at - a.searched_at)
    .slice(0, MAX_RECENT_SEARCHES);
}

async function recordSearch(userId, payload) {
  const now = new Date();
  const row = toRow(userId, payload, now, now);

  const [saved] = await repository.runInTransaction(async (trx) => {
    await repository.lockUser(trx, userId);
    const result = await repository.upsertSearches(trx, [row]);
    await repository.trimToLimit(trx, userId, MAX_RECENT_SEARCHES);
    return result;
  });

  return toItem(saved);
}

async function syncSearches(userId, searches) {
  const now = new Date();
  const candidates = normalizeGuestRows(userId, searches, now);

  if (!candidates.length) {
    return { synced: 0 };
  }

  return repository.runInTransaction(async (trx) => {
    await repository.lockUser(trx, userId);

    const existing = await repository.findExistingByHashes(
      trx,
      userId,
      candidates.map((row) => row.criteria_hash)
    );
    const existingTimes = new Map(
      existing.map(({ criteria_hash: hash, searched_at: time }) => [hash, new Date(time).getTime()])
    );

    // A guest timestamp never overwrites a newer stored one
    const rows = candidates.filter(
      (row) => row.searched_at.getTime() > (existingTimes.get(row.criteria_hash) ?? 0)
    );

    if (rows.length) {
      await repository.upsertSearches(trx, rows);
    }
    await repository.trimToLimit(trx, userId, MAX_RECENT_SEARCHES);

    return { synced: rows.length };
  });
}

async function listSearches(userId, { limit }) {
  const [rows, total] = await Promise.all([
    repository.findSearches(userId, limit),
    repository.countSearches(userId),
  ]);

  return { items: rows.map(toItem), total };
}

async function deleteSearch(userId, id) {
  const deleted = await repository.deleteSearch(userId, id);
  if (!deleted) {
    throw new AppError("Recent search not found", 404);
  }
}

async function clearSearches(userId) {
  await repository.deleteAllSearches(userId);
}

module.exports = { recordSearch, syncSearches, listSearches, deleteSearch, clearSearches };
