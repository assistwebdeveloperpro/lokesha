/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("subscription_orders", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("order_number", 40).notNullable().unique();
    table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("RESTRICT");
    table.uuid("package_id").notNullable().references("id").inTable("subscription_packages").onDelete("RESTRICT");
    table.integer("listings").notNullable();
    table.integer("months").notNullable();
    table.integer("price_per_listing_month").notNullable();
    table.decimal("gst_percent", 5, 2).notNullable();
    table.integer("base_amount").notNullable();
    table.integer("gst_amount").notNullable();
    table.integer("total_amount").notNullable();
    table.string("status", 12).notNullable().defaultTo("created");
    table.string("razorpay_order_id", 64).nullable().unique();
    table.string("razorpay_payment_id", 64).nullable().unique();
    table.string("failure_reason", 255).nullable();
    table.string("user_gstin", 15).nullable();
    table.jsonb("snapshot").notNullable();
    table.timestamp("paid_at").nullable();
    table.timestamp("refunded_at").nullable();
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    table.index(["user_id", "status"], "subscription_orders_user_status_idx");
    table.index(["status", "created_at"], "subscription_orders_status_created_idx");
  });

  await knex.raw(`
    ALTER TABLE subscription_orders
      ADD CONSTRAINT subscription_orders_status_check CHECK (status IN ('created','pending','paid','failed','cancelled','refunded')),
      ADD CONSTRAINT subscription_orders_quantity_check CHECK (listings >= 1 AND months >= 1),
      ADD CONSTRAINT subscription_orders_amount_check CHECK (
        base_amount >= 0 AND gst_amount >= 0 AND total_amount = base_amount + gst_amount
      )
  `);
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("subscription_orders");
};
