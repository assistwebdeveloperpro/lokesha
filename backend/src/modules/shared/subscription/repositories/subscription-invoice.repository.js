const { db } = require("../../../../config/db");

const INVOICES_TABLE = "subscription_invoices";
const SEQUENCES_TABLE = "invoice_sequences";
const SETTINGS_TABLE = "subscription_settings";


async function takeNextSequence(trx, financialYear, type) {
  const [{ last_value: sequence }] = await trx(SEQUENCES_TABLE)
    .insert({ financial_year: financialYear, type, last_value: 1 })
    .onConflict(["financial_year", "type"])
    .merge({ last_value: trx.raw(`${SEQUENCES_TABLE}.last_value + 1`), updated_at: trx.fn.now() })
    .returning("last_value");
  return sequence;
}

// Insert only: no update path exists, an issued invoice is never edited
async function insertInvoice(trx, row) {
  const [invoice] = await trx(INVOICES_TABLE).insert(row).returning("*");
  return invoice;
}

async function findInvoiceByOrder(trx, orderId, type) {
  return trx(INVOICES_TABLE).where({ order_id: orderId, type }).first();
}

async function findInvoiceById(id) {
  return db(INVOICES_TABLE).where({ id }).first();
}

// Scoped to the owner, so a user never reads another user's invoice
async function findInvoiceForUser(userId, id) {
  return db(INVOICES_TABLE).where({ id, user_id: userId }).first();
}

async function findSettings(trx) {
  return trx(SETTINGS_TABLE).where({ id: 1 }).first();
}

async function findBuyer(trx, userId) {
  return trx("users").where({ id: userId }).first("name", "email", "mobile_number");
}

module.exports = {
  takeNextSequence,
  insertInvoice,
  findInvoiceByOrder,
  findInvoiceById,
  findInvoiceForUser,
  findSettings,
  findBuyer,
};
