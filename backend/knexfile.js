require("dotenv").config();

/** @type {import('knex').Knex.Config} */
const baseConfig = {
  client: "pg",
  connection: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    directory: "./src/database/migrations",
    tableName: "knex_migrations",
  },
  seeds: {
    directory: "./src/database/seeds",
  },
};

module.exports = {
  development: { ...baseConfig },
  test: { ...baseConfig },
  production: { ...baseConfig },
};
