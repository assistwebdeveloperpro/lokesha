/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("builder_highlights", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("builder_project_id")
      .notNullable()
      .references("id")
      .inTable("builder_projects")
      .onDelete("CASCADE");
    table.string("kind", 20).notNullable();
    table.string("text", 255).notNullable();
    table.string("distance", 50).nullable();
    table.integer("sort_order").notNullable().defaultTo(0);
    table.index(["builder_project_id", "kind", "sort_order"]);
  });

  await knex.raw(`
    ALTER TABLE builder_highlights
      ADD CONSTRAINT builder_highlights_kind_check CHECK (kind IN ('project-highlight','prime-location')),
      ADD CONSTRAINT builder_highlights_distance_check CHECK (distance IS NULL OR kind = 'prime-location')
  `);
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("builder_highlights");
};
