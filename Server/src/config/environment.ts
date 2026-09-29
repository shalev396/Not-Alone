/**
 * Minimal runtime config for Lambda / local.
 */
export function getMongoUri(): string {
  if (process.env.NODE_ENV === "test") {
    const t = process.env.DATABASE_URL_TEST;
    if (!t) throw new Error("DATABASE_URL_TEST is required in test");
    return t;
  }
  const uri = process.env.DATABASE_URL;
  if (!uri) throw new Error("DATABASE_URL is required");
  return uri;
}

export function isLambdaRuntime(): boolean {
  return Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
}
