import { usersApi as api } from "@/services/http";

type Ok = { ok: true };

/**
 * 1) Request password-reset link (backend sends email / returns 200/204).
 *    Correct route: POST /users/forgot-password
 */
export async function requestPasswordReset(payload: {
  email: string;
}): Promise<Ok> {
  await api.post("/users/forgot-password", payload);
  return { ok: true };
}

/**
 * 2) Validate reset token (server may return 200/204; sometimes echoes email).
 *    Route: GET /users/reset-password/validate?token=...
 */
export async function validateResetToken(
  token: string
): Promise<{ valid: boolean; email?: string }> {
  try {
    const { data } = await api.get("/users/reset-password/validate", {
      params: { token },
    });
    return typeof data === "object" &&
      data &&
      "email" in (data as Record<string, unknown>)
      ? { valid: true, email: (data as { email?: string }).email }
      : { valid: true };
  } catch {
    return { valid: false };
  }
}

/**
 * 3) Perform the password reset.
 *    Route: POST /users/reset-password
 */
export async function performPasswordReset(payload: {
  token: string;
  password: string;
}): Promise<Ok> {
  await api.post("/users/reset-password", payload);
  return { ok: true };
}

export default {
  requestPasswordReset,
  validateResetToken,
  performPasswordReset,
};
