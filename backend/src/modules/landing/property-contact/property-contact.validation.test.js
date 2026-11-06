const { contactListerSchema } = require("./property-contact.validation");

const valid = { propertyId: "3f2b8c1e-7a4d-4e5f-9b6a-1c2d3e4f5a6b", contactRole: "owner" };
const validate = (body) => contactListerSchema.validate(body, { abortEarly: false, stripUnknown: true });

describe("contactListerSchema", () => {
  it("accepts every supported contact role", () => {
    ["owner", "agent", "builder"].forEach((contactRole) => {
      expect(validate({ ...valid, contactRole }).error).toBeUndefined();
    });
  });

  it("rejects a missing or malformed property id", () => {
    expect(validate({ contactRole: "owner" }).error).toBeDefined();
    expect(validate({ ...valid, propertyId: "not-a-uuid" }).error).toBeDefined();
  });

  it("rejects unknown contact roles", () => {
    expect(validate({ ...valid, contactRole: "admin" }).error).toBeDefined();
    expect(validate({ propertyId: valid.propertyId }).error).toBeDefined();
  });

  it("never accepts a user id from the body", () => {
    expect(validate({ ...valid, userId: "someone" }).value).not.toHaveProperty("userId");
  });
});
