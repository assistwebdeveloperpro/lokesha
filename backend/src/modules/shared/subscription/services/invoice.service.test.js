jest.mock("../repositories/subscription-invoice.repository");

const invoiceRepository = require("../repositories/subscription-invoice.repository");
const { createInvoiceForOrder, createCreditNoteForOrder, getInvoiceForUser, getInvoiceForAdmin } = require("./invoice.service");

const TRX = Symbol("trx");
const ISSUED_AT = new Date("2026-11-20T10:00:00.000Z");

const ORDER = {
  id: "order-1",
  order_number: "ORD-20261120-AAAA1111",
  user_id: "user-1",
  user_gstin: "24AAACC1206D1ZM",
  listings: 2,
  months: 3,
  price_per_listing_month: 100000,
  gst_percent: "18.00",
  base_amount: 600000,
  gst_amount: 108000,
  total_amount: 708000,
  razorpay_order_id: "order_rzp_1",
  paid_at: ISSUED_AT,
};
const SUBSCRIPTION = { starts_at: ISSUED_AT, ends_at: new Date("2027-02-20T10:00:00.000Z") };
const PAYMENT = { id: "pay_1" };
const SETTINGS = { legal_name: "Lokesha Pvt Ltd", address: "Surat, Gujarat", gstin: "24AAACL0000A1Z5", sac_code: "998314", invoice_prefix: "LOK" };

beforeEach(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
  invoiceRepository.findInvoiceByOrder.mockResolvedValue(undefined);
  invoiceRepository.findSettings.mockResolvedValue(SETTINGS);
  invoiceRepository.findBuyer.mockResolvedValue({ name: "Asha Rao", email: "asha@example.com", mobile_number: "9876543210" });
  invoiceRepository.takeNextSequence.mockResolvedValue(123);
  invoiceRepository.insertInvoice.mockImplementation(async (_trx, row) => ({ id: "inv-1", ...row }));
});

