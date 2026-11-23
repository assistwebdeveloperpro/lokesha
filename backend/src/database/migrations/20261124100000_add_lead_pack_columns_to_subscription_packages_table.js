const LEAD_RANGE_CHECK = "subscription_packages_lead_range_check";

/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.alterTable("subscription_packages", (table) => {
    table.integer("price_per_lead").nullable();
    table.integer("min_leads").nullable();
    table.integer("max_leads").nullable();
  });

  // Checks only apply once a lead pack sets the columns
  await knex.raw(`
    ALTER TABLE subscription_packages
      ADD CONSTRAINT ${LEAD_RANGE_CHECK} CHECK (
        (price_per_lead IS NULL OR price_per_lead >= 0)
        AND (min_leads IS NULL OR min_leads >= 1)
        AND (max_leads IS NULL OR min_leads IS NULL OR max_leads >= min_leads)
      )
  `);
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.raw(`ALTER TABLE subscription_packages DROP CONSTRAINT IF EXISTS ${LEAD_RANGE_CHECK}`);

  await knex.schema.alterTable("subscription_packages", (table) => {
    table.dropColumn("max_leads");
    table.dropColumn("min_leads");
    table.dropColumn("price_per_lead");
  });
};
