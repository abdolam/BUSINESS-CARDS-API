/** App-wide role type (extend as needed) */
export type Role = "guest" | "user" | "business" | "admin";

/** Optional guard if you ever need to validate dynamic strings */
export function isRole(v: unknown): v is Role {
  return v === "guest" || v === "user" || v === "business" || v === "admin";
}

/** A sensible default if auth is unknown */
export const DEFAULT_ROLE: Role = "guest";
