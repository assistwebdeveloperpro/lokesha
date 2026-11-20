/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("subscription_packages", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("code", 20).notNullable().unique();
    table.string("name", 80).notNullable();
    table.string("display_title", 120).notNullable();
    table.text("description").nullable();
    table.jsonb("benefits").notNullable().defaultTo("[]");
    table.string("status", 10).notNullable().defaultTo("active");
    table.integer("display_order").notNullable().defaultTo(0);
    table.integer("price_per_listing_month").notNullable().defaultTo(0);
    table.decimal("gst_percent", 5, 2).notNullable().defaultTo(0);
    table.integer("min_listings").notNullable().defaultTo(1);
    table.integer("max_listings").notNullable().defaultTo(1);
    table.integer("min_months").notNullable().defaultTo(1);
    table.integer("max_months").notNullable().defaultTo(1);
    table.boolean("allow_custom_quantity").notNullable().defaultTo(false);
    table.boolean("allow_custom_duration").notNullable().defaultTo(false);
    table.integer("free_credits").nullable();
    table.integer("free_lead_limit").nullable();
    table.integer("free_property_validity_days").nullable();
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
  });

  await knex.raw(`
    ALTER TABLE subscription_packages
      ADD CONSTRAINT subscription_packages_status_check CHECK (status IN ('active','inactive')),
      ADD CONSTRAINT subscription_packages_price_check CHECK (price_per_listing_month >= 0),
      ADD CONSTRAINT subscription_packages_gst_check CHECK (gst_percent >= 0 AND gst_percent <= 100),
      ADD CONSTRAINT subscription_packages_listings_range_check CHECK (min_listings >= 1 AND max_listings >= min_listings),
      ADD CONSTRAINT subscription_packages_months_range_check CHECK (min_months >= 1 AND max_months >= min_months)
  `);
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("subscription_packages");
};
