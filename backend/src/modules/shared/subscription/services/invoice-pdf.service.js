const PDFDocument = require("pdfkit");

const NAVY = "#0F172A";
const SLATE = "#475569";
const LIGHT = "#E2E8F0";
const PAGE_MARGIN = 50;
const PAGE_WIDTH = 595.28 - PAGE_MARGIN * 2;
const COLUMNS = [
  { key: "description", label: "Description", width: 195, align: "left" },
  { key: "sac", label: "SAC", width: 55, align: "left" },
  { key: "listings", label: "Listings", width: 50, align: "right" },
  { key: "months", label: "Months", width: 50, align: "right" },
  { key: "rate", label: "Rate", width: 70, align: "right" },
  { key: "amount", label: "Amount", width: 75.28, align: "right" },
];

// Built-in PDF fonts have no rupee glyph, so amounts read "Rs."
const formatMoney = (paise) =>
  `Rs. ${(paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

// The invoice number holds slashes, which are not safe in a file name
const buildInvoiceFileName = (invoiceNumber) => `Invoice-${invoiceNumber.replaceAll("/", "-")}.pdf`;

const isCreditNote = (invoice) => invoice.type === "credit_note";

function drawHeader(doc, { seller, invoice }) {
  doc.font("Helvetica-Bold").fontSize(20).fillColor(NAVY).text(seller.legalName || "Lokesha", PAGE_MARGIN, PAGE_MARGIN);
  doc.font("Helvetica").fontSize(9).fillColor(SLATE);
  if (seller.address) doc.text(seller.address, { width: 300 });
  if (seller.gstin) doc.text(`GSTIN: ${seller.gstin}`);

  doc
    .font("Helvetica-Bold")
    .fontSize(16)
    .fillColor(NAVY)
    .text(isCreditNote(invoice) ? "CREDIT NOTE" : "TAX INVOICE", PAGE_MARGIN, PAGE_MARGIN, { width: PAGE_WIDTH, align: "right" });
  doc.font("Helvetica").fontSize(9).fillColor(SLATE).text(`No. ${invoice.number}`, { width: PAGE_WIDTH, align: "right" });
}

function drawDetails(doc, { buyer, invoice, payment }) {
  const top = 150;
  doc.moveTo(PAGE_MARGIN, top - 12).lineTo(PAGE_MARGIN + PAGE_WIDTH, top - 12).strokeColor(LIGHT).stroke();

  doc.font("Helvetica-Bold").fontSize(9).fillColor(SLATE).text("BILLED TO", PAGE_MARGIN, top);
  doc.font("Helvetica-Bold").fontSize(11).fillColor(NAVY).text(buyer.name || "-");
  doc.font("Helvetica").fontSize(9).fillColor(SLATE);
  if (buyer.mobile) doc.text(`Mobile: ${buyer.mobile}`);
  if (buyer.email) doc.text(`Email: ${buyer.email}`);
  if (buyer.gstin) doc.text(`GSTIN: ${buyer.gstin}`);

  const rows = [
    [isCreditNote(invoice) ? "Credit note date" : "Invoice date", formatDate(invoice.issuedAt)],
    ["Order no.", invoice.orderNumber],
    ...(isCreditNote(invoice) ? [["Against invoice", invoice.originalInvoiceNumber]] : []),
    ["Payment ref.", payment.razorpayPaymentId],
  ];
  rows.forEach(([label, value], index) => {
    const y = top + index * 16;
    doc.font("Helvetica").fontSize(9).fillColor(SLATE).text(label, 330, y, { width: 80 });
    doc.font("Helvetica-Bold").fillColor(NAVY).text(value, 415, y, { width: PAGE_WIDTH + PAGE_MARGIN - 415 });
  });
}

function drawRow(doc, y, values, { bold = false, fill } = {}) {
  if (fill) doc.rect(PAGE_MARGIN, y - 6, PAGE_WIDTH, 24).fill(fill);

  let x = PAGE_MARGIN;
  COLUMNS.forEach(({ key, width, align }) => {
    doc
      .font(bold ? "Helvetica-Bold" : "Helvetica")
      .fontSize(9)
      .fillColor(bold && fill ? "#FFFFFF" : NAVY)
      .text(values[key] ?? "", x + 4, y, { width: width - 8, align });
    x += width;
  });
}

function drawLineItem(doc, { seller, lineItem }) {
  const headerY = 250;
  drawRow(doc, headerY, Object.fromEntries(COLUMNS.map(({ key, label }) => [key, label])), { bold: true, fill: NAVY });

  const y = headerY + 30;
  drawRow(doc, y, {
    description: `${lineItem.description}\nValid ${formatDate(lineItem.startsAt)} to ${formatDate(lineItem.endsAt)}`,
    sac: seller.sacCode,
    listings: String(lineItem.listings),
    months: String(lineItem.months),
    rate: formatMoney(lineItem.pricePerListingMonth),
    amount: formatMoney(lineItem.pricePerListingMonth * lineItem.listings * lineItem.months),
  });
  doc.moveTo(PAGE_MARGIN, y + 36).lineTo(PAGE_MARGIN + PAGE_WIDTH, y + 36).strokeColor(LIGHT).stroke();

  return y + 52;
}

function drawTotals(doc, { amounts, invoice }, startY) {
  const rows = [
    ["Base amount", formatMoney(amounts.baseAmount), false],
    [`GST @ ${amounts.gstPercent}%`, formatMoney(amounts.gstAmount), false],
    [isCreditNote(invoice) ? "Total refunded" : "Total paid", formatMoney(amounts.totalAmount), true],
  ];

  rows.forEach(([label, value, isTotal], index) => {
    const y = startY + index * 20;
    if (isTotal) doc.rect(330, y - 5, PAGE_WIDTH + PAGE_MARGIN - 330, 22).fill(NAVY);
    doc.font(isTotal ? "Helvetica-Bold" : "Helvetica").fontSize(10).fillColor(isTotal ? "#FFFFFF" : SLATE).text(label, 338, y, { width: 100 });
    doc.font("Helvetica-Bold").fillColor(isTotal ? "#FFFFFF" : NAVY).text(value, 440, y, { width: PAGE_WIDTH + PAGE_MARGIN - 448, align: "right" });
  });
}

// Draws from the saved snapshot only, so a later download is identical; the caller pipes the returned document
function renderInvoicePdf(snapshot, { compress = true } = {}) {
  const doc = new PDFDocument({ size: "A4", margin: PAGE_MARGIN, compress, info: { Title: `Invoice ${snapshot.invoice.number}` } });

  drawHeader(doc, snapshot);
  drawDetails(doc, snapshot);
  const totalsY = drawLineItem(doc, snapshot);
  drawTotals(doc, snapshot, totalsY);

  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor(SLATE)
    .text("This is a computer generated invoice and does not need a signature.", PAGE_MARGIN, 760, { width: PAGE_WIDTH, align: "center" });

  doc.end();
  return doc;
}

module.exports = { renderInvoicePdf, buildInvoiceFileName, formatMoney };
