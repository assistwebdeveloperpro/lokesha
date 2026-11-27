/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("featured_projects", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("builder_project_id")
      .notNullable()
      .unique()
      .references("id")
      .inTable("builder_projects")
      .onDelete("CASCADE");
    table.integer("sort_order").notNullable();
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    table.index("sort_order");
  });

  await knex.raw("ALTER TABLE featured_projects ADD CONSTRAINT featured_projects_sort_order_check CHECK (sort_order > 0)");
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("featured_projects");
};
