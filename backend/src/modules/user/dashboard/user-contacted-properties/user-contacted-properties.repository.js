const { db } = require("../../../../config/db");

const PUBLISHED_STATUS = "published";
const RECENT_DAYS = 7;

function leadsQuery(userId, availability = "all") {
  const query = db("property_leads as l").join("properties as p", "p.id", "l.property_id").where("l.lead_user_id", userId);

  if (availability === "available") query.andWhere("p.status", PUBLISHED_STATUS);
  if (availability === "unavailable") query.andWhere("p.status", "<>", PUBLISHED_STATUS);
  return query;
}

async function findContactedLeads(userId, { page, limit, availability }) {
  return leadsQuery(userId, availability)
    .select(
      "l.id",
      "l.property_id",
      "l.lister_role",
      "l.phone_revealed",
      "l.lister_name",
      "l.lister_mobile",
      "l.lister_listed_by",
      "l.created_at",
      "p.status",
      "p.title",
      "p.listing_number",
      "p.listing_type",
      "p.property_type",
      "p.locality",
      "p.city"
    )
    .orderBy("l.created_at", "desc")
    .orderBy("l.id", "desc")
    .limit(limit)
    .offset((page - 1) * limit);
}

async function countContactedLeads(userId, { availability }) {
  const row = await leadsQuery(userId, availability).count({ total: "l.id" }).first();
  return Number(row.total);
}

async function countContactedSummary(userId) {
  const recentSince = db.raw("now() - make_interval(days => ?)", [RECENT_DAYS]);
  const row = await leadsQuery(userId)
    .select(
      db.raw("count(*) as total"),
      db.raw("count(*) filter (where p.status = ?) as available", [PUBLISHED_STATUS]),
      db.raw("count(*) filter (where l.phone_revealed) as phones_revealed"),
      db.raw("count(*) filter (where l.created_at >= ?) as recent", [recentSince])
    )
    .first();

  return {
    total: Number(row.total),
    available: Number(row.available),
    phonesRevealed: Number(row.phones_revealed),
    recent: Number(row.recent),
  };
}

module.exports = { findContactedLeads, countContactedLeads, countContactedSummary };
