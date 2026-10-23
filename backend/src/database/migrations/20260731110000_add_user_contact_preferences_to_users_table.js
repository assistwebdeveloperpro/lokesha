/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("user_contact_preferences", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("user_id")
      .notNullable()
      .unique()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.string("alternate_email", 255).nullable();
    table.boolean("receive_on_alternate_email").notNullable().defaultTo(false);
    table.boolean("receive_sms_on_mobile").notNullable().defaultTo(true);
    table.string("display_number", 20).nullable();
    table.boolean("is_primary_mobile_virtual").notNullable().defaultTo(false);
    table.boolean("hide_contact_details").notNullable().defaultTo(false);
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
  });
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("user_contact_preferences");
};
