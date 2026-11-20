const subscriptionRepository = require("../repositories/subscription.repository");
const ledgerRepository = require("../repositories/subscription-ledger.repository");
const notificationRepository = require("../../../user/dashboard/user-notifications/user-notifications.repository");
const { creditsLow } = require("../../../user/dashboard/user-notifications/user-notifications.templates");
const { addDays } = require("../utils/subscription-dates.util");
const { LEDGER_TYPES, ERROR_CODES, LOW_CREDIT_THRESHOLD } = require("../constants/subscription.constants");
const { AppError } = require("../../property/utils/property.errors");
const { isAdminCaller } = require("../../property/utils/property-actor.util");

const EXEMPT_ROLES = ["lokesha_staff"];
const NO_CREDITS_MESSAGE = "You have no listing credits left. Buy the Standard package to publish more properties.";
const OWNER_NO_CREDITS_MESSAGE = "The owner has no listing credits left, so this property cannot be approved.";
const PAYMENT_REQUIRED = 402;
const CONFLICT = 409;

const isCreditExempt = (caller) => isAdminCaller(caller) || EXEMPT_ROLES.includes(caller.role);


const propertyNeedsCredit = (state, now = new Date()) =>
  !state.credit_consumed_at || Boolean(state.expires_at && new Date(state.expires_at) <= now);


const resolveExpiry = (subscription, now) =>
  subscription.property_validity_days ? addDays(now, subscription.property_validity_days) : subscription.ends_at;

async function getCreditSummary(trx, userId, now = new Date()) {
  const subscriptions = await subscriptionRepository.findUsableSubscriptionsForUpdate(trx, userId, now);
  const available = subscriptions.reduce((sum, item) => sum + item.total_credits - item.used_credits, 0);
  const reserved = await subscriptionRepository.countReservedProperties(trx, userId, now);

  return { available, reserved, submittable: Math.max(0, available - reserved) };
}

// Runs before a listing enters review; the locked subscriptions serialise one user's submissions
async function assertCanSubmit(trx, caller, required, now = new Date()) {
  if (isCreditExempt(caller) || required <= 0) return;

  const { submittable } = await getCreditSummary(trx, caller.id, now);
  if (submittable < required) {
    throw new AppError(NO_CREDITS_MESSAGE, PAYMENT_REQUIRED, { code: ERROR_CODES.NO_CREDITS, available: submittable, required });
  }
}


async function consumeCredit(trx, propertyId, now = new Date()) {
  const state = await subscriptionRepository.findPropertyBillingState(trx, propertyId);
  if (!state?.user_id || EXEMPT_ROLES.includes(state.owner_role) || !propertyNeedsCredit(state, now)) {
    return null;
  }

  const usable = await subscriptionRepository.findUsableSubscriptionsForUpdate(trx, state.user_id, now);
  const [subscription] = usable;
  if (!subscription) {
    throw new AppError(OWNER_NO_CREDITS_MESSAGE, CONFLICT, { code: ERROR_CODES.NO_CREDITS });
  }

  await subscriptionRepository.incrementUsedCredits(trx, subscription.id);
  await subscriptionRepository.markPropertyBilled(trx, propertyId, {
    subscriptionId: subscription.id,
    expiresAt: resolveExpiry(subscription, now),
    leadLimit: subscription.lead_limit,
  });
  await ledgerRepository.insertEntry(trx, {
    subscriptionId: subscription.id,
    userId: state.user_id,
    type: LEDGER_TYPES.USED,
    credits: -1,
    propertyId,
    reason: "Property published",
  });


  const remainingAfter = usable.reduce((sum, item) => sum + item.total_credits - item.used_credits, 0) - 1;
  if (remainingAfter === LOW_CREDIT_THRESHOLD) {
    await notificationRepository.insertNotification(trx, creditsLow({ userId: state.user_id, remaining: remainingAfter }));
  }

  return { subscriptionId: subscription.id };
}

module.exports = { isCreditExempt, propertyNeedsCredit, resolveExpiry, getCreditSummary, assertCanSubmit, consumeCredit };
