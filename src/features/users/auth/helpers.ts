import { Role } from "@/types/roles";

export const TOKEN_KEY = "token" as const;

export type JwtPayload = {
  role?: string; // raw from token (could be any string)
  isBusiness?: boolean;
  sub?: string;
  uid?: string;
  userId?: string;
  _id?: string;
  [k: string]: unknown;
};

export type AuthState = {
  token: string | null;
  payload: JwtPayload | null;
  role: Role | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isBusiness: boolean;
  isUser: boolean;
  isGuest: boolean;
};

function b64urlToUtf8(b64url: string): string {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 ? 4 - (b64.length % 4) : 0;
  const b64p = b64 + "=".repeat(pad);
  const bin = atob(b64p);
  try {
    return decodeURIComponent(
      Array.from(
        bin,
        (c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0")
      ).join("")
    );
  } catch {
    return bin;
  }
}

export function parseJwt(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    return JSON.parse(b64urlToUtf8(payload));
  } catch {
    return null;
  }
}

const KNOWN_ROLES: Role[] = ["guest", "user", "business", "admin"];

function asRole(val: unknown): Role | undefined {
  if (typeof val !== "string") return undefined;
  return KNOWN_ROLES.includes(val as Role) ? (val as Role) : undefined;
}

export function computeState(token: string | null): AuthState {
  const payload = token ? parseJwt(token) : null;

  const explicitRole = asRole(payload?.role);
  const derivedRole: Role | null =
    explicitRole ??
    (payload?.isBusiness ? "business" : undefined) ??
    (token ? "user" : null);

  const isAuthenticated = !!token;
  const isAdmin = derivedRole === "admin";
  const isBusiness = derivedRole === "business";
  const isUser = !!(isAuthenticated && !isAdmin && !isBusiness);
  const isGuest = !isAuthenticated;

  return {
    token,
    payload,
    role: derivedRole,
    isAuthenticated,
    isAdmin,
    isBusiness,
    isUser,
    isGuest,
  };
}

export function getCurrentUserIdFromStorage(): string | undefined {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return undefined;
  const pl = parseJwt(token) || undefined;
  return (pl?.uid || pl?.userId || pl?._id || pl?.sub) as string | undefined;
}
