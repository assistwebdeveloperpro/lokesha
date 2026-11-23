jest.mock("./user-subscription-overview.repository");

const repository = require("./user-subscription-overview.repository");
const service = require("./user-subscription-overview.service");

const NOW = new Date("2026-11-20T10:00:00.000Z");
const PAGING = { page: 1, limit: 10 };

const subscriptionRow = (overrides = {}) => ({
  id: "sub-1",
  source: "purchase",
  status: "active",
  total_credits: 5,
  used_credits: 1,
  lead_limit: null,
  starts_at: new Date("2026-11-01T00:00:00Z"),
  ends_at: new Date("2026-11-27T10:00:00Z"),
  package_code: "standard",
  package_name: "Standard",
  package_title: "Standard Package",
  ...overrides,
});

const freeRow = (overrides = {}) =>
  subscriptionRow({ id: "sub-free", source: "free_signup", total_credits: 2, used_credits: 0, lead_limit: 2, ends_at: null, package_code: "free", package_name: "Free", package_title: "Free Package", ...overrides });

beforeEach(() => {
  repository.findCurrentSubscriptions.mockResolvedValue([freeRow(), subscriptionRow()]);
  repository.countReservedProperties.mockResolvedValue(0);
  repository.hasAnySubscription.mockResolvedValue(true);
  repository.findLatestOrder.mockResolvedValue(undefined);
});

describe("getOverview", () => {
  it("adds up the credits and shows the days left on the paid subscription", async () => {
    const { summary, subscriptions } = await service.getOverview("user-1", NOW);

    expect(summary).toEqual({
      state: "active",
      totalCredits: 7,
      usedCredits: 1,
      remainingCredits: 6,
      reservedCredits: 0,
      submittableCredits: 6,
      nextEndsAt: new Date("2026-11-27T10:00:00Z"),
      daysLeft: 7,
    });
    expect(subscriptions[0]).toMatchObject({ packageCode: "free", remainingCredits: 2, daysLeft: null, leadLimit: 2 });
    expect(subscriptions[1]).toMatchObject({ packageCode: "standard", remainingCredits: 4, daysLeft: 7 });
  });

  it("holds back credits for listings waiting for review", async () => {
    repository.countReservedProperties.mockResolvedValue(2);

    const { summary } = await service.getOverview("user-1", NOW);

    expect(summary).toMatchObject({ remainingCredits: 6, reservedCredits: 2, submittableCredits: 4 });
  });

  it.each([
    ["is low with one credit left", [freeRow({ used_credits: 1 })], true, "low"],
    ["has ended when nothing is left after earlier subscriptions", [], true, "ended"],
    ["is none for a user who never had a subscription", [], false, "none"],
  ])("state %s", async (_label, rows, hasHistory, expected) => {
    repository.findCurrentSubscriptions.mockResolvedValue(rows);
    repository.hasAnySubscription.mockResolvedValue(hasHistory);

    const { summary } = await service.getOverview("user-1", NOW);

    expect(summary.state).toBe(expected);
    expect(summary.nextEndsAt).toBeNull();
  });

  describe("payment notice", () => {
    const order = (overrides = {}) => ({ id: "order-1", order_number: "ORD-1", status: "pending", created_at: new Date("2026-11-20T09:00:00Z"), ...overrides });

    it.each(["pending", "failed"])("shows a recent %s order", async (status) => {
      repository.findLatestOrder.mockResolvedValue(order({ status }));

      const { notice } = await service.getOverview("user-1", NOW);

      expect(notice).toEqual({ type: status, orderId: "order-1", orderNumber: "ORD-1", createdAt: new Date("2026-11-20T09:00:00Z") });
    });

    it.each([
      ["a paid order", order({ status: "paid" })],
      ["a created order that never reached the gateway", order({ status: "created" })],
      ["an old failed order", order({ status: "failed", created_at: new Date("2026-11-18T09:00:00Z") })],
      ["no order", undefined],
    ])("shows nothing for %s", async (_label, latest) => {
      repository.findLatestOrder.mockResolvedValue(latest);

      expect((await service.getOverview("user-1", NOW)).notice).toBeNull();
    });
  });
});

describe("getCredits", () => {
  it("returns what is left for Post Property", async () => {
    repository.countReservedProperties.mockResolvedValue(1);

    await expect(service.getCredits("user-1", NOW)).resolves.toEqual({ available: 6, reserved: 1, submittable: 5 });
  });

  it("never goes below zero", async () => {
    repository.findCurrentSubscriptions.mockResolvedValue([]);
    repository.countReservedProperties.mockResolvedValue(3);

    await expect(service.getCredits("user-1", NOW)).resolves.toEqual({ available: 0, reserved: 3, submittable: 0 });
  });
});

