/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("subscription_settings", (table) => {
    table.integer("id").primary().defaultTo(1);
    table.string("legal_name", 160).notNullable().defaultTo("");
    table.text("address").notNullable().defaultTo("");
    table.string("gstin", 15).notNullable().defaultTo("");
    table.string("sac_code", 12).notNullable().defaultTo("");
    table.string("invoice_prefix", 12).notNullable().defaultTo("LOK");
    table.string("credit_note_prefix", 12).notNullable().defaultTo("LOK-CN");
    table.jsonb("reminder_days").notNullable().defaultTo("[7,1]");
    table.integer("pending_recovery_minutes").notNullable().defaultTo(30);
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
  });

  // Single row table
  await knex.raw("ALTER TABLE subscription_settings ADD CONSTRAINT subscription_settings_single_row_check CHECK (id = 1)");
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("subscription_settings");
};
