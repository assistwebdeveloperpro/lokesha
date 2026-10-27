const writeRepository = require("./property-write.repository");
const { STATUS_TRANSITIONS } = require("./property.constants");
const { AppError } = require("./property.errors");
const adminNotifications = require("../../master/dashboard/admin-notifications/admin-notifications.service");

function assertTransition(from, to) {
  if (!STATUS_TRANSITIONS[from]?.includes(to)) {
    throw new AppError(`Cannot change status from ${from} to ${to}`, 409);
  }
}

// actor is { userId } or { adminId }; the status and its history row change together
async function changeStatus(trx, { propertyId, from, to, actor, reason }) {
  assertTransition(from, to);

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
  if (to === "pending") {
    await adminNotifications.notifyPropertyPending(trx, { propertyId, from });
  }
}

// A published listing goes back to review after any owner edit
async function markEdited(trx, property, actor) {
  if (property.status === "closed") {
    // Reopen compares updated_at with the close time to spot edits
    await writeRepository.updatePropertyStatus(trx, property.id, {});
    return property.status;
  }
  if (property.status !== "published") {
    return property.status;
  }

  await changeStatus(trx, {
    propertyId: property.id,
    from: "published",
    to: "pending",
    actor,
    reason: "Edited by owner",
  });
  return "pending";
}

module.exports = { assertTransition, changeStatus, markEdited };
