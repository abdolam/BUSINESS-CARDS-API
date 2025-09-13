import type { User } from "@/types/user";

export type CRMUser = User & {
  isBusiness?: boolean;
  isAdmin?: boolean;
  isBlocked?: boolean;
  isOnline?: boolean;
  phone?: string;
};

const esc = (v: unknown) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const role = (u: CRMUser) =>
  u.isAdmin ? "אדמין" : u.isBusiness ? "עסקי" : "משתמש";

/** יוצר Blob של CSV עם BOM לעברית */
export function usersToCsv(rows: CRMUser[]) {
  const header = ["שם מלא", 'דוא"ל', "הרשאה", "חיבור", "חסום", "טלפון"].join(
    ","
  );
  const lines = rows.map((u) =>
    [
      `${u.name?.first ?? ""} ${u.name?.last ?? ""}`.trim(),
      u.email ?? "",
      role(u),
      u.isOnline ? "מחובר" : "מנותק",
      u.isBlocked ? "כן" : "לא",
      u.phone ?? "",
    ]
      .map(esc)
      .join(",")
  );
  return new Blob(["\uFEFF", header, "\n", lines.join("\n")], {
    type: "text/csv;charset=utf-8",
  });
}
