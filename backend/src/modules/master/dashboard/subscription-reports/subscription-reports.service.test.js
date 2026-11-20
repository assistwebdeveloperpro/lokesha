jest.mock("./subscription-reports.repository");

const repository = require("./subscription-reports.repository");
const { getOverview } = require("./subscription-reports.service");

const NOW = new Date("2026-11-20T10:00:00.000Z");

beforeEach(() => {
  repository.findPaidTotals.mockResolvedValue({ orders: 3, base_amount: "1200000", gst_amount: "216000", total_amount: "1416000" });
  repository.findRefundedTotals.mockResolvedValue({ orders: 1, total_amount: "118000" });
  repository.countOrdersByStatus.mockImplementation(async (status) => ({ failed: 4, pending: 2 })[status]);
  repository.countActiveStandardUsers.mockResolvedValue(7);
  repository.countExhaustedFreeUsers.mockResolvedValue(12);
});

describe("getOverview", () => {
  it("returns revenue, GST, failed payments and the two user counts", async () => {
    await expect(getOverview({}, NOW)).resolves.toEqual({
      range: { from: null, to: null },
      revenue: {
        paidOrders: 3,
        baseAmount: 1200000,
        gstCollected: 216000,
        totalAmount: 1416000,
        refundedOrders: 1,
        refundedAmount: 118000,
      },
      payments: { failed: 4, pending: 2 },
      users: { activeStandard: 7, exhaustedFree: 12 },
    });
  });

  it("covers all time when no range is given and asks for the active users as of now", async () => {
    await getOverview({}, NOW);

    expect(repository.findPaidTotals).toHaveBeenCalledWith({ from: undefined, to: undefined });
    expect(repository.countActiveStandardUsers).toHaveBeenCalledWith(NOW);
  });

  it("turns the IST days into an inclusive start and an exclusive end instant for the money figures", async () => {
    const result = await getOverview({ from: "2026-11-01", to: "2026-11-30" }, NOW);

    const range = { from: new Date("2026-10-31T18:30:00.000Z"), to: new Date("2026-11-30T18:30:00.000Z") };
    expect(repository.findPaidTotals).toHaveBeenCalledWith(range);
    expect(repository.findRefundedTotals).toHaveBeenCalledWith(range);
    expect(repository.countOrdersByStatus).toHaveBeenCalledWith("failed", range);
    expect(repository.countOrdersByStatus).toHaveBeenCalledWith("pending", range);
    expect(result.range).toEqual({ from: "2026-11-01", to: "2026-11-30" });
  });

  it("returns zeros when nothing was sold", async () => {
    repository.findPaidTotals.mockResolvedValue({ orders: 0, base_amount: "0", gst_amount: "0", total_amount: "0" });
    repository.findRefundedTotals.mockResolvedValue({ orders: 0, total_amount: "0" });

    const { revenue } = await getOverview({}, NOW);

    expect(revenue).toMatchObject({ paidOrders: 0, totalAmount: 0, gstCollected: 0, refundedAmount: 0 });
  });
});
