const OLD_CATEGORIES = [
  "bedrooms",
  "bathrooms",
  "terrace",
  "kitchen",
  "exterior",
  "main-photo",
  "living-room",
  "floor-plan",
  "master-plan",
  "pooja-room",
  "others",
  "balcony",
];

const NEW_CATEGORIES = [
  "washroom",
  "common-area",
  "amenities",
  "brochure-images",
  "cluster-plan",
  "elevation",
  "construction-progress",
  "brochure",
];

const toSqlList = (values) => values.map((value) => `'${value}'`).join(",");

/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.raw("ALTER TABLE property_media DROP CONSTRAINT property_media_media_type_check");
  await knex.raw("ALTER TABLE property_media DROP CONSTRAINT property_media_category_check");

  await knex.schema.alterTable("property_media", (table) => {
    table.string("category", 30).notNullable().alter();
  });

  await knex.raw(`
    ALTER TABLE property_media
      ADD CONSTRAINT property_media_media_type_check CHECK (media_type IN ('image','video','document')),
      ADD CONSTRAINT property_media_category_check CHECK (category IN (
        ${toSqlList([...OLD_CATEGORIES, ...NEW_CATEGORIES])}
      ))
  `);
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.raw("ALTER TABLE property_media DROP CONSTRAINT property_media_media_type_check");
  await knex.raw("ALTER TABLE property_media DROP CONSTRAINT property_media_category_check");

  await knex("property_media")
    .whereIn("category", NEW_CATEGORIES)
    .orWhere("media_type", "document")
    .del();

  await knex.schema.alterTable("property_media", (table) => {
    table.string("category", 20).notNullable().alter();
  });

  await knex.raw(`
    ALTER TABLE property_media
      ADD CONSTRAINT property_media_media_type_check CHECK (media_type IN ('image','video')),
      ADD CONSTRAINT property_media_category_check CHECK (category IN (${toSqlList(OLD_CATEGORIES)}))
  `);
};
