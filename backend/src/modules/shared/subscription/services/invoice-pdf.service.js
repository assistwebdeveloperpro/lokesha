const PDFDocument = require("pdfkit");

const NAVY = "#0F172A";
const SLATE = "#475569";
const LIGHT = "#E2E8F0";
const PAGE_MARGIN = 50;
const PAGE_WIDTH = 595.28 - PAGE_MARGIN * 2;
const DETAIL_ROW_GAP = 16;
const LEAD_PACK_DESCRIPTION = "Additional buyer leads for your listing";
const SUBSCRIPTION_COLUMNS = [
  { key: "description", label: "Description", width: 195, align: "left" },
  { key: "sac", label: "SAC", width: 55, align: "left" },
  { key: "listings", label: "Listings", width: 50, align: "right" },
  { key: "months", label: "Months", width: 50, align: "right" },
  { key: "rate", label: "Rate", width: 70, align: "right" },
  { key: "amount", label: "Amount", width: 75.28, align: "right" },
];
const LEAD_PACK_COLUMNS = [
  { key: "description", label: "Description", width: 245, align: "left" },
  { key: "sac", label: "SAC", width: 55, align: "left" },
  { key: "leads", label: "Leads", width: 50, align: "right" },
  { key: "rate", label: "Rate", width: 70, align: "right" },
  { key: "amount", label: "Amount", width: 75.28, align: "right" },
];

// Built-in PDF fonts have no rupee glyph, so amounts read "Rs."
const formatMoney = (amount) =>
  `Rs. ${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

// The invoice number holds slashes, which are not safe in a file name
const buildInvoiceFileName = (invoiceNumber) => `Invoice-${invoiceNumber.replaceAll("/", "-")}.pdf`;

const isCreditNote = (invoice) => invoice.type === "credit_note";

function drawHeader(doc, { seller, invoice }) {
  doc.font("Helvetica-Bold").fontSize(14).fillColor(NAVY).text(seller.legalName || "Lokesha", PAGE_MARGIN, PAGE_MARGIN);
  doc.font("Helvetica").fontSize(9).fillColor(SLATE);
  if (seller.address) doc.text(seller.address, { width: 300 });
  if (seller.gstin) doc.text(`GSTIN: ${seller.gstin}`);

  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor(NAVY)
    .text(isCreditNote(invoice) ? "CREDIT NOTE" : "TAX INVOICE", PAGE_MARGIN, PAGE_MARGIN, { width: PAGE_WIDTH, align: "right" });
  doc.font("Helvetica").fontSize(9).fillColor(SLATE).text(`No. ${invoice.number}`, { width: PAGE_WIDTH, align: "right" });
}

function drawDetails(doc, { buyer, invoice, payment }) {
  const top = 150;
  doc.moveTo(PAGE_MARGIN, top - 12).lineTo(PAGE_MARGIN + PAGE_WIDTH, top - 12).strokeColor(LIGHT).stroke();

  const buyerRows = [
    ["Billed to", buyer.name || "-"],
    ["Mobile", buyer.mobile],
    ["Email", buyer.email],
    ["GSTIN", buyer.gstin],
  ];
  const invoiceRows = [
    [isCreditNote(invoice) ? "Credit note date" : "Invoice date", formatDate(invoice.issuedAt)],
    ["Order no.", invoice.orderNumber],
    ...(isCreditNote(invoice) ? [["Against invoice", invoice.originalInvoiceNumber]] : []),
    ["Payment ref.", payment.razorpayPaymentId],
  ];

  drawDetailRows(doc, buyerRows, { top, labelX: PAGE_MARGIN, valueX: 120, valueWidth: 200 });
  drawDetailRows(doc, invoiceRows, { top, labelX: 330, valueX: 415, valueWidth: PAGE_WIDTH + PAGE_MARGIN - 415 });
}

function drawDetailRows(doc, rows, { top, labelX, valueX, valueWidth }) {
  rows
    .filter(([, value]) => value)
    .forEach(([label, value], index) => {
      const y = top + index * DETAIL_ROW_GAP;
      doc.font("Helvetica").fontSize(9).fillColor(SLATE).text(label, labelX, y, { width: valueX - labelX - 5, lineBreak: false });
      doc.font("Helvetica-Bold").fillColor(NAVY).text(value, valueX, y, { width: valueWidth, lineBreak: false, ellipsis: true });
    });
}

function drawRow(doc, y, columns, values, { bold = false, fill } = {}) {
  if (fill) doc.rect(PAGE_MARGIN, y - 6, PAGE_WIDTH, 24).fill(fill);

  let x = PAGE_MARGIN;
  columns.forEach(({ key, width, align }) => {
    doc
      .font(bold ? "Helvetica-Bold" : "Helvetica")
      .fontSize(9)
      .fillColor(bold && fill ? "#FFFFFF" : NAVY)
      .text(values[key] ?? "", x + 4, y, { width: width - 8, align });
    x += width;
  });
}

const isLeadPackLine = (lineItem) => lineItem.leads !== undefined;

function leadPackRow({ seller, lineItem }) {
  const property = lineItem.propertyTitle ? `\nFor property: ${lineItem.propertyTitle}` : "";

  return {
    description: `${LEAD_PACK_DESCRIPTION}${property}`,
    sac: seller.sacCode,
    leads: String(lineItem.leads),
    rate: formatMoney(lineItem.pricePerLead),
    amount: formatMoney(lineItem.pricePerLead * lineItem.leads),
  };
}

function subscriptionRow({ seller, lineItem }) {
  return {
    description: `${lineItem.description}\nValid ${formatDate(lineItem.startsAt)} to ${formatDate(lineItem.endsAt)}`,
    sac: seller.sacCode,
    listings: String(lineItem.listings),
    months: String(lineItem.months),
    rate: formatMoney(lineItem.pricePerListingMonth),
    amount: formatMoney(lineItem.pricePerListingMonth * lineItem.listings * lineItem.months),
  };
}

function drawLineItem(doc, snapshot) {
  const isLeadPack = isLeadPackLine(snapshot.lineItem);
  const columns = isLeadPack ? LEAD_PACK_COLUMNS : SUBSCRIPTION_COLUMNS;

  const headerY = 250;
  drawRow(doc, headerY, columns, Object.fromEntries(columns.map(({ key, label }) => [key, label])), { bold: true, fill: NAVY });

  const y = headerY + 30;
  drawRow(doc, y, columns, isLeadPack ? leadPackRow(snapshot) : subscriptionRow(snapshot));
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
