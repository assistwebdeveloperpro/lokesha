/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("subscription_package_audit_logs", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("package_id").notNullable().references("id").inTable("subscription_packages").onDelete("CASCADE");
    table.uuid("admin_id").nullable().references("id").inTable("admins").onDelete("SET NULL");
    table.jsonb("changes").notNullable();
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.index(["package_id", "created_at"], "subscription_package_audit_logs_package_idx");
  });
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("subscription_package_audit_logs");
};
