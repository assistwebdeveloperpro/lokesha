const knex = require("knex");

// A real Knex instance with no database behind it: every query is built exactly as in production,
// then recorded instead of sent, and answered with one empty row
function createSqlCaptureDb() {
  const db = knex({ client: "pg" });
  const queries = [];

  // Transactions use a derived client, so the fake sits on the connection that all of them share
  const connection = {
    __knexUid: "capture",
    query(config, callback) {
      queries.push({ sql: config.text, bindings: config.values });
      // One empty row, since counts and sequences read the first row of their result
      callback(null, { rows: [{}], rowCount: 1, command: config.text.trim().split(" ")[0].toUpperCase() });
    },
  };

  db.client.acquireConnection = async () => connection;
  db.client.releaseConnection = async () => undefined;

  const last = () => queries[queries.length - 1];
  return { db, queries, last, reset: () => (queries.length = 0) };
}

module.exports = { createSqlCaptureDb };
