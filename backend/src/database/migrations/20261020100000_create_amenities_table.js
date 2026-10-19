/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("amenities", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("kind", 15).notNullable();
    table.string("amenity_key", 50).notNullable();
    table.string("name", 100).notNullable();
    table.string("image_path", 255).notNullable();
    table.integer("sort_order").notNullable().defaultTo(0);
    table.boolean("is_active").notNullable().defaultTo(true);
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    table.unique(["kind", "amenity_key"]);
  });

  await knex.raw(
    "ALTER TABLE amenities ADD CONSTRAINT amenities_kind_check CHECK (kind IN ('amenity','furnishing'))"
  );
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("amenities");
};
