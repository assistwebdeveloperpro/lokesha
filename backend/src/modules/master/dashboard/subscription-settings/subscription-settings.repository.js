const { db } = require("../../../../config/db");

const TABLE = "subscription_settings";
const COLUMNS = ["legal_name", "address", "gstin", "sac_code", "invoice_prefix", "credit_note_prefix", "updated_at"];

async function findSettings() {
  return db(TABLE).where({ id: 1 }).first(COLUMNS);
}

// The table holds one row, so the update also creates it when missing
async function saveSettings(columns) {
  const [settings] = await db(TABLE)
    .insert({ id: 1, ...columns })
    .onConflict("id")
    .merge({ ...columns, updated_at: db.fn.now() })
    .returning(COLUMNS);
  return settings;
}

module.exports = { findSettings, saveSettings };
