const { db } = require("../../../../config/db");

// Only verified leads the admin has sent to this lister are ever visible
function sentLeadsQuery(userId) {
  return db("property_leads as l")
    .join("properties as p", "p.id", "l.property_id")
    .where({ "l.lister_user_id": userId, "l.distribution_status": "sent", "l.verification_status": "verified" });
}

async function findSentLeads(userId, { page, limit }) {
  return sentLeadsQuery(userId)
    .select(
      "l.id",
      "l.property_id",
      "l.lister_role",
      "l.phone_revealed",
      "l.lead_name",
      "l.lead_mobile",
      "l.lead_email",
      "l.sent_at",
      "l.created_at",
      "p.status",
      "p.title",
      "p.listing_number",
      "p.listing_type",
      "p.property_type",
      "p.locality",
      "p.city"
    )
    .orderBy("l.sent_at", "desc")
    .orderBy("l.id", "desc")
    .limit(limit)
    .offset((page - 1) * limit);
}

async function countSentLeads(userId) {
  const row = await sentLeadsQuery(userId).count({ total: "l.id" }).first();
  return Number(row.total);
}

// Leads listed before this one in sent_at desc, id desc order; null when it is not the user's lead
async function countLeadsBefore(userId, leadId) {
  const ranked = sentLeadsQuery(userId)
    .select("l.id", db.raw("row_number() over (order by l.sent_at desc, l.id desc) as position"))
    .as("ranked");

  const row = await db.from(ranked).where("ranked.id", leadId).first("ranked.position");
  return row ? Number(row.position) - 1 : null;
}

module.exports = { findSentLeads, countSentLeads, countLeadsBefore };
