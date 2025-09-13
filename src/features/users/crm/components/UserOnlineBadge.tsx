import Badge from "./Badge";

type Props = { online?: boolean; className?: string };

/** תג חיבור: מחובר / מנותק */
export default function UserOnlineBadge({ online, className }: Props) {
  return (
    <Badge
      on={Boolean(online)}
      yes="מחובר"
      no="מנותק"
      yesCls="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
      noCls="bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
      className={className}
    />
  );
}
