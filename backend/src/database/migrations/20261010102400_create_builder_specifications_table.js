/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("builder_specifications", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("property_id")
      .notNullable()
      .references("id")
      .inTable("properties")
      .onDelete("CASCADE");
    table.string("group_title", 100).notNullable();
    table.string("label", 150).notNullable();
    table.string("value", 500).notNullable();
    table.boolean("is_custom").notNullable().defaultTo(false);
    table.integer("sort_order").notNullable().defaultTo(0);
    table.index(["property_id", "sort_order"]);
  });
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("builder_specifications");
};
