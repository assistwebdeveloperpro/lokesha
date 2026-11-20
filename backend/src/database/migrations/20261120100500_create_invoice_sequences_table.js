/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("invoice_sequences", (table) => {
    table.string("financial_year", 7).notNullable();
    table.string("type", 12).notNullable();
    table.integer("last_value").notNullable().defaultTo(0);
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    table.primary(["financial_year", "type"]);
  });

  await knex.raw(`
    ALTER TABLE invoice_sequences
      ADD CONSTRAINT invoice_sequences_type_check CHECK (type IN ('invoice','credit_note')),
      ADD CONSTRAINT invoice_sequences_last_value_check CHECK (last_value >= 0)
  `);
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("invoice_sequences");
};
