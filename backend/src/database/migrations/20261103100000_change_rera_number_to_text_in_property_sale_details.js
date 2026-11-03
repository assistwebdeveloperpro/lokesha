/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.alterTable("property_sale_details", (table) => {
    table.text("rera_number").nullable().alter();
  });
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.alterTable("property_sale_details", (table) => {
    table.string("rera_number", 50).nullable().alter();
  });
};
