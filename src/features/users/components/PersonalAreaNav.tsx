export type PersonalTab =
  | "info"
  | "email"
  | "password"
  | "address"
  | "upgrade"
  | "delete";

type Props = {
  value: PersonalTab;
  onChange: (tab: PersonalTab) => void;
};

const TABS: { key: PersonalTab; label: string }[] = [
  { key: "info", label: "פרטים אישיים" },
  { key: "email", label: "דוא״ל" },
  { key: "password", label: "סיסמה" },
  { key: "address", label: "כתובת" },
  { key: "upgrade", label: "שדרוג חשבון" },
  { key: "delete", label: "מחיקת חשבון" },
];

export default function PersonalAreaNav({ value, onChange }: Props) {
  return (
    <nav
      className="mb-6 flex justify-between flex-wrap gap-2"
      aria-label="תפריט אזור אישי"
      dir="rtl"
    >
      {TABS.map((t) => {
        const selected = value === t.key;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            className={`flex-auto px-3 py-2 text-sm rounded-md border focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
              ${
                selected
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-transparent text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            role="tab"
            aria-selected={selected}
          >
            {t.label}
          </button>
        );
      })}
    </nav>
  );
}
