jest.mock("./subscription-transactions.repository");

const repository = require("./subscription-transactions.repository");
const service = require("./subscription-transactions.service");

const ROW = {
  id: "order-1",
  order_number: "ORD-20261120-AAAA1111",
  listings: 2,
  months: 3,
  price_per_listing_month: 100000,
  gst_percent: "18.00",
  base_amount: 600000,
  gst_amount: 108000,
  total_amount: 708000,
  status: "paid",
  razorpay_order_id: "order_rzp_1",
  razorpay_payment_id: "pay_1",
  failure_reason: null,
  paid_at: new Date("2026-11-20T10:00:00.000Z"),
  refunded_at: null,
  created_at: new Date("2026-11-20T09:55:00.000Z"),
  user_gstin: "24AAACC1206D1ZM",
  user_id: "user-1",
  user_name: "Asha Rao",
  user_mobile: "9876543210",
  package_name: "Standard",
  invoice_id: "inv-1",
  invoice_number: "LOK/2026-27/000001",
  credit_note_id: null,
  credit_note_number: null,
};

describe("listTransactions", () => {
  beforeEach(() => {
    repository.findTransactions.mockResolvedValue([ROW]);
    repository.countTransactions.mockResolvedValue(1);
  });

  it("maps a row with its user, invoice and amounts", async () => {
    const result = await service.listTransactions({ page: 1, limit: 10 });

    expect(result).toMatchObject({ page: 1, limit: 10, total: 1 });
    expect(result.items[0]).toEqual({
      id: "order-1",
      orderNumber: "ORD-20261120-AAAA1111",
      user: { id: "user-1", name: "Asha Rao", mobile: "9876543210" },
      packageName: "Standard",
      listings: 2,
      months: 3,
      pricePerListingMonth: 100000,
      gstPercent: 18,
      baseAmount: 600000,
      gstAmount: 108000,
      totalAmount: 708000,
      status: "paid",
      razorpayOrderId: "order_rzp_1",
      razorpayPaymentId: "pay_1",
      failureReason: null,
      userGstin: "24AAACC1206D1ZM",
      paidAt: ROW.paid_at,
      refundedAt: null,
      createdAt: ROW.created_at,
      invoice: { id: "inv-1", number: "LOK/2026-27/000001" },
      creditNote: null,
    });
  });

  it("turns the IST filter days into an inclusive start and an exclusive end instant", async () => {
    await service.listTransactions({ page: 2, limit: 5, status: "failed", search: "ORD", userId: "user-1", from: "2026-11-01", to: "2026-11-30" });

    const expected = {
      search: "ORD",
      status: "failed",
      userId: "user-1",
      from: new Date("2026-10-31T18:30:00.000Z"),
      to: new Date("2026-11-30T18:30:00.000Z"),
    };
    expect(repository.findTransactions).toHaveBeenCalledWith({ ...expected, page: 2, limit: 5 });
    expect(repository.countTransactions).toHaveBeenCalledWith(expected);
  });

  it("leaves the range open when no days are given and links a credit note", async () => {
    repository.findTransactions.mockResolvedValue([{ ...ROW, status: "refunded", credit_note_id: "cn-1", credit_note_number: "LOK-CN/2026-27/000001" }]);

    const result = await service.listTransactions({ page: 1, limit: 10 });

    expect(repository.countTransactions).toHaveBeenCalledWith(expect.objectContaining({ from: undefined, to: undefined }));
    expect(result.items[0].creditNote).toEqual({ id: "cn-1", number: "LOK-CN/2026-27/000001" });
  });
});

describe("exportTransactions", () => {
  const NOW = new Date("2026-11-20T10:00:00.000Z");

  it("writes a CSV in rupees and IST with a dated file name, capped at the export limit", async () => {
    repository.findTransactionsForExport.mockResolvedValue([ROW]);

    const { fileName, csv } = await service.exportTransactions({ status: "paid" }, NOW);

    expect(fileName).toBe("subscription-transactions-2026-11-20.csv");
    expect(repository.findTransactionsForExport).toHaveBeenCalledWith(expect.objectContaining({ status: "paid" }), service.MAX_EXPORT_ROWS);

    const [header, line] = csv.replace("﻿", "").split("\r\n");
    expect(header.split(",")[0]).toBe("Order number");
    expect(header).toContain("Total (Rs)");
    expect(line).toBe(
      "ORD-20261120-AAAA1111,2026-11-20 15:25,2026-11-20 15:30,Asha Rao,9876543210,24AAACC1206D1ZM,Standard,2,3,1000.00,6000.00,18,1080.00,7080.00,paid,order_rzp_1,pay_1,LOK/2026-27/000001,,",
    );
  });

  it("writes only the header when nothing matches", async () => {
    repository.findTransactionsForExport.mockResolvedValue([]);

    const { csv } = await service.exportTransactions({}, NOW);

    expect(csv.replace("﻿", "").trim().split("\r\n")).toHaveLength(1);
  });

  it("neutralises a user name that looks like a spreadsheet formula", async () => {
    repository.findTransactionsForExport.mockResolvedValue([{ ...ROW, user_name: "=HYPERLINK(\"http://x\")" }]);

    const { csv } = await service.exportTransactions({}, NOW);

    expect(csv).toContain("\"'=HYPERLINK(\"\"http://x\"\")\"");
  });
});
