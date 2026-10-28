/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.alterTable("residential_property_variants", (table) => {
    table.decimal("carpet_area_max", 12, 2).nullable();
    table.decimal("super_built_up_area_max", 12, 2).nullable();
  });

  await knex.raw(`
    ALTER TABLE residential_property_variants
      ADD CONSTRAINT residential_property_variants_carpet_area_max_check CHECK (
        carpet_area_max IS NULL OR carpet_area_max > 0
      ),
      ADD CONSTRAINT residential_property_variants_super_built_up_area_max_check CHECK (
        super_built_up_area_max IS NULL OR super_built_up_area_max > 0
      )
  `);
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.alterTable("residential_property_variants", (table) => {
    table.dropColumn("carpet_area_max");
    table.dropColumn("super_built_up_area_max");
  });
};
