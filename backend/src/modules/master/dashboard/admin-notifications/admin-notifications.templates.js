const NOTIFICATION_TYPES = {
  propertySubmitted: "property_submitted",
  propertyResubmitted: "property_resubmitted",
  subscriptionPurchased: "subscription_purchased",
  leadReceived: "lead_received",
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

function subscriptionPurchased({ userName, listings, months, orderNumber }) {
  return {
    type: NOTIFICATION_TYPES.subscriptionPurchased,
    title: "New subscription purchased",
    message: `${userName} bought ${listings} ${listings === 1 ? "listing" : "listings"} for ${months} ${months === 1 ? "month" : "months"} (order ${orderNumber}).`,
    property_id: null,
  };
}

function leadReceived({ propertyId, leadId, title, leadName }) {
  return {
    type: NOTIFICATION_TYPES.leadReceived,
    title,
    message: `${leadName} contacted this property.`,
    property_id: propertyId,
    lead_id: leadId,
  };
}

module.exports = { NOTIFICATION_TYPES, propertySubmitted, propertyResubmitted, subscriptionPurchased, leadReceived };
