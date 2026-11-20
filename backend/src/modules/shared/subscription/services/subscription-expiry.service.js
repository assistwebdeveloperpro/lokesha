const { db } = require("../../../../config/db");
const expiryRepository = require("../repositories/subscription-expiry.repository");
const ledgerRepository = require("../repositories/subscription-ledger.repository");
const notificationRepository = require("../../../user/dashboard/user-notifications/user-notifications.repository");
const {
  subscriptionEndingSoon,
  subscriptionEnded,
  propertyExpired,
} = require("../../../user/dashboard/user-notifications/user-notifications.templates");
const { changeStatus } = require("../../property/services/property-status.service");
const { addDays, daysRemaining } = require("../utils/subscription-dates.util");
const { LEDGER_TYPES } = require("../constants/subscription.constants");

const BATCH_SIZE = 100;
const DAY_MS = 24 * 60 * 60 * 1000;
const FIRST_REMINDER_DAYS = 7;
const SYSTEM_ACTOR = {};
const SUBSCRIPTION_ENDED_REASON = "Subscription ended";
const VALIDITY_ENDED_REASON = "Listing validity ended";

const closeProperty = (trx, property, reason) =>
  changeStatus(trx, { propertyId: property.id, from: "published", to: "closed", actor: SYSTEM_ACTOR, reason });

// Runs each item on its own so one failure never blocks the rest
async function processEach(ids, action, label) {
  let done = 0;
  for (const id of ids) {
    try {
      if (await action(id)) done += 1;
    } catch (error) {
      console.error(`Subscription job failed for ${label} ${id}:`, error.message);
    }
  }
  return done;
}

// Unused credits are lost, properties go offline, leads and history stay
async function expireSubscription(id, now) {
  return db.transaction(async (trx) => {
    const subscription = await expiryRepository.lockExpiredSubscription(trx, id, now);
    if (!subscription) return false;

    await expiryRepository.markSubscriptionExpired(trx, id);

    const unused = subscription.total_credits - subscription.used_credits;
    if (unused > 0) {
      await ledgerRepository.insertEntry(trx, {
        subscriptionId: id,
        userId: subscription.user_id,
        type: LEDGER_TYPES.EXPIRED,
        credits: -unused,
        reason: SUBSCRIPTION_ENDED_REASON,
      });
    }

    const liveProperties = await expiryRepository.findLivePropertiesOfSubscription(trx, id);
    for (const property of liveProperties) {
      await closeProperty(trx, property, SUBSCRIPTION_ENDED_REASON);
    }

    await notificationRepository.insertNotification(
      trx,
      subscriptionEnded({ userId: subscription.user_id, closedCount: liveProperties.length })
    );
    return true;
  });
}

// Free listings have no subscription end date, so their own validity closes them
async function expireProperty(id, now) {
  return db.transaction(async (trx) => {
    const property = await expiryRepository.lockExpiredProperty(trx, id, now);
    if (!property) return false;

    await closeProperty(trx, property, VALIDITY_ENDED_REASON);
    // A paid listing is covered by the one "subscription ended" notice
    if (!property.subscription_ends_at) {
      await notificationRepository.insertNotification(
        trx,
        propertyExpired({ userId: property.user_id, propertyId: property.id, title: property.title })
      );
    }
    return true;
  });
}

async function runExpiry(now = new Date()) {
  const subscriptionIds = await expiryRepository.findExpiredSubscriptionIds(now, BATCH_SIZE);
  const expiredSubscriptions = await processEach(subscriptionIds, (id) => expireSubscription(id, now), "subscription");

  const propertyIds = await expiryRepository.findExpiredPropertyIds(now, BATCH_SIZE);
  const closedProperties = await processEach(propertyIds, (id) => expireProperty(id, now), "property");

  return { expiredSubscriptions, closedProperties };
}

// One reminder at 7 days and one on the last day; a short subscription skips straight to the last-day one
async function sendReminder(id, now) {
  return db.transaction(async (trx) => {
    const subscription = await expiryRepository.lockSubscriptionForReminder(trx, id);
    if (!subscription) return false;

    const endsAt = new Date(subscription.ends_at);
    const timeLeft = endsAt.getTime() - now.getTime();
    if (timeLeft <= 0 || timeLeft > FIRST_REMINDER_DAYS * DAY_MS) return false;

    const isFinalDay = timeLeft <= DAY_MS;
    if (isFinalDay ? subscription.reminder_1d_sent_at : subscription.reminder_7d_sent_at) return false;

    const daysLeft = isFinalDay ? 1 : daysRemaining(endsAt, now);
    await notificationRepository.insertNotification(trx, subscriptionEndingSoon({ userId: subscription.user_id, daysLeft }));
    await expiryRepository.markRemindersSent(trx, id, { sevenDay: true, oneDay: isFinalDay });
    return true;
  });
}

async function runReminders(now = new Date()) {
  const ids = await expiryRepository.findDueReminderIds(now, addDays(now, FIRST_REMINDER_DAYS), BATCH_SIZE);
  return { remindersSent: await processEach(ids, (id) => sendReminder(id, now), "reminder") };
}

module.exports = { runExpiry, runReminders };
