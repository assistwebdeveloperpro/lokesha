const AREA_UNITS = "'sq-ft','sq-m','sq-yd','sq-km'";

/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("commercial_property_variants", (table) => {
    table.uuid("variant_id").primary();
    table.string("property_type", 20).notNullable().defaultTo("commercial");
    table.decimal("carpet_area", 12, 2).nullable();
    table.string("carpet_area_unit", 10).nullable();
    table.smallint("cabins").nullable();
    table.smallint("washrooms").nullable();
    table
      .foreign(["variant_id", "property_type"])
      .references(["id", "property_type"])
      .inTable("property_variants")
      .onDelete("CASCADE");
  });

  await knex.raw(`
    ALTER TABLE commercial_property_variants
      ADD CONSTRAINT commercial_property_variants_property_type_check CHECK (property_type = 'commercial'),
      ADD CONSTRAINT commercial_property_variants_carpet_area_unit_check CHECK (
        carpet_area_unit IS NULL OR carpet_area_unit IN (${AREA_UNITS})
      ),
      ADD CONSTRAINT commercial_property_variants_cabins_check CHECK (cabins IS NULL OR cabins BETWEEN 1 AND 10),
      ADD CONSTRAINT commercial_property_variants_washrooms_check CHECK (washrooms IS NULL OR washrooms BETWEEN 1 AND 8)
  `);
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("commercial_property_variants");
};
