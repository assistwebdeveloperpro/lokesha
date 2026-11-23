const repository = require("./subscription-packages.repository");
const { PACKAGE_CODES } = require("../../../shared/subscription/constants/subscription.constants");
const { AppError, validationError } = require("../../../shared/property/utils/property.errors");

const FIELD_COLUMNS = {
  name: "name",
  displayTitle: "display_title",
  description: "description",
  benefits: "benefits",
  status: "status",
  displayOrder: "display_order",
  pricePerListingMonth: "price_per_listing_month",
  pricePerLead: "price_per_lead",
  gstPercent: "gst_percent",
  minLeads: "min_leads",
  maxLeads: "max_leads",
  minListings: "min_listings",
  maxListings: "max_listings",
  minMonths: "min_months",
  maxMonths: "max_months",
  allowCustomQuantity: "allow_custom_quantity",
  allowCustomDuration: "allow_custom_duration",
  freeCredits: "free_credits",
  freeLeadLimit: "free_lead_limit",
  freePropertyValidityDays: "free_property_validity_days",
};

const FREE_GRANT_FIELDS = ["freeCredits", "freeLeadLimit", "freePropertyValidityDays"];
const LISTING_FIELDS = [
  "pricePerListingMonth",
  "minListings",
  "maxListings",
  "minMonths",
  "maxMonths",
  "allowCustomQuantity",
  "allowCustomDuration",
];
const LEAD_PACK_FIELDS = ["pricePerLead", "minLeads", "maxLeads"];

// Each package only keeps the settings that apply to it
const BLOCKED_FIELDS = {
  [PACKAGE_CODES.FREE]: {
    fields: [...LISTING_FIELDS, ...LEAD_PACK_FIELDS, "gstPercent"],
    message: "The Free package has no price or purchase limits",
  },
  [PACKAGE_CODES.STANDARD]: {
    fields: [...FREE_GRANT_FIELDS, ...LEAD_PACK_FIELDS],
    message: "This setting does not apply to the Standard package",
  },
  [PACKAGE_CODES.LEADS]: {
    fields: [...FREE_GRANT_FIELDS, ...LISTING_FIELDS],
    message: "This setting does not apply to the Buy More Leads package",
  },
};

function toPackage(row) {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    displayTitle: row.display_title,
    description: row.description ?? "",
    benefits: row.benefits,
    status: row.status,
    displayOrder: row.display_order,
    pricePerListingMonth: row.price_per_listing_month,
    pricePerLead: row.price_per_lead,
    gstPercent: Number(row.gst_percent),
    minLeads: row.min_leads,
    maxLeads: row.max_leads,
    minListings: row.min_listings,
    maxListings: row.max_listings,
    minMonths: row.min_months,
    maxMonths: row.max_months,
    allowCustomQuantity: row.allow_custom_quantity,
    allowCustomDuration: row.allow_custom_duration,
    freeCredits: row.free_credits,
    freeLeadLimit: row.free_lead_limit,
    freePropertyValidityDays: row.free_property_validity_days,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toAuditLog(row) {
  return {
    id: row.id,
    admin: row.admin_id ? { id: row.admin_id, name: row.admin_name } : null,
    changes: row.changes,
    createdAt: row.created_at,
  };
}

function assertFieldsAllowed(code, input) {
  const { fields: blocked, message } = BLOCKED_FIELDS[code];
  const fields = Object.fromEntries(blocked.filter((field) => field in input).map((field) => [field, message]));

  if (Object.keys(fields).length) throw validationError(fields);
}

// Ranges are checked on the merged values, so a one-sided edit cannot break the other side
function assertConsistent(code, merged, input) {
  const fields = {};

  if (code === PACKAGE_CODES.FREE && input.status === "inactive") {
    fields.status = "The Free package cannot be deactivated";
  }

  if (code === PACKAGE_CODES.LEADS) {
    if (merged.maxLeads < merged.minLeads) fields.maxLeads = "Maximum leads cannot be less than minimum leads";
  } else {
    if (merged.maxListings < merged.minListings) {
      fields.maxListings = "Maximum listings cannot be less than minimum listings";
    }
    if (merged.maxMonths < merged.minMonths) {
      fields.maxMonths = "Maximum months cannot be less than minimum months";
    }
  }

  if (Object.keys(fields).length) throw validationError(fields);
}

const isSame = (left, right) => JSON.stringify(left) === JSON.stringify(right);

function diffChanges(current, input) {
  return Object.fromEntries(
    Object.entries(input)
      .filter(([field, value]) => !isSame(current[field], value))
      .map(([field, value]) => [field, { from: current[field], to: value }])
  );
}

const toColumns = (changes) =>
  Object.fromEntries(
    Object.entries(changes).map(([field, { to }]) => [
      FIELD_COLUMNS[field],
      field === "benefits" ? JSON.stringify(to) : to,
    ])
  );

async function listPackages() {
  const rows = await repository.findAll();
  return { items: rows.map(toPackage) };
}

async function getPackage(id) {
  const row = await repository.findById(id);
  if (!row) throw new AppError("Package not found", 404);

  return toPackage(row);
}

// Only new purchases and new users see the change, existing orders and subscriptions keep their own snapshot
async function updatePackage(admin, id, input) {
  return repository.runInTransaction(async (trx) => {
    const row = await repository.findByIdForUpdate(trx, id);
    if (!row) throw new AppError("Package not found", 404);

    const current = toPackage(row);
    assertFieldsAllowed(current.code, input);
    assertConsistent(current.code, { ...current, ...input }, input);

    const changes = diffChanges(current, input);
    if (!Object.keys(changes).length) return current;

    const updated = await repository.updateById(trx, id, toColumns(changes));
    await repository.insertAuditLog(trx, { packageId: id, adminId: admin.id, changes });

    return toPackage(updated);
  });
}

async function listAuditLogs(id, { page, limit }) {
  await getPackage(id);

  const [rows, total] = await Promise.all([repository.findAuditLogs(id, { page, limit }), repository.countAuditLogs(id)]);
  return { items: rows.map(toAuditLog), page, limit, total };
}

module.exports = { listPackages, getPackage, updatePackage, listAuditLogs };
