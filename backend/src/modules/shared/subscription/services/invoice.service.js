const invoiceRepository = require("../repositories/subscription-invoice.repository");
const { getFinancialYear, formatInvoiceNumber } = require("../utils/financial-year.util");
const { INVOICE_TYPES } = require("../constants/subscription.constants");
const { AppError } = require("../../property/utils/property.errors");

const NOT_FOUND = 404;
const REQUIRED_SELLER_FIELDS = ["legal_name", "address", "gstin", "sac_code"];
const LINE_ITEM_DESCRIPTION = "Standard package subscription";

const toSeller = (settings) => ({
  legalName: settings.legal_name,
  address: settings.address,
  gstin: settings.gstin,
  sacCode: settings.sac_code,
});

// The invoice keeps its own copy of every detail, so later edits to price or business details never change it
function buildSnapshot({ settings, buyer, order, subscription, payment, invoiceNumber, issuedAt }) {
  return {
    seller: toSeller(settings),
    buyer: { name: buyer.name, mobile: buyer.mobile_number, email: buyer.email, gstin: order.user_gstin },
    invoice: { number: invoiceNumber, type: INVOICE_TYPES.INVOICE, issuedAt, orderNumber: order.order_number },
    lineItem: {
      description: LINE_ITEM_DESCRIPTION,
      listings: order.listings,
      months: order.months,
      pricePerListingMonth: order.price_per_listing_month,
      startsAt: subscription.starts_at,
      endsAt: subscription.ends_at,
    },
    amounts: {
      baseAmount: order.base_amount,
      gstPercent: Number(order.gst_percent),
      gstAmount: order.gst_amount,
      totalAmount: order.total_amount,
    },
    payment: { razorpayPaymentId: payment.id, razorpayOrderId: order.razorpay_order_id, paidAt: order.paid_at },
  };
}

// Runs inside the payment transaction; an existing invoice for the order is returned as it is
async function createInvoiceForOrder(trx, { order, subscription, payment, issuedAt = new Date() }) {
  const existing = await invoiceRepository.findInvoiceByOrder(trx, order.id, INVOICE_TYPES.INVOICE);
  if (existing) return existing;

  const settings = await invoiceRepository.findSettings(trx);
  const missing = REQUIRED_SELLER_FIELDS.filter((field) => !settings?.[field]);
  if (missing.length) {
    // A payment must never fail over missing business details, so this only warns
    console.error("Invoice issued with incomplete seller details:", missing.join(", "));
  }

  const buyer = await invoiceRepository.findBuyer(trx, order.user_id);
  const financialYear = getFinancialYear(issuedAt);
  const sequence = await invoiceRepository.takeNextSequence(trx, financialYear, INVOICE_TYPES.INVOICE);
  const invoiceNumber = formatInvoiceNumber({ prefix: settings?.invoice_prefix || "LOK", financialYear, sequence });

  return invoiceRepository.insertInvoice(trx, {
    invoice_number: invoiceNumber,
    financial_year: financialYear,
    sequence,
    type: INVOICE_TYPES.INVOICE,
    order_id: order.id,
    user_id: order.user_id,
    issued_at: issuedAt,
    snapshot: JSON.stringify(
      buildSnapshot({ settings: settings ?? {}, buyer: buyer ?? {}, order, subscription, payment, invoiceNumber, issuedAt })
    ),
  });
}

// Runs inside the refund transaction; it mirrors the original invoice, so it states exactly what was charged
async function createCreditNoteForOrder(trx, { order, issuedAt = new Date() }) {
  const existing = await invoiceRepository.findInvoiceByOrder(trx, order.id, INVOICE_TYPES.CREDIT_NOTE);
  if (existing) return existing;

  const original = await invoiceRepository.findInvoiceByOrder(trx, order.id, INVOICE_TYPES.INVOICE);
  if (!original) {
    // The refund already happened at the gateway, so missing paperwork must not undo it
    console.error("No invoice to credit for order:", order.order_number);
    return null;
  }

  const settings = await invoiceRepository.findSettings(trx);
  const financialYear = getFinancialYear(issuedAt);
  const sequence = await invoiceRepository.takeNextSequence(trx, financialYear, INVOICE_TYPES.CREDIT_NOTE);
  const number = formatInvoiceNumber({ prefix: settings?.credit_note_prefix || "LOK-CN", financialYear, sequence });

  return invoiceRepository.insertInvoice(trx, {
    invoice_number: number,
    financial_year: financialYear,
    sequence,
    type: INVOICE_TYPES.CREDIT_NOTE,
    parent_invoice_id: original.id,
    order_id: order.id,
    user_id: order.user_id,
    issued_at: issuedAt,
    snapshot: JSON.stringify({
      ...original.snapshot,
      invoice: {
        number,
        type: INVOICE_TYPES.CREDIT_NOTE,
        issuedAt,
        orderNumber: order.order_number,
        originalInvoiceNumber: original.invoice_number,
      },
    }),
  });
}

function toDownload(invoice) {
  if (!invoice) throw new AppError("Invoice not found", NOT_FOUND);

  return { invoiceNumber: invoice.invoice_number, snapshot: invoice.snapshot };
}

async function getInvoiceForUser(userId, invoiceId) {
  return toDownload(await invoiceRepository.findInvoiceForUser(userId, invoiceId));
}

async function getInvoiceForAdmin(invoiceId) {
  return toDownload(await invoiceRepository.findInvoiceById(invoiceId));
}

module.exports = { createInvoiceForOrder, createCreditNoteForOrder, getInvoiceForUser, getInvoiceForAdmin, buildSnapshot };
