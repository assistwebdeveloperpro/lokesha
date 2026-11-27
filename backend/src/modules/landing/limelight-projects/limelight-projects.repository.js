const { db } = require("../../../config/db");
const { CATEGORY_TO_DB } = require("../property-search/property-search.constants");
const { whereCity } = require("../property-search/property-search.filters");

// Published properties of a project, narrowed by the optional listing type, category and city
function publishedProperties(filters = {}) {
  const query = db("properties as p").where("p.status", "published");
  if (filters.listingType) query.where("p.listing_type", filters.listingType);
  if (filters.category) query.where("p.property_type", CATEGORY_TO_DB[filters.category]);
  if (filters.city) whereCity(query, filters.city);
  return query;
}

// One repository per selection table, so Limelight and Featured projects share the same queries
function createProjectSelectionRepository(table) {
  // Entries whose project still has a matching published property, in the admin-set order
  function visibleEntries(filters) {
    return db(`${table} as sp`)
      .join("builder_projects as bp", "bp.id", "sp.builder_project_id")
      .whereExists(publishedProperties(filters).whereRaw("p.builder_project_id = bp.id"));
  }

  async function findVisibleEntries({ limit, offset }, filters) {
    const query = visibleEntries(filters)
      .select("sp.builder_project_id", "bp.project_area_acres")
      .orderBy("sp.sort_order", "asc")
      .orderBy("sp.created_at", "asc");

    if (limit !== undefined) query.limit(limit).offset(offset);
    return query;
  }

  async function countVisibleEntries(filters) {
    const [{ count }] = await visibleEntries(filters).count({ count: "*" });
    return Number(count);
  }

  // One matching published property per project, used to build the project card
  async function findRepresentativeProperties(projectIds, filters) {
    if (!projectIds.length) return [];

    return publishedProperties(filters)
      .whereIn("p.builder_project_id", projectIds)
      .distinctOn("p.builder_project_id")
      .select("p.id", "p.property_type", "p.builder_project_id")
      .orderBy("p.builder_project_id")
      .orderBy("p.listing_number", "asc");
  }

  return { findVisibleEntries, countVisibleEntries, findRepresentativeProperties };
}

module.exports = {
  ...createProjectSelectionRepository("limelight_projects"),
  createProjectSelectionRepository,
};
