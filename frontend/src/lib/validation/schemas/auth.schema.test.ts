import { describe, expect, it } from "vitest";
import { validateWithSchema } from "../joi";
import { loginSchema, signupSchema } from "./auth.schema";

const validSignup = {
  role: "buyer_owner_tenant",
  name: "Asha Rao",
  email: "asha@example.com",
  mobile_number: "9876543210",
  agreed_to_terms: true,
};

describe("loginSchema", () => {
  it("accepts a 10 to 15 digit mobile number", () => {
    expect(validateWithSchema(loginSchema, { mobile_number: "9876543210" }).errors).toEqual({});
    expect(
      validateWithSchema(loginSchema, { mobile_number: "919876543210123" }).errors,
    ).toEqual({});
  });

  it("asks for a number when empty", () => {
    expect(validateWithSchema(loginSchema, { mobile_number: "" }).errors).toEqual({
      mobile_number: "Please enter your mobile number.",
    });
  });

  it("rejects numbers shorter than 10 or longer than 15 digits", () => {
    expect(validateWithSchema(loginSchema, { mobile_number: "98765" }).errors.mobile_number)
      .toMatch(/min. 10 digits/);
    expect(
      validateWithSchema(loginSchema, { mobile_number: "9".repeat(16) }).errors.mobile_number,
    ).toMatch(/at most 15 digits/);
  });
});

describe("signupSchema", () => {
  it("accepts a valid buyer signup", () => {
    expect(validateWithSchema(signupSchema, validSignup).errors).toEqual({});
  });

  it("reports every invalid field at once", () => {
    const { errors } = validateWithSchema(signupSchema, {
      ...validSignup,
      name: "",
      email: "not-an-email",
      mobile_number: "123",
      agreed_to_terms: false,
    });

    expect(errors).toEqual({
      name: "Please enter your name.",
      email: "Please enter a valid email id.",
      mobile_number: "Mobile number must be exactly 10 digits.",
      agreed_to_terms: "Please accept the terms and conditions.",
    });
  });

  it("trims the name before measuring its length", () => {
    const { errors } = validateWithSchema(signupSchema, { ...validSignup, name: "  ab  " });

    expect(errors.name).toBe("Name must be at least 3 characters long.");
  });

  it("requires an agency name for agents only", () => {
    const agent = { ...validSignup, role: "agent" };

    expect(validateWithSchema(signupSchema, agent).errors.agency_name).toBe(
      "Please enter agency name.",
    );
    expect(
      validateWithSchema(signupSchema, { ...agent, agency_name: "Rao Realty" }).errors,
    ).toEqual({});
    expect(
      validateWithSchema(signupSchema, { ...validSignup, agency_name: "Rao Realty" }).errors
        .agency_name,
    ).toBeDefined();
  });

  it("requires a company name for builders only", () => {
    const builder = { ...validSignup, role: "builder" };

    expect(validateWithSchema(signupSchema, builder).errors.company_name).toBe(
      "Please enter company name.",
    );
    expect(
      validateWithSchema(signupSchema, { ...builder, company_name: "Rao Homes" }).errors,
    ).toEqual({});
  });

  it("rejects an unknown role", () => {
    expect(
      validateWithSchema(signupSchema, { ...validSignup, role: "admin" }).errors.role,
    ).toBeDefined();
  });
});
