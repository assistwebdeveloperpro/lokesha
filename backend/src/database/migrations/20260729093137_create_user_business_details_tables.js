/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("user_business_details", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("user_id")
      .notNullable()
      .unique()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.specificType("dealing_in", "text[]").nullable();
    table.specificType("property_type", "text[]").nullable();
    table.specificType("transaction_type", "text[]").nullable();
    table.specificType("residential_property", "text[]").nullable();
    table.specificType("commercial_property", "text[]").nullable();
    table.smallint("operating_since").nullable();
    table.string("expertise_in", 255).nullable();
    table.text("business_description").nullable();
    table.text("authorized_agents").nullable();
    table.boolean("property_registry").nullable();
    table.boolean("loan_facility").nullable();
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable("user_business_clients", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("business_detail_id")
      .notNullable()
      .references("id")
      .inTable("user_business_details")
      .onDelete("CASCADE");
    table.string("name", 255).nullable();
    table.string("deal_value", 255).nullable();
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
  });
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("user_business_clients");
  await knex.schema.dropTableIfExists("user_business_details");
};
