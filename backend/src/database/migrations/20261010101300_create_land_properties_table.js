/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("land_properties", (table) => {
    table.uuid("property_id").primary();
    table.string("property_type", 20).notNullable().defaultTo("land");
    table.string("property_transaction", 10).nullable();
    table.boolean("any_construction").notNullable().defaultTo(false);
    table.boolean("boundary_wall_made").notNullable().defaultTo(false);
    table.boolean("corner_plot").notNullable().defaultTo(false);
    table.decimal("entrance_width_m", 6, 2).nullable();
    table.string("road_facing", 10).nullable();
    table.smallint("open_sides").nullable();
    table.string("managed_by", 15).nullable();
    table.boolean("is_leased_out").notNullable().defaultTo(false);
    table.date("lease_contract_till").nullable();
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    table
      .foreign(["property_id", "property_type"])
      .references(["id", "property_type"])
      .inTable("properties")
      .onDelete("CASCADE");
  });

  await knex.raw(`
    ALTER TABLE land_properties
      ADD CONSTRAINT land_properties_property_type_check CHECK (property_type = 'land'),
      ADD CONSTRAINT land_properties_property_transaction_check CHECK (
        property_transaction IS NULL OR property_transaction IN ('new','resale')
      ),
      ADD CONSTRAINT land_properties_entrance_width_check CHECK (entrance_width_m IS NULL OR entrance_width_m > 0),
      ADD CONSTRAINT land_properties_road_facing_check CHECK (
        road_facing IS NULL OR road_facing IN ('main-road','side-road','no-road')
      ),
      ADD CONSTRAINT land_properties_open_sides_check CHECK (open_sides IS NULL OR open_sides BETWEEN 1 AND 4),
      ADD CONSTRAINT land_properties_managed_by_check CHECK (
        managed_by IS NULL OR managed_by IN ('landlord','professional','care-taker')
      ),
      ADD CONSTRAINT land_properties_lease_contract_check CHECK (
        NOT is_leased_out OR lease_contract_till IS NOT NULL
      )
  `);
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("land_properties");
};
