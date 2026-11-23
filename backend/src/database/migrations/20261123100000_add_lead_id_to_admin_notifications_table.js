/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.alterTable("admin_notifications", (table) => {
    table.uuid("lead_id").nullable().references("id").inTable("property_leads").onDelete("SET NULL");
    table.index("lead_id");
  });
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.alterTable("admin_notifications", (table) => {
    table.dropIndex("lead_id");
    table.dropColumn("lead_id");
  });
};
