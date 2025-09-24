export type PersonalTab =
  | "info"
  /*   | "email"
  | "password" */
  | "address"
  | "upgrade"
  | "delete";

type TabDef = {
  key: PersonalTab;
  label: string;
  disabled?: boolean;
  hidden?: boolean;
};

type Props = {
  value: PersonalTab;
  onChange: (tab: PersonalTab) => void;
  tabs?: TabDef[]; // optional custom tabs
};

const DEFAULT_TABS: TabDef[] = [
  { key: "info", label: "פרטים אישיים" },
  { key: "address", label: "כתובת" },
  { key: "upgrade", label: "סוג חשבון" },
  { key: "delete", label: "מחיקת חשבון" },
];

export default function PersonalAreaNav({ value, onChange, tabs }: Props) {
  const TABS = (tabs ?? DEFAULT_TABS).filter((t) => !t.hidden);

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
            onClick={() => !t.disabled && onChange(t.key)}
            disabled={t.disabled}
            className={`flex-auto px-3 py-2 text-sm rounded-md border focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
              ${
                selected
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-transparent text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              } ${t.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            role="tab"
            aria-selected={selected}
            aria-disabled={t.disabled || undefined}
          >
            {t.label}
          </button>
        );
      })}
    </nav>
  );
}
