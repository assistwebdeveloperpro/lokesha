/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("recent_searches", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.jsonb("search_criteria").notNullable();
    table.string("search_title", 255).notNullable();
    table.string("search_subtitle", 255).nullable();
    table.text("search_url").notNullable();
    table.string("criteria_hash", 64).notNullable();
    table.timestamp("searched_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.unique(["user_id", "criteria_hash"]);
    table.index(["user_id", "searched_at"]);
  });
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("recent_searches");
};
