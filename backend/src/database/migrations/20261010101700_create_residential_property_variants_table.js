const AREA_UNITS = "'sq-ft','sq-m','sq-yd','sq-km'";

/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("residential_property_variants", (table) => {
    table.uuid("variant_id").primary();
    table.string("property_type", 20).notNullable().defaultTo("residential");
    table.smallint("bhk").nullable();
    table.smallint("bathrooms").nullable();
    table.decimal("carpet_area", 12, 2).nullable();
    table.string("carpet_area_unit", 10).nullable();
    table.decimal("super_built_up_area", 12, 2).nullable();
    table.string("super_built_up_area_unit", 10).nullable();
    table
      .foreign(["variant_id", "property_type"])
      .references(["id", "property_type"])
      .inTable("property_variants")
      .onDelete("CASCADE");
  });

  await knex.raw(`
    ALTER TABLE residential_property_variants
      ADD CONSTRAINT residential_property_variants_property_type_check CHECK (property_type = 'residential'),
      ADD CONSTRAINT residential_property_variants_bhk_check CHECK (bhk IS NULL OR bhk BETWEEN 1 AND 10),
      ADD CONSTRAINT residential_property_variants_bathrooms_check CHECK (bathrooms IS NULL OR bathrooms BETWEEN 1 AND 10),
      ADD CONSTRAINT residential_property_variants_carpet_area_unit_check CHECK (
        carpet_area_unit IS NULL OR carpet_area_unit IN (${AREA_UNITS})
      ),
      ADD CONSTRAINT residential_property_variants_super_built_up_area_unit_check CHECK (
        super_built_up_area_unit IS NULL OR super_built_up_area_unit IN (${AREA_UNITS})
      )
  `);
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("residential_property_variants");
};
