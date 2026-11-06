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
    .limit(limit)
    .offset((page - 1) * limit)
    .select(
      "l.id",
      "l.lister_role",
      "l.phone_revealed",
      "l.verification_status",
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

module.exports = { findLeads, countLeads };
