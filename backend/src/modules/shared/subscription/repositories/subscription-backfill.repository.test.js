// A connection-less Knex instance only compiles SQL, so the query shape is checked without a database
jest.mock("../../../../config/db", () => ({ db: require("knex")({ client: "pg" }) }));

const { buildUsersQuery } = require("./subscription-backfill.repository");

const { sql, bindings } = buildUsersQuery().select("u.id").toSQL().toNative();

describe("usersWithoutFreePackage", () => {
  it("leaves out Lokesha staff", () => {
    expect(sql).toContain('where not "u"."role" = $1');
    expect(bindings[0]).toBe("lokesha_staff");
  });

  it("leaves out users who already have a Free package, from signup or an earlier backfill", () => {
    expect(sql).toContain('and not exists (select 1 from "user_subscriptions" as "s" where s.user_id = u.id and "s"."source" in ($2, $3))');
    expect(bindings.slice(1)).toEqual(["free_signup", "launch_backfill"]);
  });
});
