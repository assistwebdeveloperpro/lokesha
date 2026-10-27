/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("property_rent_details", (table) => {
    table.uuid("property_id").primary();
    table.string("listing_type", 12).notNullable().defaultTo("rent-lease");
    table.decimal("monthly_rent", 14, 2).notNullable();
    table.decimal("deposit_amount", 14, 2).nullable();
    table.decimal("maintenance_charges", 14, 2).nullable();
    table.smallint("notice_period_months").nullable();
    table.decimal("yearly_increment_percent", 5, 2).nullable();
    table.boolean("price_negotiable").notNullable().defaultTo(false);
    table.boolean("interior_modification_allowed").notNullable().defaultTo(false);
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
    ALTER TABLE property_rent_details
      ADD CONSTRAINT property_rent_details_listing_type_check CHECK (listing_type = 'rent-lease'),
      ADD CONSTRAINT property_rent_details_monthly_rent_check CHECK (monthly_rent > 0),
      ADD CONSTRAINT property_rent_details_notice_period_check CHECK (
        notice_period_months IS NULL OR notice_period_months BETWEEN 0 AND 24
      ),
      ADD CONSTRAINT property_rent_details_yearly_increment_check CHECK (
        yearly_increment_percent IS NULL OR yearly_increment_percent BETWEEN 0 AND 100
      )
  `);
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("property_rent_details");
};
