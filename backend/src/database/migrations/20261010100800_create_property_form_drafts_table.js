/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("property_form_drafts", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("user_id")
      .nullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.uuid("admin_id").nullable();
    table.string("listed_by", 20).notNullable();
    table.jsonb("form_data").notNullable().defaultTo("{}");
    table.smallint("current_step").notNullable().defaultTo(1);
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    table.index(["user_id", "updated_at"]);
    table.index(["admin_id", "updated_at"]);
    table.index("updated_at");
  });

  await knex.raw(`
    ALTER TABLE property_form_drafts
      ADD CONSTRAINT property_form_drafts_owner_check CHECK (num_nonnulls(user_id, admin_id) = 1),
      ADD CONSTRAINT property_form_drafts_listed_by_check CHECK (listed_by IN (
        'buyer_owner_tenant','agent','builder','lokesha_staff','admin'
      )),
      ADD CONSTRAINT property_form_drafts_current_step_check CHECK (current_step BETWEEN 1 AND 5)
  `);
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("property_form_drafts");
};