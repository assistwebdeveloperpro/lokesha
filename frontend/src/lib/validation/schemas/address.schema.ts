import Joi from "../joi";

// Mirrors addressSchema in backend/src/modules/shared/property/validation/property.validation.js
const PIN_CODE_PATTERN = /^\d{6}$/;

type AddressSchemaOptions = { projectNameOptional?: boolean };

export function createAddressLocationSchema({
  projectNameOptional = false,
}: AddressSchemaOptions = {}) {
  const projectName = Joi.string()
    .trim()
    .max(255)
    .messages({
      "string.empty": "Please enter the name of society, building, or project name",
      "any.required": "Please enter the name of society, building, or project name",
      "string.max": "Project name must be at most 255 characters long",
    });

  const unitField = (label: string) =>
    Joi.string()
      .trim()
      .max(50)
      .allow("")
      .messages({ "string.max": `${label} must be at most 50 characters long` });

  return Joi.object({
    blockNo: unitField("Block No."),
    flatNumber: unitField("Flat / House / Shop number"),
    projectName: projectNameOptional ? projectName.allow("") : projectName.required(),
    city: Joi.string().trim().max(100).required().messages({
      "string.empty": "Please select city",
      "any.required": "Please select city",
      "string.max": "City must be at most 100 characters long",
    }),
    locality: Joi.string().trim().max(255).required().messages({
      "string.empty": "Please select locality",
      "any.required": "Please select locality",
      "string.max": "Locality must be at most 255 characters long",
    }),
    pinCode: Joi.string().trim().pattern(PIN_CODE_PATTERN).required().messages({
      "string.empty": "Please enter pin code",
      "any.required": "Please enter pin code",
      "string.pattern.base": "Pin code must be 6 digits",
    }),
    propertyDescription: Joi.string().trim().required().messages({
      "string.empty": "Please enter property description",
      "any.required": "Please enter property description",
    }),
  });
}
