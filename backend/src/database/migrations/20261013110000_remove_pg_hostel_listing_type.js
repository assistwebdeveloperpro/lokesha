/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex("properties").where("listing_type", "pg-hostel").update({
    listing_type: "rent-lease",
  });

  await knex.raw(`
    ALTER TABLE properties
      DROP CONSTRAINT IF EXISTS properties_listing_type_check,
      ADD CONSTRAINT properties_listing_type_check CHECK (listing_type IN ('sale','rent-lease'))
  `);
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.raw(`
    ALTER TABLE properties
      DROP CONSTRAINT IF EXISTS properties_listing_type_check,
      ADD CONSTRAINT properties_listing_type_check CHECK (listing_type IN ('sale','rent-lease','pg-hostel'))
  `);
};
