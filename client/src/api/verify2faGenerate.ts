import { api } from "@/api/api";

/** While a generate is in flight for this userId, all callers share the same promise → one HTTP request. */
const inFlightByUserId = new Map<
  string,
  Promise<{ deviceToken: string }>
>();

export type TwoFactorGenerateResult = { deviceToken: string };

/**
 * Use on initial /2fa load. Safe to call from effects that may run more than once:
 * overlapping calls reuse the same in-flight request (single POST).
 */
export function requestInitialTwoFactorCode(
  userId: string
): Promise<TwoFactorGenerateResult> {
  const existing = inFlightByUserId.get(userId);
  if (existing) return existing;

  const promise = api
    .post("/verify-2fa/generate", { userId })
    .then((res) => ({
      deviceToken: res.data.deviceToken as string,
    }))
    .finally(() => {
      inFlightByUserId.delete(userId);
    });

  inFlightByUserId.set(userId, promise);
  return promise;
}

/** Resend: always a new POST (does not dedupe). */
export function requestResendTwoFactorCode(
  userId: string
): Promise<TwoFactorGenerateResult> {
  inFlightByUserId.delete(userId);
  return api
    .post("/verify-2fa/generate", { userId })
    .then((res) => ({
      deviceToken: res.data.deviceToken as string,
    }));
}

// --- Forgot / reset password: same endpoint, dedupe by email ---

export type ResetPasswordGenerateResult = {
  deviceToken: string;
  userId: string;
};

const resetPasswordInFlightByEmail = new Map<
  string,
  Promise<ResetPasswordGenerateResult>
>();

function resetPasswordEmailKey(email: string): string {
  return email.toLowerCase().trim();
}

function parseResetPasswordGenerateResponse(
  res: { data: { deviceToken?: string; userId?: string } }
): ResetPasswordGenerateResult {
  return {
    deviceToken: res.data.deviceToken as string,
    userId: res.data.userId as string,
  };
}

/**
 * Forgot-password submit + reset-password verify page mount: overlapping calls
 * for the same email share one POST to /auth/verify-2fa/reset-password/generate.
 */
export function requestDedupedResetPasswordGenerate(
  email: string
): Promise<ResetPasswordGenerateResult> {
  const key = resetPasswordEmailKey(email);
  const existing = resetPasswordInFlightByEmail.get(key);
  if (existing) return existing;

  const promise = api
    .post("/auth/verify-2fa/reset-password/generate", { email })
    .then(parseResetPasswordGenerateResponse)
    .finally(() => {
      resetPasswordInFlightByEmail.delete(key);
    });

  resetPasswordInFlightByEmail.set(key, promise);
  return promise;
}

/** Reset-password verify page: initial code (deduped). */
export function requestInitialResetPasswordCode(
  email: string
): Promise<ResetPasswordGenerateResult> {
  return requestDedupedResetPasswordGenerate(email);
}

/** Resend on reset-password verify: always a new POST. */
export function requestResendResetPasswordCode(
  email: string
): Promise<ResetPasswordGenerateResult> {
  const key = resetPasswordEmailKey(email);
  resetPasswordInFlightByEmail.delete(key);
  return api
    .post("/auth/verify-2fa/reset-password/generate", { email })
    .then(parseResetPasswordGenerateResponse);
}
