/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("admin_notifications", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("type", 40).notNullable();
    table.string("title", 255).notNullable();
    table.text("message").notNullable();
    table.uuid("property_id").nullable().references("id").inTable("properties").onDelete("CASCADE");
    table.timestamp("read_at").nullable();
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.index(["read_at", "created_at"]);
  });
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("admin_notifications");
};
