/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("pending_user_registrations", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("mobile_number", 20).notNullable().unique();
    table.string("name", 100).notNullable();
    table.string("email", 255).notNullable();
    table.boolean("agreed_to_terms").notNullable().defaultTo(false);
    table.string("otp_code", 4).notNullable();
    table.timestamp("otp_expires_at").notNullable();
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());

    table.index("otp_expires_at");
  });
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("pending_user_registrations");
};