describe("lists", () => {
  it("maps the subscription history with paging", async () => {
    repository.findSubscriptionHistory.mockResolvedValue([subscriptionRow({ status: "expired" })]);
    repository.countSubscriptionHistory.mockResolvedValue(4);

    const result = await service.listHistory("user-1", PAGING, NOW);

    expect(repository.findSubscriptionHistory).toHaveBeenCalledWith("user-1", PAGING);
    expect(result).toMatchObject({ page: 1, limit: 10, total: 4, items: [{ id: "sub-1", status: "expired" }] });
  });

  it("maps payments and links a paid order to its invoice", async () => {
    repository.findOrders.mockResolvedValue([
      { id: "o-1", order_number: "ORD-1", status: "paid", listings: 2, months: 3, price_per_listing_month: 100000, gst_percent: "18.00", base_amount: 600000, gst_amount: 108000, total_amount: 708000, failure_reason: null, paid_at: NOW, created_at: NOW, invoice_id: "inv-1", invoice_number: "LOK/2026-27/000001" },
      { id: "o-2", order_number: "ORD-2", status: "failed", listings: 1, months: 1, price_per_listing_month: 100000, gst_percent: "18.00", base_amount: 100000, gst_amount: 18000, total_amount: 118000, failure_reason: "Card declined", paid_at: null, created_at: NOW, invoice_id: null, invoice_number: null },
    ]);
    repository.countOrders.mockResolvedValue(2);

    const { items } = await service.listPayments("user-1", PAGING);

    expect(items[0]).toMatchObject({ orderNumber: "ORD-1", gstPercent: 18, totalAmount: 708000, invoice: { id: "inv-1", number: "LOK/2026-27/000001" } });
    expect(items[1]).toMatchObject({ status: "failed", failureReason: "Card declined", invoice: null });
  });

  it("maps a lead purchase with its leads and property and no listings or months", async () => {
    repository.findOrders.mockResolvedValue([
      {
        id: "o-3",
        order_number: "ORD-3",
        status: "paid",
        order_type: "lead_pack",
        listings: null,
        months: null,
        price_per_listing_month: null,
        leads: 10,
        price_per_lead: 100,
        property_title: "Sky Heights",
        property_listing_number: "12",
        gst_percent: "18.00",
        base_amount: 1000,
        gst_amount: 180,
        total_amount: 1180,
        paid_at: NOW,
        created_at: NOW,
        invoice_id: "inv-3",
        invoice_number: "LOK/2026-27/000003",
      },
    ]);
    repository.countOrders.mockResolvedValue(1);

    const { items } = await service.listPayments("user-1", PAGING);

    expect(items[0]).toMatchObject({
      orderType: "lead_pack",
      listings: null,
      months: null,
      leads: 10,
      pricePerLead: 100,
      property: { title: "Sky Heights", listingNumber: 12 },
      totalAmount: 1180,
    });
  });

  it("maps credit ledger entries, with and without a property", async () => {
    repository.findLedger.mockResolvedValue([
      { id: "l-1", type: "used", credits: -1, reason: "Property published", created_at: NOW, property_id: "p-1", property_title: "Sky Heights", listing_number: "12" },
      { id: "l-2", type: "granted", credits: 2, reason: "Free package", created_at: NOW, property_id: null, property_title: null, listing_number: null },
    ]);
    repository.countLedger.mockResolvedValue(2);

    const { items } = await service.listLedger("user-1", PAGING);

    expect(items[0]).toMatchObject({ type: "used", credits: -1, property: { id: "p-1", title: "Sky Heights", listingNumber: 12 } });
    expect(items[1].property).toBeNull();
  });

  it("maps lead usage per property and flags a reached limit", async () => {
    repository.findPropertyLeadUsage.mockResolvedValue([
      { id: "p-1", title: "Sky Heights", listing_number: "12", status: "published", lead_limit: 2, extra_leads: 0, expires_at: NOW, leads_count: "2" },
      { id: "p-2", title: "Green Villa", listing_number: "13", status: "published", lead_limit: 2, extra_leads: 0, expires_at: NOW, leads_count: "1" },
      { id: "p-3", title: "City Loft", listing_number: "14", status: "published", lead_limit: null, extra_leads: 0, expires_at: NOW, leads_count: "9" },
    ]);
    repository.countPropertyLeadUsage.mockResolvedValue(3);

    const { items } = await service.listPropertyUsage("user-1", PAGING);

    expect(items.map(({ leadsReceived, leadLimit, isLimitReached }) => ({ leadsReceived, leadLimit, isLimitReached }))).toEqual([
      { leadsReceived: 2, leadLimit: 2, isLimitReached: true },
      { leadsReceived: 1, leadLimit: 2, isLimitReached: false },
      { leadsReceived: 9, leadLimit: null, isLimitReached: false },
    ]);
  });

  it("adds bought leads to the limit and lifts the reached flag at the boundary", async () => {
    repository.findPropertyLeadUsage.mockResolvedValue([
      { id: "p-1", title: "Sky Heights", listing_number: "12", status: "published", lead_limit: 2, extra_leads: 10, expires_at: NOW, leads_count: "11" },
      { id: "p-2", title: "Green Villa", listing_number: "13", status: "published", lead_limit: 2, extra_leads: 10, expires_at: NOW, leads_count: "12" },
      { id: "p-3", title: "City Loft", listing_number: "14", status: "published", lead_limit: null, extra_leads: 5, expires_at: NOW, leads_count: "30" },
    ]);
    repository.countPropertyLeadUsage.mockResolvedValue(3);

    const { items } = await service.listPropertyUsage("user-1", PAGING);

    expect(items.map(({ leadLimit, extraLeads, isLimitReached }) => ({ leadLimit, extraLeads, isLimitReached }))).toEqual([
      { leadLimit: 12, extraLeads: 10, isLimitReached: false },
      { leadLimit: 12, extraLeads: 10, isLimitReached: true },
      { leadLimit: null, extraLeads: 5, isLimitReached: false },
    ]);
  });
});
