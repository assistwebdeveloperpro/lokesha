// A connection-less Knex instance only compiles SQL, so the query shape is checked without a database
jest.mock("../../../../config/db", () => ({ db: require("knex")({ client: "pg" }) }));

const { buildTransactionsQuery } = require("./subscription-transactions.repository");

const compile = (filters = {}) => buildTransactionsQuery(filters).select("o.id").toSQL().toNative();

describe("buildTransactionsQuery", () => {
  it("joins the user, the package, the invoice and the credit note of each order", () => {
    const { sql, bindings } = compile();

    expect(sql).toContain('inner join "users" as "u" on "u"."id" = "o"."user_id"');
    expect(sql).toContain('inner join "subscription_packages" as "p" on "p"."id" = "o"."package_id"');
    expect(sql).toContain('left join "subscription_invoices" as "i" on "i"."order_id" = "o"."id" and "i"."type" = $1');
    expect(sql).toContain('left join "subscription_invoices" as "c" on "c"."order_id" = "o"."id" and "c"."type" = $2');
    expect(bindings).toEqual(["invoice", "credit_note"]);
  });

  it("joins the property of a lead purchase and keeps orders that have none", () => {
    expect(compile().sql).toContain('left join "properties" as "pr" on "pr"."id" = "o"."property_id"');
  });

  it("filters by status and user", () => {
    const { sql, bindings } = compile({ status: "failed", userId: "user-1" });

    expect(sql).toContain('"o"."status" = $');
    expect(sql).toContain('"o"."user_id" = $');
    expect(bindings).toEqual(expect.arrayContaining(["failed", "user-1"]));
  });

  it("includes the start of the range and excludes the end", () => {
    const from = new Date("2026-11-19T18:30:00.000Z");
    const to = new Date("2026-11-21T18:30:00.000Z");

    const { sql, bindings } = compile({ from, to });

    expect(sql).toContain('"o"."created_at" >= $');
    expect(sql).toContain('"o"."created_at" < $');
    expect(bindings).toEqual(expect.arrayContaining([from, to]));
  });

  it("searches order number, user and gateway references with an escaped pattern", () => {
    const { sql, bindings } = compile({ search: "pay_1%" });

    ["o\".\"order_number", "u\".\"name", "u\".\"mobile_number", "o\".\"razorpay_order_id", "o\".\"razorpay_payment_id"].forEach((column) =>
      expect(sql).toContain(`"${column}" ilike $`),
    );
    expect(bindings.filter((value) => value === "%pay\\_1\\%%")).toHaveLength(5);
  });

  it("adds no filter when none is given", () => {
    expect(compile().sql).not.toContain(" where ");
  });
});
