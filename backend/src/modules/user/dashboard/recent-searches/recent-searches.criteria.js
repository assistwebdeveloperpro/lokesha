const crypto = require("crypto");

function isEmpty(value) {
  if (value === undefined || value === null || value === "") return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}

function compareValues(a, b) {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b));
}

// Canonical form: lowercase strings, sorted arrays and keys, no empty values
function normalizeValue(value) {
  if (typeof value === "string") return value.trim().toLowerCase();

  if (Array.isArray(value)) {
    return value
      .map(normalizeValue)
      .filter((item) => !isEmpty(item))
      .sort(compareValues);
  }

  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        const normalized = normalizeValue(value[key]);
        return isEmpty(normalized) ? acc : { ...acc, [key]: normalized };
      }, {});
  }

  return value;
}

function normalizeCriteria(criteria) {
  const { page, ...rest } = criteria ?? {};
  return normalizeValue(rest);
}

function buildCriteriaHash(criteria) {
  return crypto.createHash("sha256").update(JSON.stringify(normalizeCriteria(criteria))).digest("hex");
}

module.exports = { normalizeCriteria, buildCriteriaHash };
