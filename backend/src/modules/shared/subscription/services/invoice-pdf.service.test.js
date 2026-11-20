const { renderInvoicePdf, buildInvoiceFileName, formatMoney } = require("./invoice-pdf.service");

const SNAPSHOT = {
  seller: { legalName: "Lokesha Pvt Ltd", address: "Ahmedabad, Gujarat", gstin: "24AAACL0000A1Z5", sacCode: "998314" },
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
};

function toBuffer(doc) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
}

// pdfkit writes text as hex strings inside TJ operators
function extractText(buffer) {
  const operators = buffer.toString("latin1").match(/\[[^\]]*\]\s*TJ/g) ?? [];
  return operators
    .map((operator) => [...operator.matchAll(/<([0-9a-fA-F]+)>/g)].map(([, hex]) => Buffer.from(hex, "hex").toString("latin1")).join(""))
    .join("\n");
}

describe("renderInvoicePdf", () => {
  it("produces a PDF document", async () => {
    const buffer = await toBuffer(renderInvoicePdf(SNAPSHOT));

    expect(buffer.subarray(0, 5).toString()).toBe("%PDF-");
    expect(buffer.length).toBeGreaterThan(1000);
  });

  it("prints the saved details, amounts and dates", async () => {
    const text = extractText(await toBuffer(renderInvoicePdf(SNAPSHOT, { compress: false })));

    [
      "Lokesha Pvt Ltd",
      "GSTIN: 24AAACL0000A1Z5",
      "TAX INVOICE",
      "LOK/2026-27/000123",
      "Asha Rao",
      "24AAACC1206D1ZM",
      "ORD-20261120-AAAA1111",
      "pay_1",
      "998314",
      "Standard package subscription",
      "20 Nov 2026",
      "20 Feb 2027",
      "Rs. 1,000.00",
      "Rs. 6,000.00",
      "GST @ 18%",
      "Rs. 1,080.00",
      "Rs. 7,080.00",
    ].forEach((expected) => expect(text).toContain(expected));
  });

  it("renders without optional buyer GSTIN and incomplete business details", async () => {
    const snapshot = {
      ...SNAPSHOT,
      seller: { legalName: "", address: "", gstin: "", sacCode: "" },
      buyer: { name: "Asha Rao", mobile: null, email: null, gstin: null },
    };

    const text = extractText(await toBuffer(renderInvoicePdf(snapshot, { compress: false })));

    expect(text).toContain("Asha Rao");
    expect(text).not.toContain("GSTIN:");
  });
});

describe("credit note", () => {
  const creditNote = {
    ...SNAPSHOT,
    invoice: {
      number: "LOK-CN/2026-27/000004",
      type: "credit_note",
      issuedAt: "2026-11-25T10:00:00.000Z",
      orderNumber: "ORD-20261120-AAAA1111",
      originalInvoiceNumber: "LOK/2026-27/000123",
    },
  };

  it("is titled as a credit note and refers to the invoice it reverses", async () => {
    const text = extractText(await toBuffer(renderInvoicePdf(creditNote, { compress: false })));

    ["CREDIT NOTE", "LOK-CN/2026-27/000004", "Credit note date", "25 Nov 2026", "Against invoice", "LOK/2026-27/000123", "Total refunded"].forEach((expected) =>
      expect(text).toContain(expected),
    );
    expect(text).not.toContain("TAX INVOICE");
    expect(text).not.toContain("Total paid");
  });

  it("keeps the invoice wording for an invoice", async () => {
    const text = extractText(await toBuffer(renderInvoicePdf(SNAPSHOT, { compress: false })));

    expect(text).toContain("TAX INVOICE");
    expect(text).toContain("Total paid");
    expect(text).not.toContain("Against invoice");
  });
});

describe("helpers", () => {
  it("formats money from paise with Indian grouping", () => {
    expect(formatMoney(708000)).toBe("Rs. 7,080.00");
    expect(formatMoney(12345650)).toBe("Rs. 1,23,456.50");
    expect(formatMoney(0)).toBe("Rs. 0.00");
  });

  it("makes a safe file name from the invoice number", () => {
    expect(buildInvoiceFileName("LOK/2026-27/000123")).toBe("Invoice-LOK-2026-27-000123.pdf");
  });
});
