const fs = require("fs");
const path = require("path");

const BACKEND_ROOT = path.join(__dirname, "../../..");

/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable("property_floor_plans", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("property_id")
      .notNullable()
      .references("id")
      .inTable("properties")
      .onDelete("CASCADE");
    table.string("label", 100).nullable();
    table.string("file_path", 255).notNullable();
    table.string("original_name", 255).nullable();
    table.string("mime_type", 50).notNullable();
    table.integer("file_size").notNullable();
    table.integer("sort_order").notNullable().defaultTo(0);
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.index(["property_id", "sort_order"]);
  });
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  const rows = await knex("property_floor_plans").select("file_path");

  // Remove floor plan files from disk before the table is dropped
  rows.forEach(({ file_path: filePath }) => {
    try {
      fs.unlinkSync(path.join(BACKEND_ROOT, filePath));
    } catch (error) {
      if (error.code !== "ENOENT") console.error("Failed to remove file:", filePath, error.message);
    }
  });

  await knex.schema.dropTableIfExists("property_floor_plans");
};
