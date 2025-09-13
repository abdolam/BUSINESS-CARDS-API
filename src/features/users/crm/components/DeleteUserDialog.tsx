import { useEffect, useRef, useState } from "react";

type Props = {
  open: boolean;
  userEmail: string;
  onClose: () => void;
  onVerifyPassword: (password: string) => Promise<boolean>;
  onConfirmDelete: () => Promise<void>;
};

export default function DeleteUserDialog({
  open,
  userEmail,
  onClose,
  onVerifyPassword,
  onConfirmDelete,
}: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [emailInput, setEmailInput] = useState("");
  const [pwd, setPwd] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const firstFieldRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setEmailInput("");
    setPwd("");
    setErr(null);
    const t = setTimeout(() => firstFieldRef.current?.focus(), 40);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[1200] grid place-items-center"
      dir="rtl"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-[1201] w-[95vw] max-w-md rounded-xl bg-white dark:bg-muted-900 border border-muted-200 dark:border-muted-700 shadow-xl p-0">
        <header className="px-5 pt-5">
          <h2 className="text-lg font-semibold">אישור מחיקת משתמש</h2>
          <p className="text-sm text-muted-600 dark:text-muted-300 mt-1">
            הפעולה בלתי הפיכה ודורשת אימות כפול.
          </p>
        </header>

        <div className="px-5 py-4">
          {step === 1 ? (
            <div className="space-y-3">
              <p className="text-sm">
                הקלד/י את כתובת הדוא״ל של המשתמש{" "}
                <span className="font-semibold">{userEmail}</span> כדי לאשר.
              </p>
              <input
                ref={firstFieldRef}
                dir="ltr"
                className="u-input"
                placeholder="example@domain.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
              />
              {err && <p className="text-xs text-rose-600">{err}</p>}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm">לאימות נוסף, הזן/י סיסמת אדמין:</p>
              <input
                ref={firstFieldRef}
                type="password"
                className="u-input"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                placeholder="********"
              />
              {err && <p className="text-xs text-rose-600">{err}</p>}
            </div>
          )}
        </div>

        <footer className="px-5 pb-5 flex gap-2 justify-start">
          <button
            type="button"
            className="u-btn u-btn-cancel"
            onClick={onClose}
            disabled={busy}
          >
            ביטול
          </button>

          {step === 1 ? (
            <button
              type="button"
              className="u-btn u-btn-submit"
              disabled={busy}
              onClick={() => {
                setErr(null);
                if (
                  emailInput.trim().toLowerCase() !== userEmail.toLowerCase()
                ) {
                  setErr("האימייל שהוזן אינו תואם.");
                  return;
                }
                setStep(2);
                setTimeout(() => firstFieldRef.current?.focus(), 40);
              }}
            >
              המשך
            </button>
          ) : (
            <button
              type="button"
              className="u-btn u-btn-submit"
              disabled={busy || !pwd}
              onClick={async () => {
                setErr(null);
                setBusy(true);
                try {
                  const ok = await onVerifyPassword(pwd);
                  if (!ok) {
                    setErr("סיסמה שגויה.");
                    setBusy(false);
                    return;
                  }
                  await onConfirmDelete();
                  onClose();
                } catch {
                  setErr("אירעה שגיאה. נסה/י שוב.");
                } finally {
                  setBusy(false);
                }
              }}
            >
              מחק לצמיתות
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
