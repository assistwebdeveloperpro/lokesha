/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("user_office_details", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("user_id")
      .notNullable()
      .unique()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.string("state", 100).notNullable();
    table.string("city", 100).notNullable();
    table.string("locality", 255).notNullable();
    table.text("address").nullable();
    table.string("postal_code", 20).nullable();
    table.string("contact_person_name", 100).notNullable();
    table.boolean("hide_person_name").notNullable().defaultTo(false);
    table.string("agency_company_name", 255).notNullable();
    table.string("company_website", 255).nullable();
    table.specificType("office_photos", "text[]").nullable();
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
  });
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("user_office_details");
};
