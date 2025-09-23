import Badge from "./Badge";

type Props = { blocked?: boolean; className?: string };

/** תג חסימה: כן / לא */
export default function UserBlockedBadge({ blocked, className }: Props) {
  if (blocked === undefined) return <span className={className}>—</span>;
  return (
    <Badge
      on={Boolean(blocked)}
      yes="כן"
      no="לא"
      yesCls="bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
      noCls="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
      className={className}
    />
  );
}
