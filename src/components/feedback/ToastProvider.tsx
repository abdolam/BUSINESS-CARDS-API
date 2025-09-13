import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, Info, AlertTriangle } from "lucide-react";
import {
  Toast,
  ToastContext,
  ToastVariant,
  DEFAULT_DURATION,
} from "./toastContext";

export default function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(1);

  const remove = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const show = useCallback(
    (
      message: string,
      opts?: Partial<{ variant: ToastVariant; duration: number }>
    ) => {
      const id = idRef.current++;
      const variant = opts?.variant ?? "info";
      const duration = opts?.duration ?? DEFAULT_DURATION[variant];
      setToasts((t) => [...t, { id, message, variant, duration }]);
      // <-- no global setTimeout here; ToastItem controls its own timer
    },
    []
  );

  const api = useMemo(
    () => ({
      show,
      success: (m: string, d?: number) =>
        show(m, { variant: "success", duration: d }),
      error: (m: string, d?: number) =>
        show(m, { variant: "error", duration: d }),
      info: (m: string, d?: number) =>
        show(m, { variant: "info", duration: d }),
    }),
    [show]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {createPortal(
        <div
          dir="rtl"
          className="fixed z-[1100] bottom-4 right-4 flex flex-col gap-2"
          aria-live="polite"
          aria-atomic="true"
        >
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const variants: Record<
    ToastVariant,
    { icon: React.ElementType; classes: string }
  > = {
    success: { icon: CheckCircle2, classes: "bg-emerald-600 text-white" },
    error: { icon: AlertTriangle, classes: "bg-rose-600 text-white" },
    info: { icon: Info, classes: "bg-slate-800 text-white" },
  };
  const V = variants[toast.variant];

  const timerRef = useRef<number | null>(null);
  const remainingRef = useRef(toast.duration);
  const startRef = useRef<number>(Date.now());

  useEffect(() => {
    startRef.current = Date.now();
    remainingRef.current = toast.duration;

    timerRef.current = window.setTimeout(onClose, remainingRef.current);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [toast.duration, onClose]);

  const onMouseEnter = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
      const elapsed = Date.now() - startRef.current;
      remainingRef.current = Math.max(0, remainingRef.current - elapsed);
    }
  };

  const onMouseLeave = () => {
    startRef.current = Date.now();
    timerRef.current = window.setTimeout(onClose, remainingRef.current);
  };

  return (
    <div
      role="status"
      className={`u-fade-in-up rounded-lg shadow-lg px-3 py-4 min-w-[260px] max-w-[90vw] ${V.classes}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex items-start gap-2">
        <V.icon className="w-5 h-5 mx-3 shrink-0" aria-hidden="true" />
        <div className="text-pretty leading-5">{toast.message}</div>
      </div>
    </div>
  );
}
