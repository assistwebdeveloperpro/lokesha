/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.alterTable("user_rera_details", (table) => {
    table.string("rera_id", 100).notNullable().alter();
  });
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.alterTable("user_rera_details", (table) => {
    table.string("rera_id", 50).notNullable().alter();
  });
};
