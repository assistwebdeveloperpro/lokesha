/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.raw("CREATE SEQUENCE property_listing_number_seq START 100000");

  await knex.schema.createTable("properties", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .bigInteger("listing_number")
      .notNullable()
      .unique()
      .defaultTo(knex.raw("nextval('property_listing_number_seq')"));
    table
      .uuid("user_id")
      .nullable()
      .references("id")
      .inTable("users")
      .onDelete("RESTRICT");
    // FK to admins is added in 20261014100100
    table.uuid("admin_id").nullable();
    table.string("listed_by", 20).notNullable();
    table.string("listing_type", 12).notNullable();
    table
      .string("property_type", 20)
      .notNullable()
      .references("slug")
      .inTable("property_types")
      .onDelete("RESTRICT");
    table.uuid("property_sub_type_id").notNullable();
    table
      .uuid("builder_project_id")
      .nullable()
      .references("id")
      .inTable("builder_projects")
      .onDelete("CASCADE");
    table.string("status", 10).notNullable().defaultTo("draft");
    table.string("title", 150).notNullable();
    table.decimal("price", 14, 2).nullable();
    table.decimal("area_sqft", 12, 2).nullable();
    table.string("project_name", 150).nullable();
    table.string("block_no", 50).nullable();
    table.string("flat_number", 50).nullable();
    table.string("locality", 150).notNullable();
    table.string("address_line_2", 255).nullable();
    table.string("landmark", 150).nullable();
    table.string("pin_code", 6).notNullable();
    table.string("city", 100).nullable();
    table.string("state", 100).notNullable();
    table.decimal("latitude", 9, 6).nullable();
    table.decimal("longitude", 9, 6).nullable();
    table.text("description").notNullable();
    table.string("facing", 15).nullable();
    table.date("available_from").nullable();
    table.string("construction_status", 20).nullable();
    table.date("possession_date").nullable();
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("published_at").nullable();

    table.unique(["id", "property_type"]);
    table.unique(["id", "listing_type"]);
    table
      .foreign(["property_sub_type_id", "property_type"])
      .references(["id", "property_type"])
      .inTable("property_sub_types")
      .onDelete("RESTRICT");

    table.index(["property_type", "listing_type", "status"]);
    table.index(["city", "status"]);
    table.index("pin_code");
    table.index("user_id");
    table.index("admin_id");
    table.index("builder_project_id");
  });

  await knex.raw(`
    ALTER TABLE properties
      ADD CONSTRAINT properties_owner_check CHECK (num_nonnulls(user_id, admin_id) = 1),
      ADD CONSTRAINT properties_listed_by_check CHECK (listed_by IN (
        'buyer_owner_tenant','agent','builder','lokesha_staff','admin'
      )),
      ADD CONSTRAINT properties_listing_type_check CHECK (listing_type IN ('sale','rent-lease')),
      ADD CONSTRAINT properties_status_check CHECK (status IN (
        'draft','pending','published','rejected','closed'
      )),
      ADD CONSTRAINT properties_pin_code_check CHECK (pin_code ~ '^[0-9]{6}$'),
      ADD CONSTRAINT properties_latitude_check CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
      ADD CONSTRAINT properties_longitude_check CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180),
      ADD CONSTRAINT properties_coordinates_check CHECK ((latitude IS NULL) = (longitude IS NULL)),
      ADD CONSTRAINT properties_facing_check CHECK (facing IS NULL OR facing IN (
        'east','west','north','south','north-east','north-west','south-east','south-west'
      )),
      ADD CONSTRAINT properties_construction_status_check CHECK (construction_status IS NULL OR construction_status IN (
        'pre-launch','under-construction','ready-to-move'
      ))
  `);

  await knex.raw(`
    CREATE INDEX properties_published_sub_type_price_idx
      ON properties (property_sub_type_id, price) WHERE status = 'published'
  `);
  await knex.raw(`
    CREATE INDEX properties_published_coordinates_idx
      ON properties (latitude, longitude) WHERE status = 'published'
  `);
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("properties");
  await knex.raw("DROP SEQUENCE IF EXISTS property_listing_number_seq");
};
