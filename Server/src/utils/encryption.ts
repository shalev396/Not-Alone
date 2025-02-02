// utils/encryption.ts
import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
const SECRET_KEY =
  process.env.DEVICE_TOKEN_SECRET || "32_characters_secret_key";
// Must be 32 bytes for AES-256

export function encryptPayload(payload: Record<string, any>): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET_KEY), iv);

  const jsonData = JSON.stringify(payload);
  let encrypted = cipher.update(jsonData, "utf8", "hex");
  encrypted += cipher.final("hex");

  return iv.toString("hex") + ":" + encrypted;
}

export function decryptPayload(
  encryptedData: string
): Record<string, any> | null {
  try {
    const [ivHex, encrypted] = encryptedData.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(SECRET_KEY),
      iv
    );

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return JSON.parse(decrypted);
  } catch (err) {
    console.error("Failed to decrypt data:", err);
    return null;
  }
}
