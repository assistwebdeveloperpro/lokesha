// A connection-less Knex instance only compiles SQL, so the query shape is checked without a database
jest.mock("../../../../config/db", () => ({ db: require("knex")({ client: "pg" }) }));

const { buildUsersQuery } = require("./subscription-users.repository");

const compile = (filters = {}) => buildUsersQuery(filters).select("u.id").toSQL().toNative();

describe("buildUsersQuery", () => {
  it("lists users who have subscriptions and leaves out Lokesha staff", () => {
    const { sql, bindings } = compile();

    expect(sql).toContain('from "users" as "u" inner join (select "s"."user_id"');
    expect(sql).toContain('group by "s"."user_id"');
    expect(sql).toContain('left join (select "user_id", sum(total_amount)::bigint as amount_paid from "subscription_orders" where "status" = $');
    expect(sql).toContain('select distinct on ("user_id") "user_id", "status" from "subscription_orders" order by "user_id" asc, "created_at" desc');
    expect(sql).toContain('where not "u"."role" = $');
    expect(bindings).toContain("lokesha_staff");
  });

  it("filters by package", () => {
    const { sql, bindings } = compile({ package: "standard" });

    expect(sql).toMatch(/\$\d+ = any\(t\.package_codes\)/);
    expect(bindings).toContain("standard");
  });

  it("filters active by the live flag and other statuses by the status list", () => {
    expect(compile({ status: "active" }).sql).toContain('"t"."has_active" = $');
    expect(compile({ status: "active" }).bindings).toContain(true);

    const expired = compile({ status: "expired" });
    expect(expired.sql).toMatch(/\$\d+ = any\(t\.statuses\)/);
    expect(expired.bindings).toContain("expired");
  });

  it("searches name and mobile with an escaped contains pattern", () => {
    const { sql, bindings } = compile({ search: "50%" });

    expect(sql).toContain('"u"."name" ilike $');
    expect(sql).toContain('"u"."mobile_number" ilike $');
    expect(bindings.filter((value) => value === "%50\\%%")).toHaveLength(2);
  });
});
