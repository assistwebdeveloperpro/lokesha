/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.alterTable("builder_projects", (table) => {
    table.uuid("user_id").nullable().alter();
    table
      .uuid("admin_id")
      .nullable()
      .references("id")
      .inTable("admins")
      .onDelete("RESTRICT");
    table.index("admin_id");
  });

  await knex.raw(`
    ALTER TABLE builder_projects
      ADD CONSTRAINT builder_projects_owner_check CHECK (num_nonnulls(user_id, admin_id) = 1)
  `);
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.raw("ALTER TABLE builder_projects DROP CONSTRAINT IF EXISTS builder_projects_owner_check");

  await knex.schema.alterTable("builder_projects", (table) => {
    table.dropIndex("admin_id");
    table.dropColumn("admin_id");
  });
};
