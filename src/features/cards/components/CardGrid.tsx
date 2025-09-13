import { type ReactNode } from "react";
import clsx from "clsx";

type CardGridProps = {
  children: ReactNode;
  className?: string;

  isFetching?: boolean;
};

export default function CardGrid({
  children,
  className,
  isFetching = false,
}: CardGridProps) {
  return (
    <section
      className={clsx("relative", className)}
      aria-busy={isFetching || undefined}
      aria-live="polite"
      dir="rtl"
    >
      {isFetching && (
        <div className="mb-3 text-center text-xs text-muted-600 dark:text-muted-400">
          טוען עמוד נוסף…
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {children}
      </div>
    </section>
  );
}
