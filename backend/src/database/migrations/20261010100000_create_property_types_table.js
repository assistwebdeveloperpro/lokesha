/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("property_types", (table) => {
    table.string("slug", 20).primary();
    table.string("name", 50).notNullable();
    table.integer("sort_order").notNullable().defaultTo(0);
    table.boolean("is_active").notNullable().defaultTo(true);
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
  });
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("property_types");
};
