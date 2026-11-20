/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("subscription_admin_actions", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("admin_id").nullable().references("id").inTable("admins").onDelete("SET NULL");
    table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("RESTRICT");
    table.uuid("subscription_id").nullable().references("id").inTable("user_subscriptions").onDelete("SET NULL");
    table.uuid("order_id").nullable().references("id").inTable("subscription_orders").onDelete("SET NULL");
    table.string("type", 20).notNullable();
    table.string("reason", 500).notNullable();
    table.jsonb("details").notNullable().defaultTo("{}");
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.index(["user_id", "created_at"], "subscription_admin_actions_user_idx");
  });

  await knex.raw(`
    ALTER TABLE subscription_admin_actions
      ADD CONSTRAINT subscription_admin_actions_type_check CHECK (type IN ('gift_credits','extend','refund'))
  `);
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("subscription_admin_actions");
};
