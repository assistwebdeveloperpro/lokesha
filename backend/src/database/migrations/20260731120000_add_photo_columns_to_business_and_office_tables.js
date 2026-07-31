/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.alterTable("user_business_details", (table) => {
    table.string("company_logo", 255).nullable();
  });

  await knex.schema.alterTable("user_office_details", (table) => {
    table.string("contact_person_photo", 255).nullable();
  });
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.alterTable("user_business_details", (table) => {
    table.dropColumn("company_logo");
  });

  await knex.schema.alterTable("user_office_details", (table) => {
    table.dropColumn("contact_person_photo");
  });
};
