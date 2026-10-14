/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("properties", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.string("status", 20).notNullable().defaultTo("published");
    table.string("listing_type", 20).notNullable();
    table.string("property_type", 20).notNullable();
    table.string("property_sub_type", 50).nullable();
    table.string("block_no", 50).nullable();
    table.string("flat_number", 50).nullable();
    table.string("project_name", 255).notNullable();
    table.string("locality", 255).notNullable();
    table.string("address_line_2", 255).nullable();
    table.string("landmark", 255).nullable();
    table.string("pin_code", 10).notNullable();
    table.string("city", 100).nullable();
    table.string("state", 100).notNullable();
    table.text("description").notNullable();
    table.decimal("carpet_area", 12, 2).notNullable();
    table.string("carpet_area_unit", 10).notNullable();
    table.decimal("super_build_up_area", 12, 2).nullable();
    table.string("super_build_up_unit", 10).nullable();
    table.string("property_transaction", 10).notNullable();
    table.string("construction_status", 30).nullable();
    table.date("possession_date").nullable();
    table.string("age_of_construction", 10).nullable();
    table.smallint("bedrooms").notNullable();
    table.smallint("balconies").notNullable();
    table.smallint("bathrooms").notNullable();
    table.smallint("lift_count").nullable();
    table.smallint("total_floors").notNullable();
    table.smallint("floor_number").notNullable();
    table.string("furnishing_status", 20).nullable();
    table.string("facing", 20).nullable();
    table.boolean("car_parking_available").notNullable().defaultTo(false);
    table.smallint("car_parking_count").nullable();
    table.boolean("club_membership").notNullable().defaultTo(false);
    table.string("rera_number", 100).nullable();
    table.smallint("open_sides").nullable();
    table.decimal("expected_price", 14, 2).notNullable();
    table.boolean("price_negotiable").notNullable().defaultTo(false);
    table.specificType("price_inclusions", "text[]").notNullable().defaultTo("{}");
    table.decimal("booking_amount", 14, 2).notNullable();
    table.decimal("transfer_fee", 14, 2).nullable();
    table.decimal("maintenance_charges", 14, 2).nullable();
    table.text("benefits_remarks").nullable();
    table.string("brochure_path", 255).nullable();
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
  });

  await knex.raw(`
    ALTER TABLE properties
      ADD CONSTRAINT properties_status_check CHECK (status IN ('draft','pending','published','rejected')),
      ADD CONSTRAINT properties_listing_type_check CHECK (listing_type IN ('sale','rent-lease','pg-hostel')),
      ADD CONSTRAINT properties_property_type_check CHECK (property_type IN ('residential','commercial','pg-co-living','plot','land')),
      ADD CONSTRAINT properties_carpet_area_check CHECK (carpet_area > 0),
      ADD CONSTRAINT properties_carpet_area_unit_check CHECK (carpet_area_unit IN ('sq-ft','sq-km','sq-m','sq-yd')),
      ADD CONSTRAINT properties_transaction_check CHECK (property_transaction IN ('new','resale')),
      ADD CONSTRAINT properties_rooms_check CHECK (bedrooms >= 0 AND balconies >= 0 AND bathrooms >= 0 AND (lift_count IS NULL OR lift_count >= 0)),
      ADD CONSTRAINT properties_total_floors_check CHECK (total_floors >= 1),
      ADD CONSTRAINT properties_floor_number_check CHECK (floor_number >= 0 AND floor_number <= total_floors),
      ADD CONSTRAINT properties_prices_check CHECK (expected_price >= 0 AND booking_amount >= 0)
  `);

  await knex.raw(
    "CREATE INDEX properties_user_id_created_at_idx ON properties (user_id, created_at DESC)"
  );
  await knex.raw(
    "CREATE INDEX properties_status_created_at_idx ON properties (status, created_at DESC)"
  );
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("properties");
};
