const CATEGORY_ENUM_NAME = "saved_message_category";
const CATEGORY_VALUES = ["property", "requirements", "agents", "builders"];

/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.raw(
    `CREATE TYPE ${CATEGORY_ENUM_NAME} AS ENUM (${CATEGORY_VALUES.map((v) => `'${v}'`).join(", ")})`
  );

  await knex.schema.createTable("user_saved_messages", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("user_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.specificType("category", CATEGORY_ENUM_NAME).notNullable();
    table.text("message").notNullable();
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    table.unique(["user_id", "category"]);
  });
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("user_saved_messages");
  await knex.raw(`DROP TYPE IF EXISTS ${CATEGORY_ENUM_NAME}`);
};
