import { describe, expect, it } from "vitest";
import { validateWithSchema } from "../joi";
import { createAddressLocationSchema } from "./address.schema";

const validAddress = {
  projectName: "Green Heights",
  locality: "Indiranagar",
  pinCode: "560038",
  propertyDescription: "Spacious corner flat",
};

describe("createAddressLocationSchema", () => {
  it("accepts a complete address", () => {
    const { errors } = validateWithSchema(createAddressLocationSchema(), validAddress);

    expect(errors).toEqual({});
  });

  it("asks for every required field when blank", () => {
    const { errors } = validateWithSchema(createAddressLocationSchema(), {
      projectName: "   ",
      locality: "",
      pinCode: "",
      propertyDescription: "  ",
    });

    expect(errors).toEqual({
      projectName: "Please enter the name of society, building, or project name",
      locality: "Please enter locality",
      pinCode: "Please enter pin code",
      propertyDescription: "Please enter property description",
    });
  });

  it("requires a 6 digit pin code", () => {
    const { errors } = validateWithSchema(createAddressLocationSchema(), {
      ...validAddress,
      pinCode: "5600",
    });

    expect(errors).toEqual({ pinCode: "Pin code must be 6 digits" });
  });

  it("trims the pin code before checking it", () => {
    const { errors } = validateWithSchema(createAddressLocationSchema(), {
      ...validAddress,
      pinCode: " 560038 ",
    });

    expect(errors).toEqual({});
  });

  it("allows a blank project name when it is optional", () => {
    const schema = createAddressLocationSchema({ projectNameOptional: true });

    expect(validateWithSchema(schema, { ...validAddress, projectName: "" }).errors).toEqual({});
  });

  it("limits project name and locality to 255 characters", () => {
    const { errors } = validateWithSchema(createAddressLocationSchema(), {
      ...validAddress,
      projectName: "a".repeat(256),
      locality: "b".repeat(256),
    });

    expect(Object.keys(errors).sort()).toEqual(["locality", "projectName"]);
  });
});
