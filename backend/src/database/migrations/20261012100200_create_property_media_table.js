/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("property_media", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("property_id")
      .notNullable()
      .references("id")
      .inTable("properties")
      .onDelete("CASCADE");
    table.string("category", 20).notNullable();
    table.string("media_type", 10).notNullable();
    table.string("file_path", 255).notNullable();
    table.string("original_name", 255).nullable();
    table.string("mime_type", 50).notNullable();
    table.integer("file_size").notNullable();
    table.integer("sort_order").notNullable().defaultTo(0);
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.index(["property_id", "sort_order"]);
  });

  await knex.raw(`
    ALTER TABLE property_media
      ADD CONSTRAINT property_media_media_type_check CHECK (media_type IN ('image','video')),
      ADD CONSTRAINT property_media_category_check CHECK (category IN (
        'bedrooms','bathrooms','terrace','kitchen','exterior','main-photo','living-room',
        'floor-plan','master-plan','pooja-room','others','balcony'
      ))
  `);
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("property_media");
};
