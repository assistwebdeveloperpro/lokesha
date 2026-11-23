const NOTIFICATION_TYPES = {
  propertySubmitted: "property_submitted",
  propertyResubmitted: "property_resubmitted",
  subscriptionPurchased: "subscription_purchased",
  leadPackPurchased: "lead_pack_purchased",
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

function leadPackPurchased({ userName, propertyId, title, leads, orderNumber }) {
  return {
    type: NOTIFICATION_TYPES.leadPackPurchased,
    title,
    message: `${userName} bought ${leads} extra ${leads === 1 ? "lead" : "leads"} for this property (order ${orderNumber}). Held leads can now be sent.`,
    property_id: propertyId,
  };
}

function leadReceived({ propertyId, leadId, title, leadName }) {
  return {
    type: NOTIFICATION_TYPES.leadReceived,
    title,
    message: `New lead received from ${leadName} for this property.`,
    property_id: propertyId,
    lead_id: leadId,
  };
}

module.exports = {
  NOTIFICATION_TYPES,
  propertySubmitted,
  propertyResubmitted,
  subscriptionPurchased,
  leadPackPurchased,
  leadReceived,
};
