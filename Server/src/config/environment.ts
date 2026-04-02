/**
 * Minimal runtime config for Lambda / local.
 */
export function getMongoUri(): string {
  if (process.env.NODE_ENV === "test") {
    const t = process.env.MONGODB_URI_TEST;
    if (!t) throw new Error("MONGODB_URI_TEST is required in test");
    return t;
  }
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI is required");
  return uri;
}

export function isLambdaRuntime(): boolean {
  return Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
}
