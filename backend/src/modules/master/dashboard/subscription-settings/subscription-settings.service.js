const repository = require("./subscription-settings.repository");

const FIELD_COLUMNS = {
  legalName: "legal_name",
  address: "address",
  gstin: "gstin",
  sacCode: "sac_code",
  invoicePrefix: "invoice_prefix",
  creditNotePrefix: "credit_note_prefix",
};

const EMPTY_SETTINGS = {
  legal_name: "",
  address: "",
  gstin: "",
  sac_code: "",
  invoice_prefix: "LOK",
  credit_note_prefix: "LOK-CN",
};

function toSettings(row) {
  return {
    legalName: row.legal_name,
    address: row.address,
    gstin: row.gstin,
    sacCode: row.sac_code,
    invoicePrefix: row.invoice_prefix,
    creditNotePrefix: row.credit_note_prefix,
    updatedAt: row.updated_at ?? null,
    isInvoiceReady: Boolean(row.legal_name && row.address && row.gstin && row.sac_code),
  };
}

async function getSettings() {
  return toSettings((await repository.findSettings()) ?? EMPTY_SETTINGS);
}

// Only invoices issued after the change use the new details, issued ones keep their own copy
async function updateSettings(input) {
  const columns = Object.fromEntries(Object.entries(input).map(([field, value]) => [FIELD_COLUMNS[field], value]));
  return toSettings(await repository.saveSettings(columns));
}

module.exports = { getSettings, updateSettings };
