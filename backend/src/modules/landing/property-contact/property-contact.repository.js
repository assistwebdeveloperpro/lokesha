const { db } = require("../../../config/db");

async function findPublishedPropertyWithLister(propertyId) {
  return db("properties as p")
    .leftJoin("users as u", "u.id", "p.user_id")
    .leftJoin("admins as a", "a.id", "p.admin_id")
    .leftJoin("property_owner_contacts as oc", "oc.property_id", "p.id")
    .where("p.id", propertyId)
    .andWhere("p.status", "published")
    .first(
      "p.id",
      "p.user_id",
      "p.admin_id",
      "p.listed_by",
      "u.name as user_name",
      "u.mobile_number as user_mobile",
      "a.name as admin_name",
      "a.mobile_number as admin_mobile",
      "oc.full_name as owner_name",
      "oc.mobile_number as owner_mobile"
    );
}

async function findUserById(userId) {
  return db("users").where({ id: userId }).first("id", "name", "email", "mobile_number");
}

async function lockUserLeads(userId, trx) {
  await trx.raw("SELECT pg_advisory_xact_lock(hashtext(?))", [`property_leads:${userId}`]);
}

async function findLead(userId, propertyId, trx = db) {
  return trx("property_leads").where({ lead_user_id: userId, property_id: propertyId }).first();
}

async function findContactedPropertyIds(userId) {
  const rows = await db("property_leads").where({ lead_user_id: userId }).select("property_id");
  return rows.map((row) => row.property_id);
}

async function countRevealedLeads(userId, { before, trx = db } = {}) {
  const query = trx("property_leads").where({ lead_user_id: userId, phone_revealed: true });
  if (before) query.andWhere("created_at", "<", before);

  const row = await query.count({ total: "id" }).first();
  return Number(row.total);
}

async function insertLead(row, trx = db) {
  const [lead] = await trx("property_leads").insert(row).returning("*");
  return lead;
}

module.exports = {
  findPublishedPropertyWithLister,
  findUserById,
  lockUserLeads,
  findLead,
  findContactedPropertyIds,
  countRevealedLeads,
  insertLead,
};
