/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("pg_property_variants", (table) => {
    table.uuid("variant_id").primary();
    table.string("property_type", 20).notNullable().defaultTo("pg");
    table.string("occupancy", 15).notNullable();
    table.smallint("total_beds").nullable();
    table
      .foreign(["variant_id", "property_type"])
      .references(["id", "property_type"])
      .inTable("property_variants")
      .onDelete("CASCADE");
  });

  await knex.raw(`
    ALTER TABLE pg_property_variants
      ADD CONSTRAINT pg_property_variants_property_type_check CHECK (property_type = 'pg'),
      ADD CONSTRAINT pg_property_variants_occupancy_check CHECK (occupancy IN ('single','double','triple','triple-plus')),
      ADD CONSTRAINT pg_property_variants_total_beds_check CHECK (total_beds IS NULL OR total_beds > 0)
  `);
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("pg_property_variants");
};
