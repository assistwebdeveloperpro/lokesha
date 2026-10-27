/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("property_sale_details", (table) => {
    table.uuid("property_id").primary();
    table.string("listing_type", 12).notNullable().defaultTo("sale");
    table.decimal("expected_price", 14, 2).nullable();
    table.boolean("price_negotiable").notNullable().defaultTo(false);
    table.decimal("transfer_fee", 14, 2).nullable();
    table.decimal("booking_amount", 14, 2).nullable();
    table.decimal("maintenance_charges", 14, 2).nullable();
    table.decimal("assured_return_percent", 5, 2).nullable();
    table.boolean("includes_car_parking").notNullable().defaultTo(false);
    table.boolean("includes_club_membership").notNullable().defaultTo(false);
    table.boolean("includes_plc").notNullable().defaultTo(false);
    table.string("rera_number", 50).nullable();
    table.text("benefits_remarks").nullable();
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    table
      .foreign(["property_id", "listing_type"])
      .references(["id", "listing_type"])
      .inTable("properties")
      .onDelete("CASCADE");
  });

  await knex.raw(`
    ALTER TABLE property_sale_details
      ADD CONSTRAINT property_sale_details_listing_type_check CHECK (listing_type = 'sale'),
      ADD CONSTRAINT property_sale_details_expected_price_check CHECK (expected_price IS NULL OR expected_price > 0),
      ADD CONSTRAINT property_sale_details_assured_return_check CHECK (
        assured_return_percent IS NULL OR assured_return_percent BETWEEN 0 AND 100
      )
  `);
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("property_sale_details");
};
