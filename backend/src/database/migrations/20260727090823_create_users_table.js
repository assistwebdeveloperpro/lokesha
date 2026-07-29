const ROLE_ENUM_NAME = "user_role";
const ROLE_VALUES = ["buyer", "owner", "agent", "builder"];

/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
  await knex.raw(
    `CREATE TYPE ${ROLE_ENUM_NAME} AS ENUM (${ROLE_VALUES.map((v) => `'${v}'`).join(", ")})`
  );

  await knex.schema.createTable("users", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.specificType("role", ROLE_ENUM_NAME).notNullable();
    table.string("name", 100).notNullable();
    table.string("email", 255).notNullable().unique();
    table.string("password", 255).notNullable();
    table.string("mobile_number", 20).notNullable().unique();
    table.string("otp_code", 4).nullable();
    table.timestamp("otp_expires_at").nullable();
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
  });
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("users");
  await knex.raw(`DROP TYPE IF EXISTS ${ROLE_ENUM_NAME}`);
};
