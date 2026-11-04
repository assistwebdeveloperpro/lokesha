import { describe, expect, it } from "vitest";
import { validateWithSchema } from "../joi";
import { createOwnerContactSchema } from "./ownerContact.schema";

const validContact = {
  fullName: "Ramesh Patel",
  mobileNumber: "9876543210",
  alternateMobileNumber: "9876543211",
  email: "ramesh@example.com",
  whatsappNumber: "9876543212",
};

const validate = (values: Record<string, string>) =>
  validateWithSchema(createOwnerContactSchema(), values).errors;

describe("createOwnerContactSchema", () => {
  it("accepts a complete owner contact", () => {
    expect(validate(validContact)).toEqual({});
  });

  it("accepts only the required fields", () => {
    expect(
      validate({
        fullName: "Ramesh Patel",
        mobileNumber: "9876543210",
        alternateMobileNumber: "",
        email: "",
        whatsappNumber: "",
      }),
    ).toEqual({});
  });

  it("asks for the full name and mobile number when blank", () => {
    expect(
      validate({ ...validContact, fullName: "  ", mobileNumber: "" }),
    ).toEqual({
      fullName: "Please enter owner full name",
      mobileNumber: "Please enter mobile number",
    });
  });

  it.each([
    ["mobileNumber", "Mobile number must be 10 digits"],
    ["alternateMobileNumber", "Alternate mobile number must be 10 digits"],
    ["whatsappNumber", "WhatsApp number must be 10 digits"],
  ])("requires 10 digits for %s", (field, message) => {
    expect(validate({ ...validContact, [field]: "12345" })).toEqual({
      [field]: message,
    });
  });

  it("rejects letters in a mobile number", () => {
    expect(validate({ ...validContact, mobileNumber: "98765abcde" })).toEqual({
      mobileNumber: "Mobile number must be 10 digits",
    });
  });

  it("rejects an invalid email address", () => {
    expect(validate({ ...validContact, email: "not-an-email" })).toEqual({
      email: "Please enter a valid email address",
    });
  });

  it("limits the full name to 150 characters", () => {
    expect(validate({ ...validContact, fullName: "a".repeat(151) })).toEqual({
      fullName: "Full name must be at most 150 characters long",
    });
  });
});
