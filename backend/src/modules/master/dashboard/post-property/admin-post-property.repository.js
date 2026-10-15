const { db } = require("../../../../config/db");

const PROJECT_DETAILS = "property_project_details";
const FLOOR_PLANS = "property_floor_plans";

function conn(trx) {
  return trx || db;
}

async function insertProjectDetails(propertyId, data, trx) {
  const [row] = await conn(trx)(PROJECT_DETAILS)
    .insert({ property_id: propertyId, ...data })
    .returning("*");
  return row;
}

async function insertFloorPlans(propertyId, rows, trx) {
  if (!rows.length) return [];

  return conn(trx)(FLOOR_PLANS)
    .insert(rows.map((row) => ({ property_id: propertyId, ...row })))
    .returning("*");
}

// All uploaded file paths owned by an admin's properties
async function findFilePathsByAdminId(adminId, trx) {
  const propertyIds = conn(trx)("properties").where({ admin_id: adminId }).select("id");

  const [media, floorPlans, brochures] = await Promise.all([
    conn(trx)("property_media").whereIn("property_id", propertyIds).select("file_path"),
    conn(trx)(FLOOR_PLANS).whereIn("property_id", propertyIds).select("file_path"),
    conn(trx)("properties").where({ admin_id: adminId }).whereNotNull("brochure_path").select("brochure_path"),
  ]);

  return [
    ...media.map((row) => row.file_path),
    ...floorPlans.map((row) => row.file_path),
    ...brochures.map((row) => row.brochure_path),
  ];
}

// Properties and child rows are removed by the admin_id FK cascade
async function deleteAdmin(adminId, trx) {
  return conn(trx)("admins").where({ id: adminId }).del();
}

module.exports = {
  insertProjectDetails,
  insertFloorPlans,
  findFilePathsByAdminId,
  deleteAdmin,
};
