const LAND_AREA_UNITS = "'sq-ft','sq-m','sq-yd','sq-km','acres','guntha','bigha'";

/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("plot_property_variants", (table) => {
    table.uuid("variant_id").primary();
    table.string("property_type", 20).notNullable().defaultTo("plot");
    table.decimal("plot_length", 12, 2).nullable();
    table.string("plot_length_unit", 10).nullable();
    table.decimal("plot_breadth", 12, 2).nullable();
    table.string("plot_breadth_unit", 10).nullable();
    table.string("facing", 15).nullable();
    table
      .foreign(["variant_id", "property_type"])
      .references(["id", "property_type"])
      .inTable("property_variants")
      .onDelete("CASCADE");
  });

  await knex.raw(`
    ALTER TABLE plot_property_variants
      ADD CONSTRAINT plot_property_variants_property_type_check CHECK (property_type = 'plot'),
      ADD CONSTRAINT plot_property_variants_plot_length_unit_check CHECK (
        plot_length_unit IS NULL OR plot_length_unit IN (${LAND_AREA_UNITS})
      ),
      ADD CONSTRAINT plot_property_variants_plot_breadth_unit_check CHECK (
        plot_breadth_unit IS NULL OR plot_breadth_unit IN (${LAND_AREA_UNITS})
      ),
      ADD CONSTRAINT plot_property_variants_facing_check CHECK (facing IS NULL OR facing IN (
        'east','west','north','south','north-east','north-west','south-east','south-west'
      ))
  `);
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("plot_property_variants");
};
