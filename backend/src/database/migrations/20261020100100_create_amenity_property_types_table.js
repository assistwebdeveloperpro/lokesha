/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("amenity_property_types", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("amenity_id")
      .notNullable()
      .references("id")
      .inTable("amenities")
      .onDelete("CASCADE");
    table.string("listing_type", 20).notNullable();
    table.string("property_type", 30).notNullable();
    table.string("property_sub_type", 255).nullable();
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.index(["property_type", "listing_type"]);
  });

  await knex.raw(
    "ALTER TABLE amenity_property_types ADD CONSTRAINT amenity_property_types_listing_type_check CHECK (listing_type IN ('sale','rent-lease'))"
  );

  // property_sub_type is NULL only for types without sub types (pg-co-living)
  await knex.raw(
    "CREATE UNIQUE INDEX amenity_property_types_unique ON amenity_property_types (amenity_id, listing_type, property_type, COALESCE(property_sub_type, ''))"
  );
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("amenity_property_types");
};
