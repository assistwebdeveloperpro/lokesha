const { NOTIFICATION_TYPES, leadReceived } = require("./user-notifications.templates");

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
