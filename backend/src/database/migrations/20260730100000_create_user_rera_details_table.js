/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("user_rera_details", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("user_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.string("state", 100).notNullable();
    table.string("rera_id", 50).notNullable();
    table.string("validity_month", 2).notNullable();
    table.string("validity_year", 4).notNullable();
    table.string("verification_link", 500).nullable();
    table.text("document_path").notNullable();
    table.string("document_original_name", 255).notNullable();
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    table.unique(["user_id", "state"]);
  });
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("user_rera_details");
};
