import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { X, Search } from "lucide-react";
import Button, { SearchBoxIcon } from "../common/Button";

type SearchBoxProps = {
  /** Optional: close the popover/drawer after navigating */
  onClose?: () => void;
  /** Optional: start opened with this query (falls back to current ?q=…) */
  initialQuery?: string;
  /** Optional: force RTL/LTR (defaults to page direction) */
  dir?: "rtl" | "ltr" | "auto";
  className?: string;
};

/**
 * Small, reusable search input that navigates to `/search?q=...`
 * - Press Enter or click the button to navigate
 * - Esc clears or closes (if onClose provided)
 * - Syncs with current ?q= from URL when mounted
 */
export default function SearchBox({
  onClose,
  initialQuery,
  dir = "rtl",
  className,
}: SearchBoxProps) {
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const [q, setQ] = useState(
    initialQuery ?? (sp.get("q") ? String(sp.get("q")) : "")
  );
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const normalizeInput = (input: string) =>
    input
      .split(/[,\s]+/g)
      .map((s) => s.trim().replace(/[.,;:!?،]+$/u, "")) // strip trailing punctuation
      .filter(Boolean)
      .join(" ");

  const go = () => {
    const term = normalizeInput(q);
    const params = new URLSearchParams();
    if (term) params.set("q", term);
    params.set("page", "1");
    params.set("limit", "12");
    navigate(`/search?${params.toString()}`);
    onClose?.();
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      go();
    } else if (e.key === "Escape") {
      if (q) setQ("");
      else onClose?.();
    }
  };

  return (
    <div
      dir={dir}
      className={
        className ??
        "border border-primary-300 flex items-center gap-2 rounded-full" +
          " dark:border-muted-700 bg-white dark:bg-muted-800 px-3 py-1.5 shadow-sm"
      }
      role="search"
      aria-label="חיפוש כרטיסים"
    >
      <input
        ref={inputRef}
        type="text"
        inputMode="search"
        placeholder="חפש כרטיס לפי שם, תיאור, כתובת או טלפון…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={onKeyDown}
        className="w-56 xl:w-72 bg-transparent outline-none text-sm text-muted-900 dark:text-white placeholder:text-muted-400"
        aria-label="שדה חיפוש"
      />
      {q && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 rounded-full"
          aria-label="נקה חיפוש"
          title="נקה"
          onClick={() => setQ("")}
        >
          <X className="w-4 h-4" />
        </Button>
      )}
      <SearchBoxIcon aria-label="חפש" title="חפש" onClick={go}>
        <Search className="h-5 w-5 p-0" />
      </SearchBoxIcon>
    </div>
  );
}
