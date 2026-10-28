const writeRepository = require("../repositories/property-write.repository");
const { STATUS_TRANSITIONS, ADMIN_STATUS_TRANSITIONS } = require("../constants/property.constants");
const { AppError } = require("../utils/property.errors");
const adminNotifications = require("../../../master/dashboard/admin-notifications/admin-notifications.service");

function assertTransition(from, to, actor = {}) {
  // Review approvals also act as an admin, only direct publishing skips review
  const transitions = actor.bypassReview ? ADMIN_STATUS_TRANSITIONS : STATUS_TRANSITIONS;
  if (!transitions[from]?.includes(to)) {
    throw new AppError(`Cannot change status from ${from} to ${to}`, 409);
  }
}

// actor is { userId } or { adminId }; the status and its history row change together
// notify is turned off for all but one of the sub types of a post, so admins hear about it once
async function changeStatus(trx, { propertyId, from, to, actor, reason, notify = true }) {
  assertTransition(from, to, actor);

  await writeRepository.updatePropertyStatus(trx, propertyId, {
    status: to,
    ...(to === "published" ? { published_at: trx.fn.now() } : {}),
  });
  await writeRepository.insertStatusHistory(trx, {
    property_id: propertyId,
    from_status: from,
    to_status: to,
    changed_by_user_id: actor.userId ?? null,
    changed_by_admin_id: actor.adminId ?? null,
    reason: reason ?? null,
  });

  // Every way into review tells the admins in the same transaction
  if (to === "pending" && notify) {
    await adminNotifications.notifyPropertyPending(trx, { propertyId, from });
  }
}

// A published listing goes back to review after any owner edit
async function markEdited(trx, property, actor, { notify = true } = {}) {
  if (property.status === "closed") {
    // Reopen compares updated_at with the close time to spot edits
    await writeRepository.updatePropertyStatus(trx, property.id, {});
    return property.status;
  }
  // Admin edits never need a new review
  if (property.status !== "published" || actor.bypassReview) {
    return property.status;
  }

  await changeStatus(trx, {
    propertyId: property.id,
    from: "published",
    to: "pending",
    actor,
    reason: "Edited by owner",
    notify,
  });
  return "pending";
}

module.exports = { assertTransition, changeStatus, markEdited };
