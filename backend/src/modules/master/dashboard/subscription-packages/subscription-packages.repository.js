const { db } = require("../../../../config/db");

const PACKAGES_TABLE = "subscription_packages";
const AUDIT_TABLE = "subscription_package_audit_logs";

const runInTransaction = (callback) => db.transaction(callback);

async function findAll() {
  return db(PACKAGES_TABLE).orderBy("display_order", "asc").orderBy("created_at", "asc");
}

async function findById(id) {
  return db(PACKAGES_TABLE).where({ id }).first();
}

// Locks the row so two admins editing one package are applied one after the other
async function findByIdForUpdate(trx, id) {
  return trx(PACKAGES_TABLE).where({ id }).forUpdate().first();
}

async function updateById(trx, id, columns) {
  const [updated] = await trx(PACKAGES_TABLE)
    .where({ id })
    .update({ ...columns, updated_at: trx.fn.now() })
    .returning("*");
  return updated;
}

async function insertAuditLog(trx, { packageId, adminId, changes }) {
  await trx(AUDIT_TABLE).insert({ package_id: packageId, admin_id: adminId, changes: JSON.stringify(changes) });
}

async function findAuditLogs(packageId, { page, limit }) {
  return db(`${AUDIT_TABLE} as l`)
    .leftJoin("admins as a", "a.id", "l.admin_id")
    .where("l.package_id", packageId)
    .orderBy("l.created_at", "desc")
    .orderBy("l.id", "desc")
    .limit(limit)
    .offset((page - 1) * limit)
    .select("l.id", "l.changes", "l.created_at", "l.admin_id", "a.name as admin_name");
}

async function countAuditLogs(packageId) {
  const [{ count }] = await db(AUDIT_TABLE).where({ package_id: packageId }).count("id as count");
  return Number(count);
}

module.exports = { runInTransaction, findAll, findById, findByIdForUpdate, updateById, insertAuditLog, findAuditLogs, countAuditLogs };
