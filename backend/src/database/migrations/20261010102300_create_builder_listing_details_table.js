/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("builder_listing_details", (table) => {
    table
      .uuid("property_id")
      .primary()
      .references("id")
      .inTable("properties")
      .onDelete("CASCADE");
    table.string("area_unit", 10).nullable();
    table.decimal("avg_price", 14, 2).nullable();
    table.decimal("project_size", 12, 2).nullable();
    table.decimal("price_per_sqft", 12, 2).nullable();
    table.decimal("price_min", 14, 2).nullable();
    table.decimal("price_max", 14, 2).nullable();
    table.decimal("carpet_area_max", 12, 2).nullable();
    table.decimal("super_built_up_max", 12, 2).nullable();
    table.decimal("plot_area_max", 12, 2).nullable();
    table.decimal("terrace_area_max", 12, 2).nullable();
    table.decimal("distance_from_city_km", 8, 2).nullable();
    table.string("conversion_status", 15).nullable();
    table.boolean("na_conversion_done").nullable();
    table.decimal("storage_capacity_tons", 12, 2).nullable();
    table.decimal("power_load_kva", 10, 2).nullable();
    table.smallint("loading_bays").nullable();
    table.decimal("clear_height_ft", 6, 2).nullable();
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
  });

  await knex.raw(`
    ALTER TABLE builder_listing_details
      ADD CONSTRAINT builder_listing_details_area_unit_check CHECK (
        area_unit IS NULL OR area_unit IN ('sq-ft','sq-m','sq-yd','sq-km','acres','guntha','bigha')
      ),
      ADD CONSTRAINT builder_listing_details_conversion_status_check CHECK (
        conversion_status IS NULL OR conversion_status IN ('converted','not-converted','in-process')
      ),
      ADD CONSTRAINT builder_listing_details_price_range_check CHECK (
        price_min IS NULL OR price_max IS NULL OR price_min <= price_max
      ),
      ADD CONSTRAINT builder_listing_details_loading_bays_check CHECK (loading_bays IS NULL OR loading_bays >= 0)
  `);
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("builder_listing_details");
};
