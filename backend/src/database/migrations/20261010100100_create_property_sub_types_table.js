/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("property_sub_types", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .string("property_type", 20)
      .notNullable()
      .references("slug")
      .inTable("property_types")
      .onDelete("RESTRICT");
    table.string("slug", 40).notNullable();
    table.string("name", 80).notNullable();
    table.integer("sort_order").notNullable().defaultTo(0);
    table.boolean("is_active").notNullable().defaultTo(true);
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    table.unique(["property_type", "slug"]);
    table.unique(["id", "property_type"]);
  });
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("property_sub_types");
};