describe("createInvoiceForOrder", () => {
  it("issues a numbered invoice for the financial year with a full snapshot", async () => {
    const invoice = await createInvoiceForOrder(TRX, { order: ORDER, subscription: SUBSCRIPTION, payment: PAYMENT, issuedAt: ISSUED_AT });

    expect(invoiceRepository.takeNextSequence).toHaveBeenCalledWith(TRX, "2026-27", "invoice");
    expect(invoice).toMatchObject({
      invoice_number: "LOK/2026-27/000123",
      financial_year: "2026-27",
      sequence: 123,
      type: "invoice",
      order_id: "order-1",
      user_id: "user-1",
      issued_at: ISSUED_AT,
    });

    expect(JSON.parse(invoice.snapshot)).toEqual({
      seller: { legalName: "Lokesha Pvt Ltd", address: "Surat, Gujarat", gstin: "24AAACL0000A1Z5", sacCode: "998314" },
      buyer: { name: "Asha Rao", mobile: "9876543210", email: "asha@example.com", gstin: "24AAACC1206D1ZM" },
      invoice: { number: "LOK/2026-27/000123", type: "invoice", issuedAt: "2026-11-20T10:00:00.000Z", orderNumber: "ORD-20261120-AAAA1111" },
      lineItem: {
        description: "Standard package subscription",
        listings: 2,
        months: 3,
        pricePerListingMonth: 100000,
        startsAt: "2026-11-20T10:00:00.000Z",
        endsAt: "2027-02-20T10:00:00.000Z",
      },
      amounts: { baseAmount: 600000, gstPercent: 18, gstAmount: 108000, totalAmount: 708000 },
      payment: { razorpayPaymentId: "pay_1", razorpayOrderId: "order_rzp_1", paidAt: "2026-11-20T10:00:00.000Z" },
    });
  });

  it("restarts the number in the new financial year on 1 April IST", async () => {
    await createInvoiceForOrder(TRX, {
      order: ORDER,
      subscription: SUBSCRIPTION,
      payment: PAYMENT,
      issuedAt: new Date("2027-03-31T18:30:00.000Z"),
    });

    expect(invoiceRepository.takeNextSequence).toHaveBeenCalledWith(TRX, "2027-28", "invoice");
  });

  it("returns the existing invoice for an order and takes no new number", async () => {
    const existing = { id: "inv-0", invoice_number: "LOK/2026-27/000001" };
    invoiceRepository.findInvoiceByOrder.mockResolvedValue(existing);

    await expect(createInvoiceForOrder(TRX, { order: ORDER, subscription: SUBSCRIPTION, payment: PAYMENT })).resolves.toBe(existing);
    expect(invoiceRepository.takeNextSequence).not.toHaveBeenCalled();
    expect(invoiceRepository.insertInvoice).not.toHaveBeenCalled();
  });

  it("still issues the invoice, with a warning, when the business details are incomplete", async () => {
    invoiceRepository.findSettings.mockResolvedValue({ ...SETTINGS, gstin: "", sac_code: "" });

    const invoice = await createInvoiceForOrder(TRX, { order: ORDER, subscription: SUBSCRIPTION, payment: PAYMENT, issuedAt: ISSUED_AT });

    expect(invoice.invoice_number).toBe("LOK/2026-27/000123");
    expect(console.error).toHaveBeenCalledWith("Invoice issued with incomplete seller details:", "gstin, sac_code");
  });

  it("falls back to the LOK prefix when none is configured", async () => {
    invoiceRepository.findSettings.mockResolvedValue({ ...SETTINGS, invoice_prefix: "" });

    const invoice = await createInvoiceForOrder(TRX, { order: ORDER, subscription: SUBSCRIPTION, payment: PAYMENT, issuedAt: ISSUED_AT });

    expect(invoice.invoice_number).toMatch(/^LOK\/2026-27\//);
  });
});

describe("createCreditNoteForOrder", () => {
  const ORIGINAL = {
    id: "inv-1",
    invoice_number: "LOK/2026-27/000007",
    snapshot: {
      seller: { legalName: "Lokesha Pvt Ltd" },
      amounts: { totalAmount: 708000 },
      invoice: { number: "LOK/2026-27/000007", type: "invoice", issuedAt: "2026-11-20T10:00:00.000Z", orderNumber: "ORD-1" },
    },
  };

  beforeEach(() => {
    invoiceRepository.findInvoiceByOrder.mockImplementation(async (_trx, _orderId, type) => (type === "invoice" ? ORIGINAL : undefined));
    invoiceRepository.findSettings.mockResolvedValue({ ...SETTINGS, credit_note_prefix: "LOK-CN" });
    invoiceRepository.takeNextSequence.mockResolvedValue(4);
  });

  it("issues a numbered credit note linked to the invoice, copying what was charged", async () => {
    const note = await createCreditNoteForOrder(TRX, { order: ORDER, issuedAt: ISSUED_AT });

    expect(invoiceRepository.takeNextSequence).toHaveBeenCalledWith(TRX, "2026-27", "credit_note");
    expect(note).toMatchObject({
      invoice_number: "LOK-CN/2026-27/000004",
      type: "credit_note",
      parent_invoice_id: "inv-1",
      order_id: "order-1",
      user_id: "user-1",
      sequence: 4,
    });
    expect(JSON.parse(note.snapshot)).toEqual({
      seller: { legalName: "Lokesha Pvt Ltd" },
      amounts: { totalAmount: 708000 },
      invoice: {
        number: "LOK-CN/2026-27/000004",
        type: "credit_note",
        issuedAt: "2026-11-20T10:00:00.000Z",
        orderNumber: "ORD-20261120-AAAA1111",
        originalInvoiceNumber: "LOK/2026-27/000007",
      },
    });
  });

  it("returns the existing credit note and takes no new number", async () => {
    const existing = { id: "cn-1" };
    invoiceRepository.findInvoiceByOrder.mockResolvedValue(existing);

    await expect(createCreditNoteForOrder(TRX, { order: ORDER })).resolves.toBe(existing);
    expect(invoiceRepository.takeNextSequence).not.toHaveBeenCalled();
  });

  it("skips the credit note with a log when the order has no invoice, so the refund still stands", async () => {
    invoiceRepository.findInvoiceByOrder.mockResolvedValue(undefined);

    await expect(createCreditNoteForOrder(TRX, { order: ORDER })).resolves.toBeNull();
    expect(invoiceRepository.insertInvoice).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith("No invoice to credit for order:", "ORD-20261120-AAAA1111");
  });

  it("falls back to the LOK-CN prefix when none is configured", async () => {
    invoiceRepository.findSettings.mockResolvedValue({ ...SETTINGS, credit_note_prefix: "" });

    const note = await createCreditNoteForOrder(TRX, { order: ORDER, issuedAt: ISSUED_AT });

    expect(note.invoice_number).toMatch(/^LOK-CN\/2026-27\//);
  });
});

describe("invoice downloads", () => {
  const invoice = { invoice_number: "LOK/2026-27/000123", snapshot: { invoice: { number: "LOK/2026-27/000123" } } };

  it("returns the user's own invoice and nothing for another user's", async () => {
    invoiceRepository.findInvoiceForUser.mockResolvedValueOnce(invoice).mockResolvedValueOnce(undefined);

    await expect(getInvoiceForUser("user-1", "inv-1")).resolves.toEqual({ invoiceNumber: "LOK/2026-27/000123", snapshot: invoice.snapshot });
    await expect(getInvoiceForUser("user-2", "inv-1")).rejects.toMatchObject({ statusCode: 404 });
    expect(invoiceRepository.findInvoiceForUser).toHaveBeenCalledWith("user-2", "inv-1");
  });

  it("lets an admin read any invoice", async () => {
    invoiceRepository.findInvoiceById.mockResolvedValueOnce(invoice).mockResolvedValueOnce(undefined);

    await expect(getInvoiceForAdmin("inv-1")).resolves.toMatchObject({ invoiceNumber: "LOK/2026-27/000123" });
    await expect(getInvoiceForAdmin("missing")).rejects.toMatchObject({ statusCode: 404 });
  });
});
