const { db } = require("../../../../config/db");

function escapeIlikePattern(value) {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

function applyFilters(query, { search, role, phoneRevealed }) {
  if (role) query.where("l.lister_role", role);
  if (phoneRevealed !== undefined) query.where("l.phone_revealed", phoneRevealed);

  if (search) {
    const pattern = `%${escapeIlikePattern(search)}%`;
    query.where((builder) => {
      builder
        .where("l.lead_name", "ilike", pattern)
        .orWhere("l.lead_mobile", "ilike", pattern)
        .orWhere("l.lead_email", "ilike", pattern)
        .orWhere("l.lister_name", "ilike", pattern)
        .orWhereRaw("p.listing_number::text ilike ?", [pattern]);
    });
  }

  return query;
}

function baseQuery() {
  return db("property_leads as l").join("properties as p", "p.id", "l.property_id");
}

async function findLeads(filters) {
  const { page, limit } = filters;

  return applyFilters(baseQuery(), filters)
    .leftJoin("builder_projects as bp", "bp.id", "p.builder_project_id")
    .orderBy("l.created_at", "desc")
    .orderBy("l.id", "desc")
    .limit(limit)
    .offset((page - 1) * limit)
    .select(
      "l.id",
      "l.lister_role",
      "l.phone_revealed",
      "l.verification_status",
      "l.distribution_status",
      "l.sent_at",
      "l.lister_user_id",
      "l.lead_name",
      "l.lead_mobile",
      "l.lead_email",
      "l.lister_name",
      "l.lister_mobile",
      "l.lister_listed_by",
      "l.created_at",
      "p.id as property_id",
      "p.listing_number",
      "p.title as property_title",
      "p.property_type",
      "p.listing_type",
      "p.locality",
      "p.city",
      "bp.project_name as project_name"
    );
}

async function countLeads(filters) {
  const row = await applyFilters(baseQuery(), filters).count({ total: "l.id" }).first();
  return Number(row.total);
}

// Leads ahead of this one in the list order; null when it is missing or filtered out
async function countLeadsBefore(filters, leadId) {
  const ranked = applyFilters(baseQuery(), filters)
    .select("l.id", db.raw("row_number() over (order by l.created_at desc, l.id desc) as position"))
    .as("ranked");

  const row = await db.from(ranked).where("ranked.id", leadId).first("ranked.position");
  return row ? Number(row.position) - 1 : null;
}

// Row lock serialises concurrent sends of the same lead
async function findLeadForUpdate(trx, id) {
  return trx("property_leads as l")
    .join("properties as p", "p.id", "l.property_id")
    .leftJoin("builder_projects as bp", "bp.id", "p.builder_project_id")
    .where("l.id", id)
    .forUpdate("l")
    .first(
      "l.id",
      "l.property_id",
      "l.lister_user_id",
      "l.verification_status",
      "l.distribution_status",
      db.raw("coalesce(bp.project_name, p.title) as property_title")
    );
}

// The status guards make a second send affect no rows
async function markLeadSent(trx, id) {
  const [row] = await trx("property_leads")
    .where({ id, distribution_status: "not_sent", verification_status: "verified" })
    .update({ distribution_status: "sent", sent_at: trx.fn.now(), updated_at: trx.fn.now() })
    .returning(["id", "distribution_status", "sent_at"]);
  return row;
}

module.exports = { findLeads, countLeads, countLeadsBefore, findLeadForUpdate, markLeadSent };
