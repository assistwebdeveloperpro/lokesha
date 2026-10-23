import Joi from "joi/dist/joi-browser.min.mjs";
import type { Schema } from "joi";

export type SchemaErrors = Record<string, string>;

export type SchemaResult<T> = { value: T; errors: SchemaErrors };

// Same shape the backend validate middleware returns: first message per field path
export function validateWithSchema<T = unknown>(
  schema: Schema,
  values: unknown,
): SchemaResult<T> {
  const { error, value } = schema.validate(values, {
    abortEarly: false,
    allowUnknown: true,
  });

  const errors: SchemaErrors = {};
  for (const detail of error?.details ?? []) {
    const key = detail.path.join(".");
    if (key && !(key in errors)) {
      errors[key] = detail.message;
    }
  }

  return { value: value as T, errors };
}

export default Joi;
