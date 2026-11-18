const DISTRIBUTION_INDEX = "property_leads_lister_distribution_idx";

/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.alterTable("property_leads", (table) => {
    table.string("distribution_status", 20).notNullable().defaultTo("not_sent");
    table.timestamp("sent_at").nullable();
    table.index(["lister_user_id", "distribution_status", "sent_at"], DISTRIBUTION_INDEX);
  });

  await knex.raw(`
    ALTER TABLE property_leads
      ADD CONSTRAINT property_leads_distribution_status_check CHECK (distribution_status IN ('not_sent','sent')),
      ADD CONSTRAINT property_leads_sent_at_check CHECK (distribution_status <> 'sent' OR sent_at IS NOT NULL)
  `);
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.raw(`
    ALTER TABLE property_leads
      DROP CONSTRAINT IF EXISTS property_leads_sent_at_check,
      DROP CONSTRAINT IF EXISTS property_leads_distribution_status_check
  `);

  await knex.schema.alterTable("property_leads", (table) => {
    table.dropIndex(["lister_user_id", "distribution_status", "sent_at"], DISTRIBUTION_INDEX);
    table.dropColumn("sent_at");
    table.dropColumn("distribution_status");
  });
};
