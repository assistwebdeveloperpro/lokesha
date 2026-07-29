const knex = require("knex");
const knexConfig = require("../../knexfile");

const environment = process.env.NODE_ENV || "development";
const config = knexConfig[environment];

const db = knex(config);

async function testConnection() {
  try {
    await db.raw("SELECT 1");
    console.log("PostgreSQL is connected successfully!");
  } catch (error) {
    console.error("PostgreSQL connection failed:", error.message);
    process.exit(1);
  }
}

module.exports = { db, testConnection };
