/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("subscription_credit_ledger", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("subscription_id").notNullable().references("id").inTable("user_subscriptions").onDelete("RESTRICT");
    table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("RESTRICT");
    table.string("type", 15).notNullable();
    table.integer("credits").notNullable();
    table.uuid("property_id").nullable().references("id").inTable("properties").onDelete("SET NULL");
    table.string("reason", 255).nullable();
    table.uuid("admin_id").nullable().references("id").inTable("admins").onDelete("SET NULL");
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.index(["subscription_id", "created_at"], "subscription_credit_ledger_subscription_idx");
    table.index(["user_id", "created_at"], "subscription_credit_ledger_user_idx");
  });

  await knex.raw(`
    ALTER TABLE subscription_credit_ledger
      ADD CONSTRAINT subscription_credit_ledger_type_check CHECK (type IN ('granted','used','expired','admin_added','cancelled')),
      ADD CONSTRAINT subscription_credit_ledger_credits_check CHECK (credits <> 0)
  `);
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("subscription_credit_ledger");
};
