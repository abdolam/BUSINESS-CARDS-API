import { Upload } from "lucide-react";
import type { User } from "@/types/user";

export type CRMUser = User & {
  isBusiness?: boolean;
  isAdmin?: boolean;
  isBlocked?: boolean;
  isOnline?: boolean;
  phone?: string;
};

type Props = {
  rows: CRMUser[];
  filename?: string;
  className?: string;
  hideWhenEmpty?: boolean;
  showLabel?: boolean;
  label?: string;
};

export default function CsvButton({
  rows,
  filename = "users.csv",
  className,
  hideWhenEmpty = true,
  showLabel = false,
  label = "ייצוא",
}: Props) {
  if (hideWhenEmpty && rows.length === 0) return null;

  const handleExport = () => {
    const blob = usersToCsv(rows);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      title="ייצוא CSV"
      aria-label="ייצוא CSV"
      className={
        className ??
        "inline-flex items-center gap-1  px-2 py-1 text-emerald-700 hover:text-emerald-500 dark:text-emerald-300 dark:hover:text-emerald-100"
      }
    >
      <Upload className="w-4 h-4" />
      {showLabel && <span className="hidden sm:inline">{label}</span>}
    </button>
  );
}

/* ===== CSV internals ===== */
function usersToCsv(rows: CRMUser[]) {
  const header = ["שם מלא", 'דוא"ל', "הרשאה", "חיבור", "חסום", "טלפון"].join(
    ","
  );
  const lines = rows.map((u) =>
    [
      fullName(u),
      u.email ?? "",
      roleText(u),
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
const fullName = (u: CRMUser) =>
  `${u.name?.first ?? ""} ${u.name?.last ?? ""}`.trim();
const roleText = (u: CRMUser) =>
  u.isAdmin ? "אדמין" : u.isBusiness ? "עסקי" : "רגיל";
const esc = (v: unknown) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
