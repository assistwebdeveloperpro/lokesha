const repository = require("./user-subscription-overview.repository");
const { daysRemaining } = require("../../../shared/subscription/utils/subscription-dates.util");
const {
  ORDER_STATUSES,
  LOW_CREDIT_THRESHOLD,
  PAYMENT_NOTICE_HOURS,
} = require("../../../shared/subscription/constants/subscription.constants");

const HOUR_MS = 60 * 60 * 1000;
const NOTICE_STATUSES = [ORDER_STATUSES.PENDING, ORDER_STATUSES.FAILED];

const STATES = { ACTIVE: "active", LOW: "low", ENDED: "ended", NONE: "none" };

const pageOf = (items, total, { page, limit }) => ({ items, page, limit, total });

function toSubscription(row, now) {
  const endsAt = row.ends_at ? new Date(row.ends_at) : null;

  return {
    id: row.id,
    packageCode: row.package_code,
    packageName: row.package_name,
    packageTitle: row.package_title || row.package_name,
    source: row.source,
    status: row.status,
    totalCredits: row.total_credits,
    usedCredits: row.used_credits,
    remainingCredits: row.total_credits - row.used_credits,
    leadLimit: row.lead_limit,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    daysLeft: endsAt ? daysRemaining(endsAt, now) : null,
  };
}

function toOrder(row) {
  return {
    id: row.id,
    orderNumber: row.order_number,
    status: row.status,
    orderType: row.order_type,
    listings: row.listings,
    months: row.months,
    pricePerListingMonth: row.price_per_listing_month,
    leads: row.leads,
    pricePerLead: row.price_per_lead,
    property: row.property_title ? { title: row.property_title, listingNumber: Number(row.property_listing_number) } : null,
    gstPercent: Number(row.gst_percent),
    baseAmount: row.base_amount,
    gstAmount: row.gst_amount,
    totalAmount: row.total_amount,
    failureReason: row.failure_reason,
    paidAt: row.paid_at,
    createdAt: row.created_at,
    invoice: row.invoice_id ? { id: row.invoice_id, number: row.invoice_number } : null,
  };
}

const toLedgerEntry = (row) => ({
  id: row.id,
  type: row.type,
  credits: row.credits,
  step: Number(row.step_no),
  balanceAfter: Number(row.balance_after),
  reason: row.reason,
  createdAt: row.created_at,
  property: row.property_id ? { id: row.property_id, title: row.property_title, listingNumber: Number(row.listing_number) } : null,
});

// Unlimited properties have no base limit, so they stay unlimited whatever was bought
function toPropertyUsage(row) {
  const leadsReceived = Number(row.leads_count);
  const leadLimit = row.lead_limit === null ? null : row.lead_limit + row.extra_leads;

  return {
    id: row.id,
    title: row.project_name || row.title,
    listingNumber: Number(row.listing_number),
    status: row.status,
    leadLimit,
    extraLeads: row.extra_leads,
    leadsReceived,
    isLimitReached: leadLimit !== null && leadsReceived >= leadLimit,
    expiresAt: row.expires_at,
  };
}

// A payment still being confirmed, or one that failed, is shown until a newer order replaces it
function toNotice(order, now) {
  const isRecent = order && now.getTime() - new Date(order.created_at).getTime() < PAYMENT_NOTICE_HOURS * HOUR_MS;
  if (!isRecent || !NOTICE_STATUSES.includes(order.status)) return null;

  return { type: order.status, orderId: order.id, orderNumber: order.order_number, createdAt: order.created_at };
}

function resolveState(remaining, hasHistory) {
  if (remaining > LOW_CREDIT_THRESHOLD) return STATES.ACTIVE;
  if (remaining > 0) return STATES.LOW;
  return hasHistory ? STATES.ENDED : STATES.NONE;
}

async function loadCredits(userId, now) {
  const [current, reserved] = await Promise.all([repository.findCurrentSubscriptions(userId, now), repository.countReservedProperties(userId, now)]);
  const available = current.reduce((sum, row) => sum + row.total_credits - row.used_credits, 0);

  return { current, available, reserved, submittable: Math.max(0, available - reserved) };
}

// What Post Property shows: credits left after listings already waiting for review
async function getCredits(userId, now = new Date()) {
  const { available, reserved, submittable } = await loadCredits(userId, now);
  return { available, reserved, submittable };
}

async function getOverview(userId, now = new Date()) {
  const [{ current, available, reserved, submittable }, hasHistory, latestOrder] = await Promise.all([
    loadCredits(userId, now),
    repository.hasAnySubscription(userId),
    repository.findLatestOrder(userId),
  ]);

  const subscriptions = current.map((row) => toSubscription(row, now));
  const nextEnding = subscriptions.find((item) => item.endsAt);

  return {
    summary: {
      state: resolveState(available, hasHistory),
      totalCredits: subscriptions.reduce((sum, item) => sum + item.totalCredits, 0),
      usedCredits: subscriptions.reduce((sum, item) => sum + item.usedCredits, 0),
      remainingCredits: available,
      reservedCredits: reserved,
      submittableCredits: submittable,
      nextEndsAt: nextEnding?.endsAt ?? null,
      daysLeft: nextEnding?.daysLeft ?? null,
    },
    subscriptions,
    notice: toNotice(latestOrder, now),
  };
}

async function listHistory(userId, paging, now = new Date()) {
  const [rows, total] = await Promise.all([repository.findSubscriptionHistory(userId, paging), repository.countSubscriptionHistory(userId)]);
  return pageOf(rows.map((row) => toSubscription(row, now)), total, paging);
}

async function listPayments(userId, paging) {
  const [rows, total] = await Promise.all([repository.findOrders(userId, paging), repository.countOrders(userId)]);
  return pageOf(rows.map(toOrder), total, paging);
}

async function listLedger(userId, paging) {
  const [rows, total] = await Promise.all([repository.findLedger(userId, paging), repository.countLedger(userId)]);
  return pageOf(rows.map(toLedgerEntry), total, paging);
}

async function listPropertyUsage(userId, paging) {
  const [rows, total] = await Promise.all([repository.findPropertyLeadUsage(userId, paging), repository.countPropertyLeadUsage(userId)]);
  return pageOf(rows.map(toPropertyUsage), total, paging);
}

module.exports = { getCredits, getOverview, listHistory, listPayments, listLedger, listPropertyUsage };
