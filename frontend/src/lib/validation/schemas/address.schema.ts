import Joi from "../joi";

// Mirrors addressSchema in backend/src/modules/landing/property/property.validation.js
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

  return Joi.object({
    projectName: projectNameOptional ? projectName.allow("") : projectName.required(),
    locality: Joi.string().trim().max(255).required().messages({
      "string.empty": "Please enter locality",
      "any.required": "Please enter locality",
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
