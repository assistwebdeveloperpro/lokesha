// A caller is a user ({ id, role }) or an admin ({ adminId, role: "admin" })
const isAdminCaller = (caller) => Boolean(caller.adminId);

function toOwner(caller) {
  return isAdminCaller(caller)
    ? { adminId: caller.adminId, listedBy: "admin" }
    : { userId: caller.id, listedBy: caller.role };
}

function toStatusActor(caller) {
  return isAdminCaller(caller) ? { adminId: caller.adminId, bypassReview: true } : { userId: caller.id };
}

// Columns that tie a row to its creator
function toOwnerColumns(caller) {
  return isAdminCaller(caller) ? { admin_id: caller.adminId } : { user_id: caller.id };
}

module.exports = { isAdminCaller, toOwner, toStatusActor, toOwnerColumns };
