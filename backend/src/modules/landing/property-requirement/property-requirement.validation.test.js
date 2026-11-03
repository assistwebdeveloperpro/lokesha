const { createRequirementSchema } = require("./property-requirement.validation");

const valid = {
  listingType: "sale",
  propertyType: "residential",
  city: "Ahmedabad",
  localities: ["Bopal"],
  requirement: "Need a 3 BHK near the ring road",
};
const validate = (body) => createRequirementSchema.validate(body, { abortEarly: false, stripUnknown: true });

describe("createRequirementSchema", () => {
  it("accepts a complete requirement and defaults the sub types", () => {
    const { value, error } = validate(valid);

    expect(error).toBeUndefined();
    expect(value.subTypes).toEqual([]);
  });

  it("requires at least one locality and a requirement text", () => {
    expect(validate({ ...valid, localities: [] }).error).toBeDefined();
    expect(validate({ ...valid, requirement: "   " }).error).toBeDefined();
  });

  it("rejects unknown types and too long text", () => {
    expect(validate({ ...valid, listingType: "buy" }).error).toBeDefined();
    expect(validate({ ...valid, propertyType: "villa" }).error).toBeDefined();
    expect(validate({ ...valid, requirement: "a".repeat(1001) }).error).toBeDefined();
  });

  it("never accepts a user id from the body", () => {
    expect(validate({ ...valid, userId: "someone" }).value).not.toHaveProperty("userId");
  });
});
