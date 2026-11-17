/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("saved_properties", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    table
      .uuid("property_id")
      .notNullable()
      .references("id")
      .inTable("properties")
      .onDelete("CASCADE");
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());

    table.unique(["user_id", "property_id"]);
    table.index(["user_id", "created_at"]);
    table.index("property_id");
  });
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("saved_properties");
};
