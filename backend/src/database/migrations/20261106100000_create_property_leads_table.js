/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("property_leads", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("property_id").notNullable().references("id").inTable("properties").onDelete("CASCADE");
    table.uuid("lead_user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.uuid("lister_user_id").nullable().references("id").inTable("users").onDelete("SET NULL");
    table.uuid("lister_admin_id").nullable().references("id").inTable("admins").onDelete("SET NULL");
    table.string("lister_role", 20).notNullable();
    table.boolean("phone_revealed").notNullable().defaultTo(false);
    table.string("verification_status", 20).notNullable().defaultTo("not_verified");
    table.string("lead_name", 150).notNullable();
    table.string("lead_mobile", 20).nullable();
    table.string("lead_email", 150).nullable();
    table.string("lister_name", 150).nullable();
    table.string("lister_mobile", 20).nullable();
    table.string("lister_listed_by", 30).nullable();
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());

    table.unique(["lead_user_id", "property_id"]);
    table.index("lead_user_id");
    table.index("property_id");
    table.index("created_at");
  });

  await knex.raw(`
    ALTER TABLE property_leads
      ADD CONSTRAINT property_leads_lister_role_check CHECK (lister_role IN ('owner','agent','builder')),
      ADD CONSTRAINT property_leads_verification_status_check CHECK (verification_status IN ('not_verified','verified')),
      ADD CONSTRAINT property_leads_single_lister_check CHECK (lister_user_id IS NULL OR lister_admin_id IS NULL)
  `);
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("property_leads");
};
