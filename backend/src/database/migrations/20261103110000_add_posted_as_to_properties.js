/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.alterTable("properties", (table) => {
    table.string("posted_as", 20).nullable();
  });

  await knex.raw(`
    ALTER TABLE properties
      ADD CONSTRAINT properties_posted_as_check CHECK (
        posted_as IS NULL OR posted_as IN ('buyer_owner_tenant','agent','builder')
      )
  `);
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.raw("ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_posted_as_check");
  await knex.schema.alterTable("properties", (table) => {
    table.dropColumn("posted_as");
  });
};