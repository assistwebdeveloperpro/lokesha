/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.alterTable("properties", (table) => {
    table.string("property_sub_type", 255).nullable().alter();
  });
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.alterTable("properties", (table) => {
    table.string("property_sub_type", 50).nullable().alter();
  });
};
