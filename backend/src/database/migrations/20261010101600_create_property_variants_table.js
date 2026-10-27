/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("property_variants", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("property_id").notNullable();
    table.string("property_type", 20).notNullable();
    table.uuid("property_sub_type_id").notNullable();
    table.string("label", 100).nullable();
    table.decimal("size", 12, 2).nullable();
    table.string("size_unit", 10).nullable();
    table.decimal("price", 14, 2).nullable();
    table.integer("units_available").nullable();
    table.integer("sort_order").notNullable().defaultTo(0);
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    table.unique(["id", "property_type"]);
    table
      .foreign(["property_id", "property_type"])
      .references(["id", "property_type"])
      .inTable("properties")
      .onDelete("CASCADE");
    table
      .foreign(["property_sub_type_id", "property_type"])
      .references(["id", "property_type"])
      .inTable("property_sub_types")
      .onDelete("RESTRICT");
    table.index(["property_id", "sort_order"]);
  });

  await knex.raw(`
    ALTER TABLE property_variants
      ADD CONSTRAINT property_variants_size_unit_check CHECK (
        size_unit IS NULL OR size_unit IN ('sq-ft','sq-m','sq-yd','sq-km','acres','guntha','bigha')
      ),
      ADD CONSTRAINT property_variants_size_check CHECK (size IS NULL OR size > 0),
      ADD CONSTRAINT property_variants_price_check CHECK (price IS NULL OR price > 0),
      ADD CONSTRAINT property_variants_units_available_check CHECK (units_available IS NULL OR units_available >= 0)
  `);
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("property_variants");
};
