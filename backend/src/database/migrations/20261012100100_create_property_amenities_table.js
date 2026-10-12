/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("property_amenities", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("property_id")
      .notNullable()
      .references("id")
      .inTable("properties")
      .onDelete("CASCADE");
    table.string("kind", 15).notNullable();
    table.string("amenity_key", 50).notNullable();
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.unique(["property_id", "kind", "amenity_key"]);
    table.index(["property_id"]);
  });

  await knex.raw(
    "ALTER TABLE property_amenities ADD CONSTRAINT property_amenities_kind_check CHECK (kind IN ('amenity','furnishing'))"
  );
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("property_amenities");
};
