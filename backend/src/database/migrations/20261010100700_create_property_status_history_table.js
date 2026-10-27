/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("property_status_history", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("property_id")
      .notNullable()
      .references("id")
      .inTable("properties")
      .onDelete("CASCADE");
    table.string("from_status", 10).nullable();
    table.string("to_status", 10).notNullable();
    table
      .uuid("changed_by_user_id")
      .nullable()
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");
    // FK to admins is added in 20261014100100
    table.uuid("changed_by_admin_id").nullable();
    table.text("reason").nullable();
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.index(["property_id", "created_at"]);
  });

  await knex.raw(`
    ALTER TABLE property_status_history
      ADD CONSTRAINT property_status_history_from_status_check CHECK (from_status IS NULL OR from_status IN (
        'draft','pending','published','rejected','closed'
      )),
      ADD CONSTRAINT property_status_history_to_status_check CHECK (to_status IN (
        'draft','pending','published','rejected','closed'
      ))
  `);
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("property_status_history");
};
