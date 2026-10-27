/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("property_variant_charges", (table) => {
    table
      .uuid("variant_id")
      .primary()
      .references("id")
      .inTable("property_variants")
      .onDelete("CASCADE");
    table.boolean("car_parking_available").notNullable().defaultTo(false);
    table.smallint("car_parking_count").nullable();
    table.boolean("club_membership").notNullable().defaultTo(false);
    table.decimal("transfer_fee", 14, 2).nullable();
    table.decimal("booking_amount", 14, 2).nullable();
    table.decimal("maintenance_charges", 14, 2).nullable();
    table.text("benefits_remarks").nullable();
  });

  await knex.raw(`
    ALTER TABLE property_variant_charges
      ADD CONSTRAINT property_variant_charges_car_parking_count_check CHECK (
        car_parking_count IS NULL OR car_parking_count BETWEEN 0 AND 20
      )
  `);
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("property_variant_charges");
};
