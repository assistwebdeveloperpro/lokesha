const ORDER_TYPE_INDEX = "subscription_invoices_order_type_unique";

/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("subscription_invoices", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("invoice_number", 40).notNullable().unique();
    table.string("financial_year", 7).notNullable();
    table.integer("sequence").notNullable();
    table.string("type", 12).notNullable().defaultTo("invoice");
    table.uuid("parent_invoice_id").nullable().references("id").inTable("subscription_invoices").onDelete("RESTRICT");
    table.uuid("order_id").notNullable().references("id").inTable("subscription_orders").onDelete("RESTRICT");
    table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("RESTRICT");
    table.jsonb("snapshot").notNullable();
    table.timestamp("issued_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.unique(["financial_year", "type", "sequence"]);
    table.index(["user_id", "issued_at"], "subscription_invoices_user_issued_idx");
  });

  await knex.raw(`
    ALTER TABLE subscription_invoices
      ADD CONSTRAINT subscription_invoices_type_check CHECK (type IN ('invoice','credit_note')),
      ADD CONSTRAINT subscription_invoices_sequence_check CHECK (sequence >= 1),
      ADD CONSTRAINT subscription_invoices_parent_check CHECK ((type = 'credit_note') = (parent_invoice_id IS NOT NULL))
  `);

  // One invoice and one credit note per order
  await knex.raw(`CREATE UNIQUE INDEX ${ORDER_TYPE_INDEX} ON subscription_invoices (order_id, type)`);
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.raw(`DROP INDEX IF EXISTS ${ORDER_TYPE_INDEX}`);
  await knex.schema.dropTableIfExists("subscription_invoices");
};
