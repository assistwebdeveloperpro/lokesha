const { createSqlCaptureDb } = require("./sql-capture-db");

describe("createSqlCaptureDb", () => {
  it("records the SQL and bindings of a query instead of running it", async () => {
    const capture = createSqlCaptureDb();

    const rows = await capture.db("users").where({ id: 1 }).select("id");

    expect(rows).toEqual([{}]);
    expect(capture.last()).toEqual({ sql: 'select "id" from "users" where "id" = $1', bindings: [1] });
  });

  it("records every statement of a transaction", async () => {
    const capture = createSqlCaptureDb();

    await capture.db.transaction(async (trx) => {
      await trx("users").where({ id: 1 }).update({ name: "A" });
    });

    expect(capture.queries.map(({ sql }) => sql.split(" ")[0])).toEqual(expect.arrayContaining(["update"]));
  });
});
