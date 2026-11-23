const EXTRA_LEADS_CHECK = "properties_extra_leads_check";

/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.alterTable("properties", (table) => {
    table.integer("extra_leads").notNullable().defaultTo(0);
  });

  await knex.raw(`ALTER TABLE properties ADD CONSTRAINT ${EXTRA_LEADS_CHECK} CHECK (extra_leads >= 0)`);
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.raw(`ALTER TABLE properties DROP CONSTRAINT IF EXISTS ${EXTRA_LEADS_CHECK}`);

  await knex.schema.alterTable("properties", (table) => {
    table.dropColumn("extra_leads");
  });
};
