/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("property_options", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("option_group", 30).notNullable();
    table.string("option_key", 50).notNullable();
    table.string("name", 100).notNullable();
    table.string("image_path", 255).nullable();
    table.integer("sort_order").notNullable().defaultTo(0);
    table.boolean("is_active").notNullable().defaultTo(true);
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    table.unique(["option_group", "option_key"]);
  });

  await knex.raw(`
    ALTER TABLE property_options
      ADD CONSTRAINT property_options_option_group_check CHECK (option_group IN (
        'tenant_preference','food','pg_rule','occupancy','business_type',
        'terrace_entry','infrastructure','irrigation_source'
      ))
  `);
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("property_options");
};
