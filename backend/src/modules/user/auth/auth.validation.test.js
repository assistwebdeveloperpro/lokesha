const { signupSchema, loginSchema, verifyOtpSchema } = require("./auth.validation");

const validSignup = {
  role: "buyer_owner_tenant",
  name: "Asha Rao",
  email: "asha@example.com",
  mobile_number: "9876543210",
  agreed_to_terms: true,
};

const fieldsWithErrors = (schema, payload) =>
  (schema.validate(payload, { abortEarly: false }).error?.details ?? []).map((detail) =>
    detail.path.join("."),
  );

describe("signupSchema", () => {
  it("accepts a valid buyer", () => {
    expect(signupSchema.validate(validSignup).error).toBeUndefined();
  });

  it("requires an agency name for agents and forbids a company name", () => {
    const agent = { ...validSignup, role: "agent" };

    expect(fieldsWithErrors(signupSchema, agent)).toContain("agency_name");
    expect(
      signupSchema.validate({ ...agent, agency_name: "Rao Realty" }).error,
    ).toBeUndefined();
    expect(
      fieldsWithErrors(signupSchema, { ...agent, agency_name: "Rao", company_name: "X" }),
    ).toContain("company_name");
  });

  it("requires a company name for builders and forbids an agency name", () => {
    const builder = { ...validSignup, role: "builder" };

    expect(fieldsWithErrors(signupSchema, builder)).toContain("company_name");
    expect(
      signupSchema.validate({ ...builder, company_name: "Rao Homes" }).error,
    ).toBeUndefined();
  });

  it("rejects an unknown role, a short mobile number and declined terms", () => {
    const fields = fieldsWithErrors(signupSchema, {
      ...validSignup,
      role: "admin",
      mobile_number: "123",
      agreed_to_terms: false,
    });

    expect(fields).toEqual(expect.arrayContaining(["role", "mobile_number", "agreed_to_terms"]));
  });
});

describe("loginSchema", () => {
  it.each(["9876543210", "919876543210123"])("accepts %s", (mobile_number) => {
    expect(loginSchema.validate({ mobile_number }).error).toBeUndefined();
  });

  it.each(["98765", "9".repeat(16), "98765abcde"])("rejects %s", (mobile_number) => {
    expect(loginSchema.validate({ mobile_number }).error).toBeDefined();
  });
});

describe("verifyOtpSchema", () => {
  it("requires a 4 digit otp", () => {
    const mobile_number = "9876543210";

    expect(verifyOtpSchema.validate({ mobile_number, otp: "1234" }).error).toBeUndefined();
    expect(verifyOtpSchema.validate({ mobile_number, otp: "123" }).error).toBeDefined();
    expect(verifyOtpSchema.validate({ mobile_number, otp: "12a4" }).error).toBeDefined();
  });
});
