const AREA_UNITS = "'sq-ft','sq-m','sq-yd','sq-km'";

/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("residential_properties", (table) => {
    table.uuid("property_id").primary();
    table.string("property_type", 20).notNullable().defaultTo("residential");
    table.string("furnishing_status", 20).nullable();
    table.decimal("carpet_area", 12, 2).nullable();
    table.string("carpet_area_unit", 10).nullable();
    table.decimal("super_built_up_area", 12, 2).nullable();
    table.string("super_built_up_area_unit", 10).nullable();
    table.smallint("bedrooms").nullable();
    table.smallint("balconies").nullable();
    table.smallint("bathrooms").nullable();
    table.smallint("lifts").nullable();
    table.smallint("total_floors").nullable();
    table.smallint("basement_floors").nullable();
    table.smallint("floor_number").nullable();
    table.string("age_of_construction", 10).nullable();
    table.string("property_transaction", 10).nullable();
    table.smallint("car_parking_count").nullable();
    table.boolean("club_membership").notNullable().defaultTo(false);
    table.smallint("open_sides").nullable();
    table.boolean("is_full_house").notNullable().defaultTo(false);
    table.boolean("is_sharing_basis").notNullable().defaultTo(false);
    table.decimal("terrace_area", 12, 2).nullable();
    table.string("terrace_area_unit", 10).nullable();
    table.string("penthouse_type", 10).nullable();
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    table
      .foreign(["property_id", "property_type"])
      .references(["id", "property_type"])
      .inTable("properties")
      .onDelete("CASCADE");
  });

  await knex.raw(`
    ALTER TABLE residential_properties
      ADD CONSTRAINT residential_properties_property_type_check CHECK (property_type = 'residential'),
      ADD CONSTRAINT residential_properties_furnishing_status_check CHECK (
        furnishing_status IS NULL OR furnishing_status IN ('unfurnished','semi-furnished','furnished')
      ),
      ADD CONSTRAINT residential_properties_carpet_area_unit_check CHECK (
        carpet_area_unit IS NULL OR carpet_area_unit IN (${AREA_UNITS})
      ),
      ADD CONSTRAINT residential_properties_super_built_up_area_unit_check CHECK (
        super_built_up_area_unit IS NULL OR super_built_up_area_unit IN (${AREA_UNITS})
      ),
      ADD CONSTRAINT residential_properties_terrace_area_unit_check CHECK (
        terrace_area_unit IS NULL OR terrace_area_unit IN (${AREA_UNITS})
      ),
      ADD CONSTRAINT residential_properties_bedrooms_check CHECK (bedrooms IS NULL OR bedrooms BETWEEN 1 AND 10),
      ADD CONSTRAINT residential_properties_balconies_check CHECK (balconies IS NULL OR balconies BETWEEN 0 AND 10),
      ADD CONSTRAINT residential_properties_bathrooms_check CHECK (bathrooms IS NULL OR bathrooms BETWEEN 1 AND 10),
      ADD CONSTRAINT residential_properties_lifts_check CHECK (lifts IS NULL OR lifts BETWEEN 0 AND 10),
      ADD CONSTRAINT residential_properties_total_floors_check CHECK (total_floors IS NULL OR total_floors BETWEEN 0 AND 50),
      ADD CONSTRAINT residential_properties_basement_floors_check CHECK (basement_floors IS NULL OR basement_floors BETWEEN 0 AND 3),
      ADD CONSTRAINT residential_properties_floor_number_check CHECK (floor_number IS NULL OR floor_number BETWEEN 0 AND 50),
      ADD CONSTRAINT residential_properties_floor_within_total_check CHECK (
        floor_number IS NULL OR total_floors IS NULL OR floor_number <= total_floors
      ),
      ADD CONSTRAINT residential_properties_age_of_construction_check CHECK (
        age_of_construction IS NULL OR age_of_construction IN ('lt-1','1-to-2','2-to-3','3-to-5','gt-5')
      ),
      ADD CONSTRAINT residential_properties_property_transaction_check CHECK (
        property_transaction IS NULL OR property_transaction IN ('new','resale')
      ),
      ADD CONSTRAINT residential_properties_car_parking_count_check CHECK (
        car_parking_count IS NULL OR car_parking_count BETWEEN 0 AND 20
      ),
      ADD CONSTRAINT residential_properties_open_sides_check CHECK (open_sides IS NULL OR open_sides BETWEEN 1 AND 4),
      ADD CONSTRAINT residential_properties_penthouse_type_check CHECK (
        penthouse_type IS NULL OR penthouse_type IN ('duplex','parallel')
      )
  `);
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("residential_properties");
};
