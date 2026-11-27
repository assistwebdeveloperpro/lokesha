const { db } = require("../../../../config/db");
const { PRICE_MIN_SQL, PRICE_MAX_SQL } = require("../../../landing/property-search/property-search.filters");
const { BUILDER_LISTED_BY, ICONIC_PROPERTY_TYPE } = require("./iconic-projects.constants");
const { havingAllConditions } = require("./iconic-projects.filters");

const TABLE = "iconic_projects";

const firstOf = (column, alias) => db.raw(`(array_agg(${column} order by p.listing_number))[1] as ${alias}`);

// Published residential builder properties, the only ones a project can be made iconic through
function eligibleQuery() {
  return db("properties as p")
    .join("builder_projects as bp", "bp.id", "p.builder_project_id")
    .leftJoin("builder_listing_details as bld", "bld.property_id", "p.id")
    .where("p.status", "published")
    .where("p.property_type", ICONIC_PROPERTY_TYPE)
    .whereIn("p.listed_by", BUILDER_LISTED_BY);
}

async function findEligibleProjects(filters, { limit, offset }) {
  const query = eligibleQuery()
    .leftJoin(`${TABLE} as sp`, "sp.builder_project_id", "bp.id")
    .groupBy("bp.id", "sp.id")
    .select(
      "bp.id as project_id",
      "bp.project_name",
      "bp.developer_name",
      db.raw("(sp.id is not null) as already_added"),
      firstOf("p.locality", "locality"),
      firstOf("p.city", "city"),
      firstOf("p.listed_by", "listed_by"),
      firstOf("p.construction_status", "construction_status"),
      db.raw("min(p.listing_number) as listing_number"),
      db.raw("array_agg(p.id order by p.listing_number) as member_ids"),
      db.raw(`min(${PRICE_MIN_SQL}) as price_min`),
      db.raw(`max(${PRICE_MAX_SQL}) as price_max`)
    )
    .orderByRaw("max(coalesce(p.published_at, p.created_at)) desc")
    .orderBy("bp.id")
    .limit(limit)
    .offset(offset);

  return havingAllConditions(query, filters);
}

async function countEligibleProjects(filters) {
  const matches = havingAllConditions(eligibleQuery().groupBy("bp.id").select("bp.id"), filters);
  const [{ count }] = await db.from(matches.as("matches")).count({ count: "*" });
  return Number(count);
}

// Every selected project with whether it still has a published property
async function findEntries() {
  return db(`${TABLE} as sp`)
    .join("builder_projects as bp", "bp.id", "sp.builder_project_id")
    .leftJoin("properties as p", "p.builder_project_id", "bp.id")
    .leftJoin("builder_listing_details as bld", function joinDetails() {
      this.on("bld.property_id", "p.id").andOn(db.raw("p.status = 'published'"));
    })
    .groupBy("sp.id", "bp.id")
    .select(
      "bp.id as project_id",
      "bp.project_name",
      "bp.developer_name",
      "sp.sort_order",
      db.raw("count(p.id) filter (where p.status = 'published') > 0 as is_visible"),
      firstOf("p.locality", "locality"),
      firstOf("p.city", "city"),
      db.raw("array_agg(p.id order by p.listing_number) filter (where p.id is not null) as member_ids"),
      db.raw(`min(${PRICE_MIN_SQL}) filter (where p.status = 'published') as price_min`),
      db.raw(`max(${PRICE_MAX_SQL}) filter (where p.status = 'published') as price_max`)
    )
    .orderBy("sp.sort_order", "asc")
    .orderBy("sp.created_at", "asc");
}

async function findEligibleProjectIds(projectIds) {
  const rows = await eligibleQuery().whereIn("bp.id", projectIds).distinct("bp.id");
  return rows.map(({ id }) => id);
}

async function findMaxSortOrder(executor) {
  const row = await executor(TABLE).max({ max: "sort_order" }).first();
  return Number(row?.max ?? 0);
}

// Returns the project ids that were really added, already selected ones are skipped
async function insertEntries(projectIds) {
  return db.transaction(async (trx) => {
    const start = await findMaxSortOrder(trx);
    const rows = projectIds.map((projectId, index) => ({
      builder_project_id: projectId,
      sort_order: start + index + 1,
    }));

    const inserted = await trx(TABLE)
      .insert(rows)
      .onConflict("builder_project_id")
      .ignore()
      .returning("builder_project_id");

    return inserted.map(({ builder_project_id: id }) => id);
  });
}

async function deleteEntry(projectId) {
  return db(TABLE).where({ builder_project_id: projectId }).del();
}

// Locks the rows so two admins cannot save an order at the same moment
async function replaceOrder(projectIds) {
  return db.transaction(async (trx) => {
    const current = await trx(TABLE).forUpdate().select("builder_project_id");
    const currentIds = new Set(current.map(({ builder_project_id: id }) => id));
    const isSameSet = currentIds.size === projectIds.length && projectIds.every((id) => currentIds.has(id));
    if (!isSameSet) return false;

    await Promise.all(
      projectIds.map((projectId, index) =>
        trx(TABLE)
          .where({ builder_project_id: projectId })
          .update({ sort_order: index + 1, updated_at: trx.fn.now() })
      )
    );
    return true;
  });
}

module.exports = {
  findEligibleProjects,
  countEligibleProjects,
  findEntries,
  findEligibleProjectIds,
  insertEntries,
  deleteEntry,
  replaceOrder,
};
