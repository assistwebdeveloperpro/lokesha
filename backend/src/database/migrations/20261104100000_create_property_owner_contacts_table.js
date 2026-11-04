/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("property_owner_contacts", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("property_id").notNullable().unique().references("id").inTable("properties").onDelete("CASCADE");
    table.string("full_name", 150).notNullable();
    table.string("mobile_number", 10).notNullable();
    table.string("alternate_mobile_number", 10).nullable();
    table.string("email", 150).nullable();
    table.string("whatsapp_number", 10).nullable();
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
  });

  await knex.raw(`
    ALTER TABLE property_owner_contacts
      ADD CONSTRAINT property_owner_contacts_mobile_check CHECK (mobile_number ~ '^[0-9]{10}$'),
      ADD CONSTRAINT property_owner_contacts_alternate_mobile_check CHECK (
        alternate_mobile_number IS NULL OR alternate_mobile_number ~ '^[0-9]{10}$'
      ),
      ADD CONSTRAINT property_owner_contacts_whatsapp_check CHECK (
        whatsapp_number IS NULL OR whatsapp_number ~ '^[0-9]{10}$'
      )
  `);
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("property_owner_contacts");
};
