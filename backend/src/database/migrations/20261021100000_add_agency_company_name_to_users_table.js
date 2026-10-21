/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.alterTable("users", (table) => {
    table.string("password", 255).nullable().alter();
    table.string("agency_name", 150).nullable();
    table.string("company_name", 150).nullable();
  });
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.alterTable("users", (table) => {
    table.dropColumn("agency_name");
    table.dropColumn("company_name");
  });
};
