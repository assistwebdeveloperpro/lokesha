/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("property_project_details", (table) => {
    table
      .uuid("property_id")
      .primary()
      .references("id")
      .inTable("properties")
      .onDelete("CASCADE");
    table.string("developer_name", 255).nullable();
    table.date("launch_date").nullable();
    table.integer("total_units").nullable();
    table.integer("total_blocks").nullable();
    table.decimal("project_area", 12, 2).nullable();
    table.decimal("open_space_percent", 5, 2).nullable();
    table.decimal("carpet_area_max", 12, 2).nullable();
    table.decimal("super_build_up_max", 12, 2).nullable();
    table.decimal("price_min", 14, 2).nullable();
    table.decimal("price_max", 14, 2).nullable();
    table.decimal("price_per_sqft", 14, 2).nullable();
    table.string("payment_plan", 30).nullable();
    table.string("approved_banks", 500).nullable();
    table.string("video_link", 500).nullable();
    table.jsonb("configurations").notNullable().defaultTo("[]");
    table.jsonb("available_sizes").notNullable().defaultTo("[]");
    table.jsonb("prime_location_highlights").notNullable().defaultTo("[]");
    table.jsonb("project_highlights").notNullable().defaultTo("[]");
    table.jsonb("faqs").notNullable().defaultTo("[]");
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
  });

  await knex.raw(`
    ALTER TABLE property_project_details
      ADD CONSTRAINT property_project_details_counts_check CHECK (
        (total_units IS NULL OR total_units >= 0) AND (total_blocks IS NULL OR total_blocks >= 0)
      ),
      ADD CONSTRAINT property_project_details_open_space_check CHECK (
        open_space_percent IS NULL OR (open_space_percent >= 0 AND open_space_percent <= 100)
      ),
      ADD CONSTRAINT property_project_details_amounts_check CHECK (
        (project_area IS NULL OR project_area >= 0)
        AND (carpet_area_max IS NULL OR carpet_area_max >= 0)
        AND (super_build_up_max IS NULL OR super_build_up_max >= 0)
        AND (price_min IS NULL OR price_min >= 0)
        AND (price_max IS NULL OR price_max >= 0)
        AND (price_per_sqft IS NULL OR price_per_sqft >= 0)
      ),
      ADD CONSTRAINT property_project_details_price_range_check CHECK (
        price_min IS NULL OR price_max IS NULL OR price_max >= price_min
      ),
      ADD CONSTRAINT property_project_details_payment_plan_check CHECK (
        payment_plan IS NULL OR payment_plan IN (
          'construction-linked','down-payment','flexi-payment','possession-linked'
        )
      )
  `);
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("property_project_details");
};
