/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.alterTable("users", (table) => {
    table.string("mobile_country_code", 5).notNullable().defaultTo("+91");
    table.string("alternate_email", 255).nullable();
    table.boolean("receive_on_alternate_email").notNullable().defaultTo(false);
    table.boolean("receive_sms_on_mobile").notNullable().defaultTo(true);
    table.string("display_country_code", 5).nullable();
    table.string("display_number", 20).nullable();
    table.boolean("is_primary_mobile_virtual").notNullable().defaultTo(false);
    table.boolean("hide_contact_details").notNullable().defaultTo(false);
    table.boolean("agreed_to_terms").notNullable().defaultTo(false);
  });
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.alterTable("users", (table) => {
    table.dropColumn("mobile_country_code");
    table.dropColumn("alternate_email");
    table.dropColumn("receive_on_alternate_email");
    table.dropColumn("receive_sms_on_mobile");
    table.dropColumn("display_country_code");
    table.dropColumn("display_number");
    table.dropColumn("is_primary_mobile_virtual");
    table.dropColumn("hide_contact_details");
    table.dropColumn("agreed_to_terms");
  });
};
