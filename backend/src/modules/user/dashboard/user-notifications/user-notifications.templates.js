const NOTIFICATION_TYPES = {
  propertyApproved: "property_approved",
  propertyRejected: "property_rejected",
};

function propertyApproved({ userId, propertyId, title }) {
  return {
    user_id: userId,
    type: NOTIFICATION_TYPES.propertyApproved,
    title,
    message: "Your property has been approved and is now live.",
    property_id: propertyId,
  };
}

function propertyRejected({ userId, propertyId, title, reason }) {
  return {
    user_id: userId,
    type: NOTIFICATION_TYPES.propertyRejected,
    title,
    message: `Your property was not approved. Reason: ${reason}`,
    property_id: propertyId,
  };
}

module.exports = { NOTIFICATION_TYPES, propertyApproved, propertyRejected };
