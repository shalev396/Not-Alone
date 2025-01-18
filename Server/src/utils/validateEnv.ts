export function validateEnv(): void {
  const required = ["JWT_SECRET", "PASSWORD_KEY", "MONGO_URI"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}
