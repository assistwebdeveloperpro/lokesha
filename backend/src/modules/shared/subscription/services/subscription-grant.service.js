const subscriptionRepository = require("../repositories/subscription.repository");
const ledgerRepository = require("../repositories/subscription-ledger.repository");
const notificationRepository = require("../../../user/dashboard/user-notifications/user-notifications.repository");
const { freePackageGranted } = require("../../../user/dashboard/user-notifications/user-notifications.templates");
const { PACKAGE_CODES, SUBSCRIPTION_SOURCES, SUBSCRIPTION_STATUSES, LEDGER_TYPES } = require("../constants/subscription.constants");

// Gives the user the Free package once, returns null when nothing was granted
async function grantFreePackage(trx, user, source = SUBSCRIPTION_SOURCES.FREE_SIGNUP) {
  const freePackage = await subscriptionRepository.findActivePackageByCode(trx, PACKAGE_CODES.FREE);
  if (!freePackage || !freePackage.free_credits) return null;

  const subscription = await subscriptionRepository.insertSubscriptionIfAbsent(trx, {
    user_id: user.id,
    package_id: freePackage.id,
    source,
    total_credits: freePackage.free_credits,
    lead_limit: freePackage.free_lead_limit,
    property_validity_days: freePackage.free_property_validity_days,
    status: SUBSCRIPTION_STATUSES.ACTIVE,
    mobile_number: user.mobile_number,
  });
  if (!subscription) return null;

  await ledgerRepository.insertEntry(trx, {
    subscriptionId: subscription.id,
    userId: user.id,
    type: LEDGER_TYPES.GRANTED,
    credits: subscription.total_credits,
    reason: "Free package",
  });

  // The backfill grants quietly, only new sign-ups get the welcome message
  if (source === SUBSCRIPTION_SOURCES.FREE_SIGNUP) {
    await notificationRepository.insertNotification(trx, freePackageGranted({ userId: user.id, credits: subscription.total_credits }));
  }

  return subscription;
}

module.exports = { grantFreePackage };
