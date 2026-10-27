const NOTIFICATION_TYPES = {
  propertySubmitted: "property_submitted",
  propertyResubmitted: "property_resubmitted",
};

function propertySubmitted({ propertyId, title }) {
  return {
    type: NOTIFICATION_TYPES.propertySubmitted,
    title,
    message: "A new property is waiting for your review.",
    property_id: propertyId,
  };
}

function propertyResubmitted({ propertyId, title }) {
  return {
    type: NOTIFICATION_TYPES.propertyResubmitted,
    title,
    message: "An edited property is waiting for your review again.",
    property_id: propertyId,
  };
}

module.exports = { NOTIFICATION_TYPES, propertySubmitted, propertyResubmitted };
