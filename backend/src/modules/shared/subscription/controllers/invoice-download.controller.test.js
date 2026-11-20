const { PassThrough } = require("stream");
const { downloadInvoice } = require("./invoice-download.controller");

const SNAPSHOT = {
  seller: { legalName: "Lokesha", address: "", gstin: "", sacCode: "" },
  buyer: { name: "Asha Rao", mobile: null, email: null, gstin: null },
  invoice: { number: "LOK/2026-27/000123", type: "invoice", issuedAt: "2026-11-20T10:00:00.000Z", orderNumber: "ORD-1" },
  lineItem: { description: "Standard package subscription", listings: 1, months: 1, pricePerListingMonth: 100000, startsAt: "2026-11-20T10:00:00.000Z", endsAt: "2026-12-20T10:00:00.000Z" },
  amounts: { baseAmount: 100000, gstPercent: 18, gstAmount: 18000, totalAmount: 118000 },
  payment: { razorpayPaymentId: "pay_1", razorpayOrderId: "order_1", paidAt: "2026-11-20T10:00:00.000Z" },
};

function buildResponse() {
  const res = new PassThrough();
  res.setHeader = jest.fn();
  res.status = jest.fn(() => res);
  res.json = jest.fn();
  return res;
}

const collect = (stream) =>
  new Promise((resolve) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });

describe("downloadInvoice", () => {
  it("streams the invoice as an attachment with a safe file name", async () => {
    const res = buildResponse();
    const loadInvoice = jest.fn().mockResolvedValue({ invoiceNumber: "LOK/2026-27/000123", snapshot: SNAPSHOT });
    const req = { user: { id: "user-1" }, params: { id: "inv-1" } };
    const finished = collect(res);

    await downloadInvoice(loadInvoice)(req, res);
    const body = await finished;

    expect(loadInvoice).toHaveBeenCalledWith(req);
    expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "application/pdf");
    expect(res.setHeader).toHaveBeenCalledWith("Content-Disposition", 'attachment; filename="Invoice-LOK-2026-27-000123.pdf"');
    expect(body.subarray(0, 5).toString()).toBe("%PDF-");
  });

  it("answers with the error status and sends no file when the invoice cannot be read", async () => {
    const res = buildResponse();
    const loadInvoice = jest.fn().mockRejectedValue(Object.assign(new Error("Invoice not found"), { statusCode: 404 }));

    await downloadInvoice(loadInvoice)({}, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Invoice not found" });
    expect(res.setHeader).not.toHaveBeenCalled();
  });

  it("answers 500 for an unexpected failure", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    const res = buildResponse();

    await downloadInvoice(jest.fn().mockRejectedValue(new Error("boom")))({}, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
