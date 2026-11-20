const { toIstShifted } = require("./subscription-dates.util");

const FY_START_MONTH_INDEX = 3;
const SEQUENCE_WIDTH = 6;

// Indian financial year runs 1 April to 31 March in IST, e.g. 2026-27
function getFinancialYear(date = new Date()) {
  const ist = toIstShifted(date);
  const startYear = ist.getUTCMonth() >= FY_START_MONTH_INDEX ? ist.getUTCFullYear() : ist.getUTCFullYear() - 1;
  return `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;
}

// e.g. LOK/2026-27/000123
function formatInvoiceNumber({ prefix, financialYear, sequence }) {
  if (!Number.isInteger(sequence) || sequence < 1) throw new RangeError("sequence must be a positive integer");
  return `${prefix}/${financialYear}/${String(sequence).padStart(SEQUENCE_WIDTH, "0")}`;
}

module.exports = { getFinancialYear, formatInvoiceNumber };
