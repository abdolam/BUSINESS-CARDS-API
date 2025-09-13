import Badge from "./Badge";

type Props = {
  admin?: boolean;
  business?: boolean;
  className?: string;
};

/** תג הרשאה: רגיל / עסקי / אדמין */
export default function UserRoleBadge({ admin, business, className }: Props) {
  const yesText = admin ? "אדמין" : "עסקי";
  const yesCls = admin
    ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
    : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
  const noCls =
    "bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";

  return (
    <Badge
      on={Boolean(admin || business)}
      yes={yesText}
      no="רגיל"
      yesCls={yesCls}
      noCls={noCls}
      className={className}
    />
  );
}
