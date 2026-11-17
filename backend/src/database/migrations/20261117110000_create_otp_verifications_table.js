/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("otp_verifications", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("mobile_number", 15).notNullable().unique();
    table.string("otp_code", 4).notNullable();
    table.timestamp("otp_expires_at").notNullable();
    table.timestamp("last_sent_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());

    table.index("otp_expires_at");
  });
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("otp_verifications");
};
