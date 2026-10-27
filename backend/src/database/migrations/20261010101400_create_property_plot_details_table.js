const LAND_AREA_UNITS = "'sq-ft','sq-m','sq-yd','sq-km','acres','guntha','bigha'";

/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("property_plot_details", (table) => {
    table
      .uuid("property_id")
      .primary()
      .references("id")
      .inTable("properties")
      .onDelete("CASCADE");
    table.decimal("plot_area", 12, 2).nullable();
    table.string("plot_area_unit", 10).nullable();
    table.decimal("plot_length", 12, 2).nullable();
    table.string("plot_length_unit", 10).nullable();
    table.decimal("plot_breadth", 12, 2).nullable();
    table.string("plot_breadth_unit", 10).nullable();
    table.decimal("road_width_m", 6, 2).nullable();
    table.smallint("floors_allowed").nullable();
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
  });

  await knex.raw(`
    ALTER TABLE property_plot_details
      ADD CONSTRAINT property_plot_details_plot_area_unit_check CHECK (
        plot_area_unit IS NULL OR plot_area_unit IN (${LAND_AREA_UNITS})
      ),
      ADD CONSTRAINT property_plot_details_plot_length_unit_check CHECK (
        plot_length_unit IS NULL OR plot_length_unit IN (${LAND_AREA_UNITS})
      ),
      ADD CONSTRAINT property_plot_details_plot_breadth_unit_check CHECK (
        plot_breadth_unit IS NULL OR plot_breadth_unit IN (${LAND_AREA_UNITS})
      ),
      ADD CONSTRAINT property_plot_details_plot_area_check CHECK (plot_area IS NULL OR plot_area > 0),
      ADD CONSTRAINT property_plot_details_road_width_check CHECK (road_width_m IS NULL OR road_width_m > 0),
      ADD CONSTRAINT property_plot_details_floors_allowed_check CHECK (
        floors_allowed IS NULL OR floors_allowed BETWEEN 0 AND 50
      )
  `);
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("property_plot_details");
};
