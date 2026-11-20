const subscriptionRepository = require("../repositories/subscription.repository");
const notificationRepository = require("../../../user/dashboard/user-notifications/user-notifications.repository");
const { leadLimitNear, leadLimitReached } = require("../../../user/dashboard/user-notifications/user-notifications.templates");
const { ERROR_CODES } = require("../constants/subscription.constants");
const { AppError } = require("../../property/utils/property.errors");

const CONFLICT = 409;
const LIMIT_REACHED_MESSAGE = "This property is not accepting new enquiries right now.";

// Locks the property and refuses a new lead once its limit is used; a null limit means unlimited
async function assertLeadCapacity(trx, propertyId) {
  const limit = await subscriptionRepository.findLeadLimitForUpdate(trx, propertyId);
  if (limit === null) return { limit: null, received: 0 };

  const received = await subscriptionRepository.countPropertyLeads(trx, propertyId);
  if (received >= limit) {
    throw new AppError(LIMIT_REACHED_MESSAGE, CONFLICT, { code: ERROR_CODES.LEAD_LIMIT_REACHED });
  }
  return { limit, received };
}

// Tells the lister once when one lead is left and once when the limit is used, staff and admin listings have no limit
async function notifyLeadProgress(trx, property, { limit, received }) {
  if (limit === null || !property.user_id) return;

  const base = { userId: property.user_id, propertyId: property.id, title: property.title };
  const total = received + 1;

  if (total >= limit) {
    await notificationRepository.insertNotification(trx, leadLimitReached({ ...base, limit }));
  } else if (total === limit - 1) {
    await notificationRepository.insertNotification(trx, leadLimitNear({ ...base, received: total, limit }));
  }
}

module.exports = { assertLeadCapacity, notifyLeadProgress };
