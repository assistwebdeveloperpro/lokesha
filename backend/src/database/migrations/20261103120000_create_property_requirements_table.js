/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("property_requirements", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.string("listing_type", 12).notNullable();
    table.string("property_type", 20).notNullable();
    table.string("city", 100).notNullable();
    table.specificType("localities", "text[]").notNullable().defaultTo("{}");
    table.specificType("sub_types", "text[]").notNullable().defaultTo("{}");
    table.text("requirement").notNullable();
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());

    table.index("user_id");
    table.index("city");
    table.index("created_at");
  });

  await knex.raw(`
    ALTER TABLE property_requirements
      ADD CONSTRAINT property_requirements_listing_type_check CHECK (listing_type IN ('sale','rent-lease'))
  `);
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("property_requirements");
};
