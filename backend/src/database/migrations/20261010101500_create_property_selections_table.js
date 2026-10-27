/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("property_selections", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("property_id")
      .notNullable()
      .references("id")
      .inTable("properties")
      .onDelete("CASCADE");
    table
      .uuid("option_id")
      .notNullable()
      .references("id")
      .inTable("property_options")
      .onDelete("RESTRICT");
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.unique(["property_id", "option_id"]);
    table.index("property_id");
    table.index("option_id");
  });
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("property_selections");
};
