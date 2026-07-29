const { db } = require("../../../config/db");

const BUSINESS_TABLE = "user_business_details";
const CLIENTS_TABLE = "user_business_clients";

async function findByUserId(userId) {
  return db(BUSINESS_TABLE).where({ user_id: userId }).first();
}

async function findClientsByBusinessDetailId(businessDetailId) {
  return db(CLIENTS_TABLE)
    .where({ business_detail_id: businessDetailId })
    .select("id", "name", "deal_value", "created_at");
}

async function upsertBusinessDetails(userId, data, clients) {
  return db.transaction(async (trx) => {
    const existing = await trx(BUSINESS_TABLE).where({ user_id: userId }).first();

    let businessDetail;
    if (existing) {
      [businessDetail] = await trx(BUSINESS_TABLE)
        .where({ id: existing.id })
        .update({ ...data, updated_at: trx.fn.now() })
        .returning("*");
      await trx(CLIENTS_TABLE).where({ business_detail_id: existing.id }).del();
    } else {
      [businessDetail] = await trx(BUSINESS_TABLE)
        .insert({ user_id: userId, ...data })
        .returning("*");
    }

    let insertedClients = [];
    if (clients && clients.length > 0) {
      insertedClients = await trx(CLIENTS_TABLE)
        .insert(
          clients.map((client) => ({
            business_detail_id: businessDetail.id,
            name: client.name || null,
            deal_value: client.dealValue || null,
          }))
        )
        .returning(["id", "name", "deal_value"]);
    }

    return { ...businessDetail, clients: insertedClients };
  });
}

module.exports = { findByUserId, findClientsByBusinessDetailId, upsertBusinessDetails };
