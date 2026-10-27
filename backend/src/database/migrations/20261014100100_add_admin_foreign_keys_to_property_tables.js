/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.alterTable("properties", (table) => {
    table
      .foreign("admin_id", "properties_admin_id_foreign")
      .references("id")
      .inTable("admins")
      .onDelete("RESTRICT");
  });

  await knex.schema.alterTable("property_form_drafts", (table) => {
    table
      .foreign("admin_id", "property_form_drafts_admin_id_foreign")
      .references("id")
      .inTable("admins")
      .onDelete("CASCADE");
  });

  await knex.schema.alterTable("property_status_history", (table) => {
    table
      .foreign("changed_by_admin_id", "property_status_history_changed_by_admin_id_foreign")
      .references("id")
      .inTable("admins")
      .onDelete("SET NULL");
  });
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.alterTable("property_status_history", (table) => {
    table.dropForeign("changed_by_admin_id", "property_status_history_changed_by_admin_id_foreign");
  });

  await knex.schema.alterTable("property_form_drafts", (table) => {
    table.dropForeign("admin_id", "property_form_drafts_admin_id_foreign");
  });

  await knex.schema.alterTable("properties", (table) => {
    table.dropForeign("admin_id", "properties_admin_id_foreign");
  });
};
