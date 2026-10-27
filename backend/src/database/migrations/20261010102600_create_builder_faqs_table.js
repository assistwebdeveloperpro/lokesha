/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("builder_faqs", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("builder_project_id")
      .notNullable()
      .references("id")
      .inTable("builder_projects")
      .onDelete("CASCADE");
    table.string("question", 300).notNullable();
    table.text("answer").notNullable();
    table.integer("sort_order").notNullable().defaultTo(0);
    table.index(["builder_project_id", "sort_order"]);
  });
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("builder_faqs");
};
