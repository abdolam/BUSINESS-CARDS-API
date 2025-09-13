import clsx from "clsx";
import { BiChevronLeft, BiChevronRight, BiLoaderAlt } from "react-icons/bi";

type Props = {
  page: number;
  limit: number;
  total?: number;
  hasMore?: boolean;
  onPageChange: (p: number) => void;
  className?: string;
  maxButtons?: number;
  /** Gray-out/disable navigation while a new page is loading */
  isLoadingPage?: boolean;
};

export default function Pagination({
  page,
  limit,
  total,
  hasMore,
  onPageChange,
  className,
  maxButtons = 5,
  isLoadingPage = false,
}: Props) {
  const totalPages = total ? Math.max(1, Math.ceil(total / limit)) : undefined;
  const canPrev = page > 1 && !isLoadingPage;
  const canNext =
    (totalPages ? page < totalPages : !!hasMore) && !isLoadingPage;

  const windowPages = buildWindow(page, totalPages, maxButtons);

  return (
    <nav
      dir="rtl"
      aria-label="Pagination"
      className={clsx("mt-8 flex justify-center", className)}
    >
      <div className="inline-flex items-center gap-1 rounded-full border bg-white dark:bg-muted-900 border-muted-300 dark:border-muted-700 shadow-sm px-1 py-1">
        {/* Prev (RTL: chevron right) */}
        <button
          type="button"
          onClick={() => canPrev && onPageChange(page - 1)}
          disabled={!canPrev}
          className={btnIconClass}
          title="הקודם"
        >
          <BiChevronRight className="text-xl" />
          <span className="sr-only">הקודם</span>
        </button>

        {/* Numbers */}
        {windowPages.map((token, idx) =>
          token === "…" ? (
            <span
              key={`dots-${idx}`}
              className="px-2 text-muted-500 dark:text-muted-400 select-none"
            >
              …
            </span>
          ) : (
            <button
              key={token}
              type="button"
              onClick={() => !isLoadingPage && onPageChange(token)}
              aria-current={token === page ? "page" : undefined}
              disabled={isLoadingPage}
              className={clsx(
                "min-w-10 h-10 px-3 rounded-full text-sm font-medium transition",
                isLoadingPage && "opacity-60 cursor-not-allowed",
                token === page
                  ? "bg-primary-600 text-white shadow-sm"
                  : "text-muted-800 dark:text-muted-200 hover:bg-muted-100 dark:hover:bg-muted-800"
              )}
            >
              {token}
            </button>
          )
        )}

        {/* Next (RTL: chevron left) */}
        <button
          type="button"
          onClick={() => canNext && onPageChange(page + 1)}
          disabled={!canNext}
          className={btnIconClass}
          title="הבא"
        >
          {isLoadingPage ? (
            <BiLoaderAlt className="text-xl animate-spin" />
          ) : (
            <BiChevronLeft className="text-xl" />
          )}
          <span className="sr-only">הבא</span>
        </button>
      </div>
    </nav>
  );
}

const btnIconClass =
  "grid place-items-center h-10 w-10 rounded-full text-muted-800 dark:text-muted-200 " +
  "hover:bg-muted-100 dark:hover:bg-muted-800 " +
  "disabled:opacity-40 disabled:hover:bg-transparent " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500";

function buildWindow(
  current: number,
  total?: number,
  max = 5
): (number | "…")[] {
  if (!total) return [current];
  const pages = Math.max(1, total);
  const half = Math.floor(max / 2);

  let start = Math.max(1, current - half);
  const end = Math.min(pages, start + max - 1);
  if (end - start + 1 < max) start = Math.max(1, end - max + 1);

  const range = (a: number, b: number) =>
    Array.from({ length: b - a + 1 }, (_, i) => a + i);

  const parts: (number | "…")[] = [];
  if (start > 1) {
    parts.push(1);
    if (start > 2) parts.push("…");
  }
  parts.push(...range(start, end));
  if (end < pages) {
    if (end < pages - 1) parts.push("…");
    parts.push(pages);
  }
  return parts;
}
