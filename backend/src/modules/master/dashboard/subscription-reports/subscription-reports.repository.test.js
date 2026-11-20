// A connection-less Knex instance only compiles SQL; the query is captured instead of run
jest.mock("../../../../config/db", () => {
  const knex = require("knex")({ client: "pg" });
  const captured = [];
  const db = (...args) => {
    const query = knex(...args);
    // Awaiting or taking the first row ends the chain, so the SQL is recorded there
    const first = query.first.bind(query);
    query.first = (...columns) => {
      captured.push(first(...columns).toSQL().toNative());
      return Promise.resolve({ orders: 0, users: 0 });
    };
    return query;
  };
  db.raw = knex.raw.bind(knex);
  db.captured = captured;
  return { db };
});

const { db } = require("../../../../config/db");
const repository = require("./subscription-reports.repository");

beforeEach(() => {
  db.captured.length = 0;
});

describe("report queries", () => {
  it("sums only paid orders inside the range, by payment date", async () => {
    const from = new Date("2026-10-31T18:30:00.000Z");
    const to = new Date("2026-11-30T18:30:00.000Z");

    await repository.findPaidTotals({ from, to });

    const [{ sql, bindings }] = db.captured;
    expect(sql).toContain('from "subscription_orders" where "status" = $1 and "paid_at" >= $2 and "paid_at" < $3');
    expect(sql).toContain("coalesce(sum(total_amount), 0)::bigint as total_amount");
    expect(bindings).toEqual(["paid", from, to, 1]);
  });

  it("counts orders of a status by creation date and leaves the range open when none is given", async () => {
    await repository.countOrdersByStatus("failed", {});

    const [{ sql, bindings }] = db.captured;
    expect(sql).toContain('where "status" = $1');
    expect(sql).not.toContain("created_at");
    expect(bindings).toEqual(["failed", 1]);
  });

  it("counts distinct users with a live Standard subscription and distinct Free users who used everything", async () => {
    const now = new Date("2026-11-20T10:00:00.000Z");

    await repository.countActiveStandardUsers(now);
    await repository.countExhaustedFreeUsers();

    const [active, exhausted] = db.captured;
    expect(active.sql).toContain("count(distinct s.user_id)::int as users");
    expect(active.sql).toContain('"s"."ends_at" > $3');
    expect(active.bindings).toEqual(["standard", "active", now, 1]);
    expect(exhausted.bindings).toEqual(["free", "exhausted", 1]);
  });
});
