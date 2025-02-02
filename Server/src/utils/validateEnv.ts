export function validateEnv(): void {
  let required: string[] = [];
  if (process.env.NODE_ENV === "test") {
    required = ["JWT_SECRET", "PASSWORD_KEY", "MONGODB_URI_TEST"];
  } else {
    required = [
      "JWT_SECRET",
      "PASSWORD_KEY",
      "MONGO_URI",
      "DEVICE_TOKEN_SECRET",
      "ENCRYPTION_KEY",
    ];
  }
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}
