const fs = require("fs");
const path = require("path");

const BACKEND_ROOT = path.join(__dirname, "../../..");

/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.alterTable("properties", (table) => {
    table.uuid("admin_id").nullable().references("id").inTable("admins").onDelete("CASCADE");
  });

  await knex.raw("ALTER TABLE properties ALTER COLUMN user_id DROP NOT NULL");
  await knex.raw(`
    ALTER TABLE properties
      ADD CONSTRAINT properties_owner_check CHECK ((user_id IS NOT NULL) <> (admin_id IS NOT NULL))
  `);
  await knex.raw(
    "CREATE INDEX properties_admin_id_created_at_idx ON properties (admin_id, created_at DESC)"
  );
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  const adminProperties = knex("properties").whereNotNull("admin_id").select("id");
  const media = await knex("property_media").whereIn("property_id", adminProperties).select("file_path");
  const brochures = await knex("properties").whereNotNull("admin_id").select("brochure_path");

  const filePaths = [...media.map((row) => row.file_path), ...brochures.map((row) => row.brochure_path)];

  await knex("properties").whereNotNull("admin_id").del();

  // Remove the deleted rows' uploaded files from disk
  filePaths.filter(Boolean).forEach((filePath) => {
    try {
      fs.unlinkSync(path.join(BACKEND_ROOT, filePath));
    } catch (error) {
      if (error.code !== "ENOENT") console.error("Failed to remove file:", filePath, error.message);
    }
  });

  await knex.raw("DROP INDEX IF EXISTS properties_admin_id_created_at_idx");
  await knex.raw("ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_owner_check");
  await knex.schema.alterTable("properties", (table) => {
    table.dropColumn("admin_id");
  });
  await knex.raw("ALTER TABLE properties ALTER COLUMN user_id SET NOT NULL");
};
