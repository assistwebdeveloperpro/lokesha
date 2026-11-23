const NOTIFICATION_TYPES = {
  propertyApproved: "property_approved",
  propertyRejected: "property_rejected",
  leadReceived: "lead_received",
  freePackageGranted: "free_package_granted",
  leadLimitNear: "lead_limit_near",
  leadLimitReached: "lead_limit_reached",
  paymentSuccess: "payment_success",
  paymentFailed: "payment_failed",
  subscriptionEndingSoon: "subscription_ending_soon",
  subscriptionEnded: "subscription_ended",
  propertyExpired: "property_expired",
  creditsLow: "credits_low",
  creditsAdded: "credits_added",
  subscriptionExtended: "subscription_extended",
  refundIssued: "refund_issued",
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

function leadReceived({ userId, propertyId, leadId, title }) {
  return {
    user_id: userId,
    type: NOTIFICATION_TYPES.leadReceived,
    title,
    message: "A new verified lead has been shared with you.",
    property_id: propertyId,
    lead_id: leadId,
  };
}

function freePackageGranted({ userId, credits }) {
  return {
    user_id: userId,
    type: NOTIFICATION_TYPES.freePackageGranted,
    title: "Welcome to Lokesha",
    message: `You have ${credits} free ${credits === 1 ? "listing" : "listings"}. Post your property today.`,
    property_id: null,
  };
}

function leadLimitNear({ userId, propertyId, title, received, limit }) {
  return {
    user_id: userId,
    type: NOTIFICATION_TYPES.leadLimitNear,
    title,
    message: `This property has received ${received} of ${limit} leads. Upgrade to the Standard package for unlimited leads.`,
    property_id: propertyId,
  };
}

function leadLimitReached({ userId, propertyId, title, limit }) {
  return {
    user_id: userId,
    type: NOTIFICATION_TYPES.leadLimitReached,
    title,
    message: `This property has received all ${limit} leads included in your package and new leads are held back until you upgrade. Upgrade to the Standard package for unlimited leads.`,
    property_id: propertyId,
  };
}

function paymentSuccess({ userId, listings, months }) {
  return {
    user_id: userId,
    type: NOTIFICATION_TYPES.paymentSuccess,
    title: "Payment successful",
    message: `Your Standard package is active with ${listings} ${listings === 1 ? "listing" : "listings"} for ${months} ${months === 1 ? "month" : "months"}.`,
    property_id: null,
  };
}

function paymentFailed({ userId, orderNumber }) {
  return {
    user_id: userId,
    type: NOTIFICATION_TYPES.paymentFailed,
    title: "Payment failed",
    message: `Your payment for order ${orderNumber} was not completed. No amount was kept. You can try again from My Subscription.`,
    property_id: null,
  };
}

function subscriptionEndingSoon({ userId, daysLeft }) {
  return {
    user_id: userId,
    type: NOTIFICATION_TYPES.subscriptionEndingSoon,
    title: daysLeft <= 1 ? "Your subscription ends tomorrow" : `Your subscription ends in ${daysLeft} days`,
    message: "Properties published under it go offline when it ends. Buy the Standard package again to keep them live.",
    property_id: null,
  };
}

function subscriptionEnded({ userId, closedCount }) {
  const offline =
    closedCount > 0
      ? ` ${closedCount} ${closedCount === 1 ? "property is" : "properties are"} now offline. Your leads and history are kept.`
      : " Your leads and history are kept.";

  return {
    user_id: userId,
    type: NOTIFICATION_TYPES.subscriptionEnded,
    title: "Your subscription has ended",
    message: `Unused credits were not carried forward.${offline} Buy the Standard package to publish again.`,
    property_id: null,
  };
}

function propertyExpired({ userId, propertyId, title }) {
  return {
    user_id: userId,
    type: NOTIFICATION_TYPES.propertyExpired,
    title,
    message: "This property is no longer live because its validity ended. Publish it again with a listing credit.",
    property_id: propertyId,
  };
}

function creditsLow({ userId, remaining }) {
  return {
    user_id: userId,
    type: NOTIFICATION_TYPES.creditsLow,
    title: "You are running low on credits",
    message: `Only ${remaining} listing ${remaining === 1 ? "credit" : "credits"} left. Buy the Standard package to keep publishing.`,
    property_id: null,
  };
}

const formatEndDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

function creditsAdded({ userId, credits, endsAt }) {
  return {
    user_id: userId,
    type: NOTIFICATION_TYPES.creditsAdded,
    title: "Listing credits added to your account",
    message: `Lokesha added ${credits} listing ${credits === 1 ? "credit" : "credits"} to your account, valid until ${formatEndDate(endsAt)}.`,
    property_id: null,
  };
}

function subscriptionExtended({ userId, endsAt }) {
  return {
    user_id: userId,
    type: NOTIFICATION_TYPES.subscriptionExtended,
    title: "Your subscription was extended",
    message: `Your subscription and its live properties now run until ${formatEndDate(endsAt)}.`,
    property_id: null,
  };
}

function refundIssued({ userId, orderNumber }) {
  return {
    user_id: userId,
    type: NOTIFICATION_TYPES.refundIssued,
    title: "Your payment was refunded",
    message: `Order ${orderNumber} was refunded to your original payment method. Unused credits of that order were removed.`,
    property_id: null,
  };
}

module.exports = {
  NOTIFICATION_TYPES,
  propertyApproved,
  propertyRejected,
  leadReceived,
  freePackageGranted,
  leadLimitNear,
  leadLimitReached,
  paymentSuccess,
  paymentFailed,
  subscriptionEndingSoon,
  subscriptionEnded,
  propertyExpired,
  creditsLow,
  creditsAdded,
  subscriptionExtended,
  refundIssued,
};
