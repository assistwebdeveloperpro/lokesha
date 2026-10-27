/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.alterTable("properties", (table) => {
    table.uuid("listing_group_id").nullable();
    table.index("listing_group_id");
  });
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.alterTable("properties", (table) => {
    table.dropIndex("listing_group_id");
    table.dropColumn("listing_group_id");
  });
};
