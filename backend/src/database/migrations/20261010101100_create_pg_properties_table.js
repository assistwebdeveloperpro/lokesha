const AREA_UNITS = "'sq-ft','sq-m','sq-yd','sq-km'";

/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("pg_properties", (table) => {
    table.uuid("property_id").primary();
    table.string("property_type", 20).notNullable().defaultTo("pg");
    table.string("pg_name", 150).notNullable();
    table.string("pg_gender", 10).notNullable();
    table.string("pg_present_in", 25).nullable();
    table.smallint("operating_since_year").nullable();
    table.time("entry_till").nullable();
    table.string("food_charge_type", 10).nullable();
    table.string("managed_by", 15).nullable();
    table.string("furnishing_status", 20).nullable();
    table.decimal("carpet_area", 12, 2).nullable();
    table.string("carpet_area_unit", 10).nullable();
    table.decimal("super_built_up_area", 12, 2).nullable();
    table.string("super_built_up_area_unit", 10).nullable();
    table.smallint("bedrooms").nullable();
    table.smallint("balconies").nullable();
    table.smallint("bathrooms").nullable();
    table.smallint("total_floors").nullable();
    table.smallint("floor_number").nullable();
    table.string("age_of_construction", 10).nullable();
    table.string("road_facing", 10).nullable();
    table.smallint("car_parking_count").nullable();
    table.smallint("open_sides").nullable();
    table.boolean("has_pantry").notNullable().defaultTo(false);
    table.boolean("has_cafeteria").notNullable().defaultTo(false);
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    table
      .foreign(["property_id", "property_type"])
      .references(["id", "property_type"])
      .inTable("properties")
      .onDelete("CASCADE");
  });

  await knex.raw(`
    ALTER TABLE pg_properties
      ADD CONSTRAINT pg_properties_property_type_check CHECK (property_type = 'pg'),
      ADD CONSTRAINT pg_properties_pg_gender_check CHECK (pg_gender IN ('male','female','both')),
      ADD CONSTRAINT pg_properties_pg_present_in_check CHECK (
        pg_present_in IS NULL OR pg_present_in IN ('independent-building','society','flat')
      ),
      ADD CONSTRAINT pg_properties_operating_since_year_check CHECK (
        operating_since_year IS NULL OR operating_since_year BETWEEN 1900 AND 2100
      ),
      ADD CONSTRAINT pg_properties_food_charge_type_check CHECK (
        food_charge_type IS NULL OR food_charge_type IN ('inclusive','extra')
      ),
      ADD CONSTRAINT pg_properties_managed_by_check CHECK (
        managed_by IS NULL OR managed_by IN ('landlord','professional','care-taker')
      ),
      ADD CONSTRAINT pg_properties_furnishing_status_check CHECK (
        furnishing_status IS NULL OR furnishing_status IN ('unfurnished','semi-furnished','furnished')
      ),
      ADD CONSTRAINT pg_properties_carpet_area_unit_check CHECK (
        carpet_area_unit IS NULL OR carpet_area_unit IN (${AREA_UNITS})
      ),
      ADD CONSTRAINT pg_properties_super_built_up_area_unit_check CHECK (
        super_built_up_area_unit IS NULL OR super_built_up_area_unit IN (${AREA_UNITS})
      ),
      ADD CONSTRAINT pg_properties_bedrooms_check CHECK (bedrooms IS NULL OR bedrooms BETWEEN 1 AND 10),
      ADD CONSTRAINT pg_properties_balconies_check CHECK (balconies IS NULL OR balconies BETWEEN 0 AND 10),
      ADD CONSTRAINT pg_properties_bathrooms_check CHECK (bathrooms IS NULL OR bathrooms BETWEEN 1 AND 10),
      ADD CONSTRAINT pg_properties_total_floors_check CHECK (total_floors IS NULL OR total_floors BETWEEN 0 AND 50),
      ADD CONSTRAINT pg_properties_floor_number_check CHECK (floor_number IS NULL OR floor_number BETWEEN 0 AND 50),
      ADD CONSTRAINT pg_properties_floor_within_total_check CHECK (
        floor_number IS NULL OR total_floors IS NULL OR floor_number <= total_floors
      ),
      ADD CONSTRAINT pg_properties_age_of_construction_check CHECK (
        age_of_construction IS NULL OR age_of_construction IN ('lt-1','1-to-2','2-to-3','3-to-5','gt-5')
      ),
      ADD CONSTRAINT pg_properties_road_facing_check CHECK (
        road_facing IS NULL OR road_facing IN ('main-road','side-road','no-road')
      ),
      ADD CONSTRAINT pg_properties_car_parking_count_check CHECK (
        car_parking_count IS NULL OR car_parking_count BETWEEN 0 AND 20
      ),
      ADD CONSTRAINT pg_properties_open_sides_check CHECK (open_sides IS NULL OR open_sides BETWEEN 1 AND 4)
  `);
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("pg_properties");
};
