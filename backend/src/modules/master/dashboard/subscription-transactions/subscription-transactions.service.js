const repository = require("./subscription-transactions.repository");
const { toCsv } = require("../../../shared/subscription/utils/csv.util");
const { addDays, formatIstDate, formatIstDateTime, startOfIstDay } = require("../../../shared/subscription/utils/subscription-dates.util");

const MAX_EXPORT_ROWS = 10000;

function toRepositoryFilters({ search, status, userId, from, to }) {
  return {
    search,
    status,
    userId,
    from: from ? startOfIstDay(from) : undefined,
    to: to ? addDays(startOfIstDay(to), 1) : undefined,
  };
}

function toTransaction(row) {
  return {
    id: row.id,
    orderNumber: row.order_number,
    user: { id: row.user_id, name: row.user_name, mobile: row.user_mobile },
    packageName: row.package_name,
    orderType: row.order_type,
    listings: row.listings,
    months: row.months,
    pricePerListingMonth: row.price_per_listing_month,
    leads: row.leads,
    pricePerLead: row.price_per_lead,
    property: row.property_title
      ? { title: row.property_title, listingNumber: Number(row.property_listing_number) }
      : null,
    gstPercent: Number(row.gst_percent),
    baseAmount: row.base_amount,
    gstAmount: row.gst_amount,
    totalAmount: row.total_amount,
    status: row.status,
    razorpayOrderId: row.razorpay_order_id,
    razorpayPaymentId: row.razorpay_payment_id,
    failureReason: row.failure_reason,
    userGstin: row.user_gstin,
    paidAt: row.paid_at,
    refundedAt: row.refunded_at,
    createdAt: row.created_at,
    invoice: row.invoice_id ? { id: row.invoice_id, number: row.invoice_number } : null,
    creditNote: row.credit_note_id ? { id: row.credit_note_id, number: row.credit_note_number } : null,
  };
}

async function listTransactions({ page, limit, ...filters }) {
  const repositoryFilters = toRepositoryFilters(filters);
  const [rows, total] = await Promise.all([
    repository.findTransactions({ ...repositoryFilters, page, limit }),
    repository.countTransactions(repositoryFilters),
  ]);

  return { items: rows.map(toTransaction), page, limit, total };
}

// Accounts read rupees, so every amount column is written as rupees with two decimals
// A lead purchase has no listing price, so the cell stays empty
const rupees = (amount) => (amount === null || amount === undefined ? "" : amount.toFixed(2));

const EXPORT_COLUMNS = [
  { header: "Order number", value: (t) => t.orderNumber },
  { header: "Created (IST)", value: (t) => formatIstDateTime(new Date(t.createdAt)) },
  { header: "Paid (IST)", value: (t) => (t.paidAt ? formatIstDateTime(new Date(t.paidAt)) : "") },
  { header: "User", value: (t) => t.user.name },
  { header: "Mobile", value: (t) => t.user.mobile },
  { header: "User GSTIN", value: (t) => t.userGstin },
  { header: "Package", value: (t) => t.packageName },
  { header: "Order type", value: (t) => t.orderType },
  { header: "Listings", value: (t) => t.listings },
  { header: "Months", value: (t) => t.months },
  { header: "Price per listing per month (Rs)", value: (t) => rupees(t.pricePerListingMonth) },
  { header: "Leads", value: (t) => t.leads },
  { header: "Price per lead (Rs)", value: (t) => rupees(t.pricePerLead) },
  { header: "Property", value: (t) => t.property?.title },
  { header: "Base amount (Rs)", value: (t) => rupees(t.baseAmount) },
  { header: "GST %", value: (t) => t.gstPercent },
  { header: "GST amount (Rs)", value: (t) => rupees(t.gstAmount) },
  { header: "Total (Rs)", value: (t) => rupees(t.totalAmount) },
  { header: "Status", value: (t) => t.status },
  { header: "Razorpay order", value: (t) => t.razorpayOrderId },
  { header: "Razorpay payment", value: (t) => t.razorpayPaymentId },
  { header: "Invoice number", value: (t) => t.invoice?.number },
  { header: "Credit note number", value: (t) => t.creditNote?.number },
  { header: "Failure reason", value: (t) => t.failureReason },
];

async function exportTransactions(filters, now = new Date()) {
  const rows = await repository.findTransactionsForExport(toRepositoryFilters(filters), MAX_EXPORT_ROWS);

  return {
    fileName: `subscription-transactions-${formatIstDate(now)}.csv`,
    csv: toCsv(EXPORT_COLUMNS, rows.map(toTransaction)),
  };
}

module.exports = { listTransactions, exportTransactions, MAX_EXPORT_ROWS };
