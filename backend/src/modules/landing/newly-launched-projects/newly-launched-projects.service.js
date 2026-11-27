const repository = require("./newly-launched-projects.repository");
const searchRepository = require("../property-search/property-search.repository");
const mapper = require("../property-search/property-search.mapper");

const toNumberOrNull = (value) => (value === null || value === undefined ? null : Number(value));

// Project cards keyed by builder project, built with the same query as the search results
async function findCardsByProject(projectIds, filters) {
  const representatives = await repository.findRepresentativeProperties(projectIds, filters);
  const idsByType = representatives.reduce((groups, { id, property_type: type }) => {
    (groups[type] ??= []).push(id);
    return groups;
  }, {});

  const cardGroups = await Promise.all(
    Object.entries(idsByType).map(([type, ids]) => searchRepository.findCardsByPropertyIds(ids, type))
  );

  const cards = new Map();
  for (const card of cardGroups.flat()) {
    if (!cards.has(card.builder_project_id)) cards.set(card.builder_project_id, card);
  }
  return cards;
}

async function listNewlyLaunchedProjects({ page, pageSize, listingType, category, city }) {
  const filters = { listingType, category, city };
  const [total, entries] = await Promise.all([
    repository.countVisibleEntries(filters),
    repository.findVisibleEntries({ limit: pageSize, offset: (page - 1) * pageSize }, filters),
  ]);

  const cards = await findCardsByProject(
    entries.map((entry) => entry.builder_project_id),
    filters
  );
  const ordered = entries.filter((entry) => cards.has(entry.builder_project_id));
  const extras = await searchRepository.findCardExtras(
    ordered.flatMap((entry) => cards.get(entry.builder_project_id).member_ids)
  );

  const items = ordered.map((entry) => ({
    ...mapper.toListing(cards.get(entry.builder_project_id), extras),
    projectAreaAcres: toNumberOrNull(entry.project_area_acres),
  }));

  return { items, page, pageSize, total };
}

module.exports = { listNewlyLaunchedProjects, findCardsByProject };
