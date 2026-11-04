const { validateCompletePayload } = require("./property-payload.validation");

const ownerContact = {
  fullName: "Ramesh Patel",
  mobileNumber: "9876543210",
  alternateMobileNumber: "9876543211",
  email: "ramesh@example.com",
  whatsappNumber: "9876543212",
};

const buildPayload = (extra = {}) => ({
  listingType: "sale",
  propertyType: "residential",
  address: { locality: "Vesu", pinCode: "395007", state: "Gujarat" },
  listings: [
    {
      propertySubType: "flat-apartment",
      description: "A nice property",
      details: { bedrooms: 2 },
      pricing: { expectedPrice: 5000000 },
      files: { media: [{ path: "temp/drafts/d/media-x.jpg", category: "exterior" }] },
    },
  ],
  ...extra,
});

const validate = (payload, hasOwnerContact) =>
  validateCompletePayload(payload, { isBuilderPost: false, hasOwnerContact });

describe("owner contact validation", () => {
  describe("for staff and admin", () => {
    it("accepts a complete owner contact", () => {
      const { fields, value } = validate(buildPayload({ ownerContact }), true);

      expect(fields).toEqual({});
      expect(value.ownerContact).toEqual(ownerContact);
    });

    it("accepts only the required fields", () => {
      const { fields, value } = validate(
        buildPayload({ ownerContact: { fullName: "Ramesh Patel", mobileNumber: "9876543210" } }),
        true
      );

      expect(fields).toEqual({});
      expect(value.ownerContact).toEqual({ fullName: "Ramesh Patel", mobileNumber: "9876543210" });
    });

    it("treats blank optional fields as not answered", () => {
      const { fields, value } = validate(
        buildPayload({
          ownerContact: { ...ownerContact, alternateMobileNumber: "", email: "", whatsappNumber: null },
        }),
        true
      );

      expect(fields).toEqual({});
      expect(value.ownerContact).toEqual({ fullName: ownerContact.fullName, mobileNumber: ownerContact.mobileNumber });
    });

    it("requires the owner contact", () => {
      const { fields } = validate(buildPayload(), true);

      expect(fields.ownerContact).toBeDefined();
    });

    it("requires the full name and mobile number", () => {
      const { fields } = validate(buildPayload({ ownerContact: { email: "ramesh@example.com" } }), true);

      expect(Object.keys(fields)).toEqual(expect.arrayContaining(["ownerContact.fullName", "ownerContact.mobileNumber"]));
    });

    it.each(["mobileNumber", "alternateMobileNumber", "whatsappNumber"])("rejects a %s that is not 10 digits", (field) => {
      const { fields } = validate(buildPayload({ ownerContact: { ...ownerContact, [field]: "12345" } }), true);

      expect(fields[`ownerContact.${field}`]).toBe("Mobile number must be 10 digits");
    });

    it("rejects an invalid email address", () => {
      const { fields } = validate(buildPayload({ ownerContact: { ...ownerContact, email: "not-an-email" } }), true);

      expect(fields["ownerContact.email"]).toBeDefined();
    });

    it("rejects a full name longer than 150 characters", () => {
      const { fields } = validate(buildPayload({ ownerContact: { ...ownerContact, fullName: "a".repeat(151) } }), true);

      expect(fields["ownerContact.fullName"]).toBeDefined();
    });
  });

  describe("for owners, agents and builders", () => {
    it("accepts a payload without an owner contact", () => {
      const { fields, value } = validate(buildPayload(), false);

      expect(fields).toEqual({});
      expect(value).not.toHaveProperty("ownerContact");
    });

    it("rejects a payload that carries an owner contact", () => {
      const { fields } = validate(buildPayload({ ownerContact }), false);

      expect(fields.ownerContact).toBe("Owner contact is only allowed for Lokesha staff and admin listings");
    });

    it("rejects an owner contact when the caller permission is not given", () => {
      const { fields } = validateCompletePayload(buildPayload({ ownerContact }), { isBuilderPost: false });

      expect(fields.ownerContact).toBeDefined();
    });
  });
});
