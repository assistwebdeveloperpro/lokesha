const { NOTIFICATION_TYPES, leadReceived, freePackageGranted, leadLimitNear, leadLimitReached } = require("./user-notifications.templates");

const {
  subscriptionEndingSoon,
  subscriptionEnded,
  propertyExpired,
  creditsLow,
} = require("./user-notifications.templates");

describe("subscription lifecycle notifications", () => {
  it("warns before the end with the days left", () => {
    expect(subscriptionEndingSoon({ userId: "u-1", daysLeft: 7 })).toMatchObject({
      user_id: "u-1",
      type: "subscription_ending_soon",
      title: "Your subscription ends in 7 days",
      property_id: null,
    });
    expect(subscriptionEndingSoon({ userId: "u-1", daysLeft: 1 }).title).toBe("Your subscription ends tomorrow");
  });

  it("says how many properties went offline and that leads are kept", () => {
    expect(subscriptionEnded({ userId: "u-1", closedCount: 2 }).message).toContain("2 properties are now offline");
    expect(subscriptionEnded({ userId: "u-1", closedCount: 1 }).message).toContain("1 property is now offline");
    expect(subscriptionEnded({ userId: "u-1", closedCount: 0 }).message).not.toContain("offline");
    expect(subscriptionEnded({ userId: "u-1", closedCount: 0 }).message).toContain("leads and history are kept");
  });

  it("links an expired property and a low credit warning", () => {
    expect(propertyExpired({ userId: "u-1", propertyId: "p-1", title: "Sky Heights" })).toMatchObject({
      type: "property_expired",
      title: "Sky Heights",
      property_id: "p-1",
    });
    expect(creditsLow({ userId: "u-1", remaining: 1 })).toMatchObject({ type: "credits_low", message: expect.stringContaining("Only 1 listing credit left") });
  });
});

const { creditsAdded, subscriptionExtended, refundIssued } = require("./user-notifications.templates");

describe("admin action notifications", () => {
  it("tells the user about gifted credits with the IST end date", () => {
    expect(creditsAdded({ userId: "u-1", credits: 3, endsAt: new Date("2027-02-20T10:00:00.000Z") })).toEqual({
      user_id: "u-1",
      type: "credits_added",
      title: "Listing credits added to your account",
      message: "Lokesha added 3 listing credits to your account, valid until 20 Feb 2027.",
      property_id: null,
    });
    expect(creditsAdded({ userId: "u-1", credits: 1, endsAt: new Date("2027-02-20T10:00:00.000Z") }).message).toContain("1 listing credit ");
  });

  it("tells the user about an extension and a refund", () => {
    expect(subscriptionExtended({ userId: "u-1", endsAt: new Date("2027-03-01T00:00:00.000Z") })).toMatchObject({
      type: "subscription_extended",
      message: "Your subscription and its live properties now run until 01 Mar 2027.",
    });
    expect(refundIssued({ userId: "u-1", orderNumber: "ORD-1" })).toMatchObject({
      type: "refund_issued",
      message: expect.stringContaining("Order ORD-1 was refunded"),
    });
  });
});

describe("lead limit notifications", () => {
  it("warns that the limit is close", () => {
    expect(leadLimitNear({ userId: "user-1", propertyId: "prop-1", title: "Sky Heights", received: 1, limit: 2 })).toEqual({
      user_id: "user-1",
      type: NOTIFICATION_TYPES.leadLimitNear,
      title: "Sky Heights",
      message: "This property has received 1 of 2 leads. Upgrade to the Standard package for unlimited leads.",
      property_id: "prop-1",
    });
  });

  it("says the limit is used", () => {
    const row = leadLimitReached({ userId: "user-1", propertyId: "prop-1", title: "Sky Heights", limit: 2 });

    expect(row).toMatchObject({ type: NOTIFICATION_TYPES.leadLimitReached, property_id: "prop-1" });
    expect(row.message).toContain("all 2 leads");
  });
});

describe("freePackageGranted", () => {
  it("builds a welcome row with no property and a pluralised message", () => {
    expect(freePackageGranted({ userId: "user-1", credits: 2 })).toEqual({
      user_id: "user-1",
      type: NOTIFICATION_TYPES.freePackageGranted,
      title: "Welcome to Lokesha",
      message: "You have 2 free listings. Post your property today.",
      property_id: null,
    });
    expect(freePackageGranted({ userId: "user-1", credits: 1 }).message).toContain("1 free listing.");
  });
});

describe("leadReceived", () => {
  it("builds a lead notification row linked to the property and the lead", () => {
    expect(leadReceived({ userId: "user-1", propertyId: "prop-1", leadId: "lead-1", title: "Sky Heights" })).toEqual({
      user_id: "user-1",
      type: NOTIFICATION_TYPES.leadReceived,
      title: "Sky Heights",
      message: "A new verified lead has been shared with you.",
      property_id: "prop-1",
      lead_id: "lead-1",
    });
  });
});
