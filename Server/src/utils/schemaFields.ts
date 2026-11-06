import { Schema } from "mongoose";

/**
 * Builds a `$set` document from request input, keeping only keys that are
 * fields of the schema. Unknown keys and MongoDB operators ("$...") are
 * dropped, so client input can only set the model's own fields.
 */
export const pickSchemaFields = (
  schema: Schema,
  input: object,
): Record<string, unknown> => {
  const fields: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input ?? {})) {
    const pathType = schema.pathType(key);
    if (pathType === "real" || pathType === "nested") {
      fields[key] = value;
    }
  }
  return fields;
};
