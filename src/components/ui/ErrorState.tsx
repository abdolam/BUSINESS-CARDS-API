import Brand from "@/components/common/Brand";
import Button from "@/components/common/Button";
import LinkButton from "@/components/common/LinkButton";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";

type Props = {
  /** Dynamic message from caller (fallbacks are provided) */
  message?: string;
  /** Optional title above the message */
  title?: string;
  /** Optional retry callback; defaults to reload */
  onRetry?: () => void;
};

export default function ErrorState({
  message,
  title = "שגיאה",
  onRetry,
}: Props) {
  const fallback =
    typeof navigator !== "undefined" && !navigator.onLine
      ? "אין חיבור לאינטרנט. נסה שוב לאחר שתתחבר."
      : "השירות אינו זמין כרגע. נסה שוב מאוחר יותר.";

  const msg = message?.trim() || fallback;

  return (
    <main
      className="min-h-[60vh] flex items-center justify-center px-4"
      dir="rtl"
      aria-live="polite"
    >
      <div className="w-full max-w-xl text-center">
        {/* Logo + Brand */}
        <div className="flex flex-col items-center gap-3 mb-6">
          <img
            src="/logo.svg"
            alt=""
            className="w-16 h-16 rounded-md shadow-sm"
          />
          <div className="text-2xl font-bold text-muted-900 dark:text-white">
            <Brand />
          </div>
        </div>

        {/* Message */}
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900 p-4 flex items-start gap-3 text-right">
          <AlertCircle
            className="w-5 h-5 text-red-500 shrink-0 mt-0.5"
            aria-hidden
          />
          <div>
            <h2 className="font-semibold mb-1">{title}</h2>
            <p className="text-sm opacity-90">{msg}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="soft"
            className="h-10 px-4 rounded-full"
            onClick={onRetry ?? (() => location.reload())}
          >
            <RefreshCcw className="w-4 h-4" />
            <span className="ml-2">נסה שוב</span>
          </Button>
          <LinkButton to="/" variant="soft" className="h-10 px-4 rounded-full">
            <Home className="w-4 h-4" />
            <span className="ml-2">לדף הבית</span>
          </LinkButton>
        </div>
      </div>
    </main>
  );
}
