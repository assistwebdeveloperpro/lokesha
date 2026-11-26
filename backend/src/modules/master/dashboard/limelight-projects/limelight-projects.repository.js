const { db } = require("../../../../config/db");
const { PRICE_MIN_SQL, PRICE_MAX_SQL } = require("../../../landing/property-search/property-search.filters");
const { BUILDER_LISTED_BY } = require("./limelight-projects.constants");
const { havingAllConditions } = require("./limelight-projects.filters");

const firstOf = (column, alias) => db.raw(`(array_agg(${column} order by p.listing_number))[1] as ${alias}`);

// Published builder properties, the only ones a project can be featured through
function eligibleQuery() {
  return db("properties as p")
    .join("builder_projects as bp", "bp.id", "p.builder_project_id")
    .leftJoin("builder_listing_details as bld", "bld.property_id", "p.id")
    .where("p.status", "published")
    .whereIn("p.listed_by", BUILDER_LISTED_BY);
}

async function findEligibleProjects(filters, { limit, offset }) {
  const query = eligibleQuery()
    .leftJoin("limelight_projects as lp", "lp.builder_project_id", "bp.id")
    .groupBy("bp.id", "lp.id")
    .select(
      "bp.id as project_id",
      "bp.project_name",
      "bp.developer_name",
      db.raw("(lp.id is not null) as already_added"),
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

// Every featured project with whether it still has a published property
async function findEntries() {
  return db("limelight_projects as lp")
    .join("builder_projects as bp", "bp.id", "lp.builder_project_id")
    .leftJoin("properties as p", "p.builder_project_id", "bp.id")
    .leftJoin("builder_listing_details as bld", function joinDetails() {
      this.on("bld.property_id", "p.id").andOn(db.raw("p.status = 'published'"));
    })
    .groupBy("lp.id", "bp.id")
    .select(
      "bp.id as project_id",
      "bp.project_name",
      "bp.developer_name",
      "lp.sort_order",
      db.raw("count(p.id) filter (where p.status = 'published') > 0 as is_visible"),
      firstOf("p.locality", "locality"),
      firstOf("p.city", "city"),
      db.raw("array_agg(p.id order by p.listing_number) filter (where p.id is not null) as member_ids"),
      db.raw(`min(${PRICE_MIN_SQL}) filter (where p.status = 'published') as price_min`),
      db.raw(`max(${PRICE_MAX_SQL}) filter (where p.status = 'published') as price_max`)
    )
    .orderBy("lp.sort_order", "asc")
    .orderBy("lp.created_at", "asc");
}

async function findEligibleProjectIds(projectIds) {
  const rows = await eligibleQuery().whereIn("bp.id", projectIds).distinct("bp.id");
  return rows.map(({ id }) => id);
}

async function findMaxSortOrder(executor) {
  const row = await executor("limelight_projects").max({ max: "sort_order" }).first();
  return Number(row?.max ?? 0);
}

// Returns the project ids that were really added, already featured ones are skipped
async function insertEntries(projectIds, adminId) {
  return db.transaction(async (trx) => {
    const start = await findMaxSortOrder(trx);
    const rows = projectIds.map((projectId, index) => ({
      builder_project_id: projectId,
      sort_order: start + index + 1,
      added_by_admin_id: adminId,
    }));

    const inserted = await trx("limelight_projects")
      .insert(rows)
      .onConflict("builder_project_id")
      .ignore()
      .returning("builder_project_id");

    return inserted.map(({ builder_project_id: id }) => id);
  });
}

async function deleteEntry(projectId) {
  return db("limelight_projects").where({ builder_project_id: projectId }).del();
}

// Locks the rows so two admins cannot save an order at the same moment
async function replaceOrder(projectIds) {
  return db.transaction(async (trx) => {
    const current = await trx("limelight_projects").forUpdate().select("builder_project_id");
    const currentIds = new Set(current.map(({ builder_project_id: id }) => id));
    const isSameSet = currentIds.size === projectIds.length && projectIds.every((id) => currentIds.has(id));
    if (!isSameSet) return false;

    await Promise.all(
      projectIds.map((projectId, index) =>
        trx("limelight_projects")
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
