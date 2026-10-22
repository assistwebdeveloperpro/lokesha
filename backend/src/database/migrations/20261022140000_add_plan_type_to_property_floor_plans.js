/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.alterTable("property_floor_plans", (table) => {
    table.string("plan_type", 10).notNullable().defaultTo("2d");
  });
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.alterTable("property_floor_plans", (table) => {
    table.dropColumn("plan_type");
  });
};
