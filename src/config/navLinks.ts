import type { Role } from "@/types/roles";

export type NavItem = { to: string; label: string };

/** Role → links mapping used across header/footer */
const ROLE_LINKS: Record<Role, NavItem[]> = {
  guest: [
    { to: "/", label: "דף הבית" },
    { to: "/login", label: "כניסה" },
    { to: "/register", label: "הרשמה" },
    { to: "/about", label: "אודות" },
  ],
  user: [
    { to: "/", label: "דף הבית" },
    { to: "/me", label: "אזור אישי" },
    { to: "/favorites", label: "מועדפים" },
    { to: "/about", label: "אודות" },
  ],
  business: [
    { to: "/", label: "דף הבית" },
    { to: "/me", label: "אזור אישי" },
    { to: "/create-card", label: "צור כרטיס" },
    { to: "/favorites", label: "מועדפים" },
    { to: "/my-cards", label: "כרטיסים שלי" },
    { to: "/about", label: "אודות" },
  ],
  admin: [
    { to: "/", label: "דף הבית" },
    { to: "/me", label: "אזור אישי" },
    { to: "/create-card", label: "צור כרטיס" },
    { to: "/favorites", label: "מועדפים" },
    { to: "/my-cards", label: "כרטיסים שלי" },
    { to: "/about", label: "אודות" },
    { to: "/crm", label: "CRM" }, // admin-only
  ],
};

export function linksFor(role?: Role | null): NavItem[] {
  const r: Role = role ?? "guest";
  return ROLE_LINKS[r] ?? ROLE_LINKS.guest;
}
