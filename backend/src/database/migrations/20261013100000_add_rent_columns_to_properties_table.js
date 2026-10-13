/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.alterTable("properties", (table) => {
    table.boolean("full_house").notNullable().defaultTo(false);
    table.boolean("sharing_basis").notNullable().defaultTo(false);
    table.boolean("interior_modification_allowed").notNullable().defaultTo(false);
    table.date("available_from").nullable();
    table.specificType("tenant_preferences", "text[]").notNullable().defaultTo("{}");
    table.decimal("monthly_rent", 14, 2).nullable();
    table.smallint("notice_period_months").nullable();
    table.decimal("deposit_amount", 14, 2).nullable();
  });

  // Rent listings have no sale price, booking amount or transaction type
  await knex.raw(`
    ALTER TABLE properties
      ALTER COLUMN expected_price DROP NOT NULL,
      ALTER COLUMN booking_amount DROP NOT NULL,
      ALTER COLUMN property_transaction DROP NOT NULL,
      ADD CONSTRAINT properties_rent_amounts_check CHECK (
        (monthly_rent IS NULL OR monthly_rent >= 0)
        AND (deposit_amount IS NULL OR deposit_amount >= 0)
        AND (notice_period_months IS NULL OR notice_period_months >= 0)
      )
  `);
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.raw("ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_rent_amounts_check");

  // Restoring NOT NULL needs values on existing rent rows
  await knex("properties").whereNull("expected_price").update({ expected_price: 0 });
  await knex("properties").whereNull("booking_amount").update({ booking_amount: 0 });
  await knex("properties").whereNull("property_transaction").update({ property_transaction: "resale" });

  await knex.raw(`
    ALTER TABLE properties
      ALTER COLUMN expected_price SET NOT NULL,
      ALTER COLUMN booking_amount SET NOT NULL,
      ALTER COLUMN property_transaction SET NOT NULL
  `);

  await knex.schema.alterTable("properties", (table) => {
    table.dropColumns(
      "full_house",
      "sharing_basis",
      "interior_modification_allowed",
      "available_from",
      "tenant_preferences",
      "monthly_rent",
      "notice_period_months",
      "deposit_amount"
    );
  });
};
