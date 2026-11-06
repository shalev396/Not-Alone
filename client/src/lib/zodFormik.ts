// Local ESM port of `toFormikValidationSchema` from zod-formik-adapter@2.1.0
// (MIT). The package ships CommonJS only, so its `require("zod/v4")` pulled a
// second, non-tree-shakable copy of Zod (all locales) into the bundle.
import { core, type ZodType } from "zod";
import type { ZodMiniType } from "zod/mini";

export class ValidationError extends Error {
  name: string;
  inner: Array<{ path: string; message: string }>;

  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
    this.inner = [];
  }
}

function createValidationError(e: core.$ZodError): ValidationError {
  const error = new ValidationError(e.message);
  error.inner = e.issues.map((err) => ({
    message: err.message,
    path: err.path.join("."),
  }));
  return error;
}

/**
 * Wrap your zod schema in this function when providing it to Formik's validation schema prop
 * @param schema The zod schema
 * @returns An object containing the `validate` method expected by Formik
 */
export function toFormikValidationSchema<T>(
  schema: ZodType<T> | ZodMiniType<T>,
  params?: Partial<core.ParseContext<core.$ZodIssue>>
): { validate: (obj: unknown) => Promise<void> } {
  return {
    async validate(obj: unknown) {
      try {
        await schema.parseAsync(obj, params);
      } catch (err) {
        if (!(err instanceof core.$ZodError)) {
          throw err;
        }
        throw createValidationError(err);
      }
    },
  };
}
