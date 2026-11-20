jest.mock("./subscription-users.repository");
jest.mock("../../../user/dashboard/user-subscription/user-subscription-overview.service");

const repository = require("./subscription-users.repository");
const overview = require("../../../user/dashboard/user-subscription/user-subscription-overview.service");
const service = require("./subscription-users.service");

const PAGING = { page: 1, limit: 10 };
const USER = { id: "user-1", name: "Asha Rao", email: "asha@example.com", mobile_number: "9876543210", role: "agent", created_at: new Date("2026-11-01T00:00:00Z") };

describe("listUsers", () => {
  it("maps the rolled-up rows and the paging", async () => {
    repository.findUsers.mockResolvedValue([
      {
        id: "user-1",
        name: "Asha Rao",
        mobile_number: "9876543210",
        email: "asha@example.com",
        package_codes: ["free", "standard"],
        credits_bought: 7,
        credits_used: 3,
        first_start: new Date("2026-11-01T00:00:00Z"),
        last_end: new Date("2027-02-01T00:00:00Z"),
        has_active: true,
        amount_paid: "708000",
        payment_status: "paid",
      },
      {
        id: "user-2",
        name: "Ravi",
        mobile_number: "9000000001",
        email: null,
        package_codes: ["free"],
        credits_bought: 2,
        credits_used: 2,
        first_start: new Date("2026-11-02T00:00:00Z"),
        last_end: null,
        has_active: false,
        amount_paid: null,
        payment_status: null,
      },
    ]);
    repository.countUsers.mockResolvedValue(2);

    const result = await service.listUsers({ ...PAGING, search: "a" });

    expect(repository.findUsers).toHaveBeenCalledWith({ ...PAGING, search: "a" });
    expect(result).toMatchObject({ page: 1, limit: 10, total: 2 });
    expect(result.items[0]).toEqual({
      id: "user-1",
      name: "Asha Rao",
      mobile: "9876543210",
      email: "asha@example.com",
      packages: ["free", "standard"],
      creditsBought: 7,
      creditsUsed: 3,
      startsAt: new Date("2026-11-01T00:00:00Z"),
      endsAt: new Date("2027-02-01T00:00:00Z"),
      amountPaid: 708000,
      paymentStatus: "paid",
      hasActiveSubscription: true,
    });
    expect(result.items[1]).toMatchObject({ amountPaid: 0, paymentStatus: null, endsAt: null, hasActiveSubscription: false });
  });
});

describe("getUserDetail", () => {
  it("returns the user with the same overview the user sees", async () => {
    repository.findUser.mockResolvedValue(USER);
    overview.getOverview.mockResolvedValue({ summary: { state: "active" }, subscriptions: [], notice: null });

    await expect(service.getUserDetail("user-1")).resolves.toEqual({
      user: { id: "user-1", name: "Asha Rao", mobile: "9876543210", email: "asha@example.com", role: "agent", joinedAt: USER.created_at },
      summary: { state: "active" },
      subscriptions: [],
      notice: null,
    });
    expect(overview.getOverview).toHaveBeenCalledWith("user-1");
  });

  it("answers 404 for an unknown user", async () => {
    repository.findUser.mockResolvedValue(undefined);

    await expect(service.getUserDetail("missing")).rejects.toMatchObject({ statusCode: 404 });
    expect(overview.getOverview).not.toHaveBeenCalled();
  });
});

describe("user lists", () => {
  it.each([
    ["history", "listUserHistory", "listHistory"],
    ["payments", "listUserPayments", "listPayments"],
    ["ledger", "listUserLedger", "listLedger"],
  ])("returns the %s of an existing user", async (_label, serviceMethod, overviewMethod) => {
    repository.findUser.mockResolvedValue(USER);
    overview[overviewMethod].mockResolvedValue({ items: [], page: 1, limit: 10, total: 0 });

    await expect(service[serviceMethod]("user-1", PAGING)).resolves.toEqual({ items: [], page: 1, limit: 10, total: 0 });
    expect(overview[overviewMethod]).toHaveBeenCalledWith("user-1", PAGING);
  });

  it("answers 404 for an unknown user before loading a list", async () => {
    repository.findUser.mockResolvedValue(undefined);

    await expect(service.listUserPayments("missing", PAGING)).rejects.toMatchObject({ statusCode: 404 });
    expect(overview.listPayments).not.toHaveBeenCalled();
  });
});
