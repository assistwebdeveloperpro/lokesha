/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("builder_projects", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("user_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("RESTRICT");
    table.string("project_name", 150).notNullable();
    table.string("project_type", 20).nullable();
    table.string("developer_name", 150).nullable();
    table.date("launch_date").nullable();
    table.integer("total_units").nullable();
    table.integer("total_blocks").nullable();
    table.decimal("project_area_acres", 12, 2).nullable();
    table.decimal("open_space_percent", 5, 2).nullable();
    table.string("approved_by", 150).nullable();
    table.string("rera_link", 500).nullable();
    table.string("virtual_tour_link", 500).nullable();
    table.string("video_link", 500).nullable();
    table.string("payment_plan", 30).nullable();
    table.text("approved_banks").nullable();
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    table.index("user_id");
  });

  await knex.raw(`
    ALTER TABLE builder_projects
      ADD CONSTRAINT builder_projects_project_type_check CHECK (project_type IS NULL OR project_type IN (
        'new-launch','under-construction','ready','completed'
      )),
      ADD CONSTRAINT builder_projects_payment_plan_check CHECK (payment_plan IS NULL OR payment_plan IN (
        'construction-linked','down-payment','flexi-payment','possession-linked'
      )),
      ADD CONSTRAINT builder_projects_total_units_check CHECK (total_units IS NULL OR total_units > 0),
      ADD CONSTRAINT builder_projects_total_blocks_check CHECK (total_blocks IS NULL OR total_blocks > 0),
      ADD CONSTRAINT builder_projects_open_space_percent_check CHECK (
        open_space_percent IS NULL OR open_space_percent BETWEEN 0 AND 100
      )
  `);
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("builder_projects");
};
