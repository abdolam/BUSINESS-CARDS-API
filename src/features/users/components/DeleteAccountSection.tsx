import React, { useEffect, useRef, useState } from "react";
import Button from "@/components/common/Button";
import { useToast } from "@/components/feedback/toastContext";

type Props = {
  pending: boolean;
  onConfirmDelete: () => void;
  /** Hard-disable section (e.g., admin cannot self-delete) */
  disabled?: boolean;
  /** Optional banner + tooltip message when disabled */
  disabledReason?: string;
};

export default function DeleteAccountSection({
  pending,
  onConfirmDelete,
  disabled = false,
  disabledReason,
}: Props) {
  const { error: toastError } = useToast();
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirm, setConfirm] = useState("");
  const canConfirm = confirm.trim().toLowerCase() === "delete" && !pending;
  const cancelRef = useRef<HTMLButtonElement | null>(null); // Focus the cancel button when dialog opens

  useEffect(() => {
    if (showConfirm) cancelRef.current?.focus();
  }, [showConfirm]);

  // Close on Escape
  useEffect(() => {
    if (!showConfirm) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowConfirm(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showConfirm]);

  return (
    <section
      className="max-w-3xl mx-auto space-y-3"
      dir="rtl"
      aria-labelledby="delete-account-title"
    >
      <h2
        id="delete-account-title"
        className="text-lg font-semibold text-red-600 dark:text-red-400"
      >
        מחיקת חשבון
      </h2>

      <p className="text-sm text-muted-700 dark:text-muted-300">
        מחיקת החשבון תסיר לצמיתות את כל הנתונים המשויכים אליך: כרטיסים, מועדפים
        ופרטי הפרופיל. פעולה זו אינה ניתנת לשחזור.
      </p>
      <p className="text-xs text-muted-600 dark:text-muted-400">
        לאחר המחיקה תתבצע יציאה מהמערכת והפניה לעמוד הבית.
      </p>

      {disabled && (
        <div className="rounded-md border border-amber-300 bg-amber-50 text-amber-800 px-3 py-2 text-xs">
          {disabledReason || "פעולה זו מושבתת עבור חשבון זה."}
        </div>
      )}

      <div className="pt-1">
        <Button
          type="button"
          variant="danger"
          className="u-btn u-btn-danger"
          onClick={() => {
            if (disabled) {
              toastError(disabledReason || "אין הרשאה לבצע פעולה זו");
              return;
            }
            setShowConfirm(true);
          }}
          disabled={pending}
          aria-disabled={pending || undefined}
          aria-haspopup="dialog"
          title={disabled ? disabledReason : undefined}
        >
          מחק חשבון
        </Button>
      </div>

      {showConfirm && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center"
          aria-labelledby="confirm-delete-title"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
            onClick={() => setShowConfirm(false)}
            aria-hidden
          />

          {/* Dialog */}
          <div className="relative w-full max-w-md mx-4 rounded-xl border border-red-300 dark:border-red-700 bg-white dark:bg-muted-900 shadow-xl p-5 space-y-4">
            <h3
              id="confirm-delete-title"
              className="text-md font-semibold text-red-700 dark:text-red-300"
            >
              לאישור אחרון
            </h3>

            <p className="text-sm">
              כדי לאשר מחיקה לצמיתות, הקלד/י <strong>DELETE</strong> בשדה הבא.
              פעולה זו אינה הפיכה.
            </p>

            <label htmlFor="deleteConfirm" className="u-label">
              הקלד/י DELETE
            </label>
            <input
              id="deleteConfirm"
              className="u-input"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              dir="ltr"
            />
            <p className="text-xs text-muted-600 dark:text-muted-400">
              אותיות אינן תלויות רישיות (delete/DELETE).
            </p>

            <div className="flex justify-end gap-3 pt-1">
              <Button
                ref={cancelRef}
                type="button"
                variant="soft"
                onClick={() => setShowConfirm(false)}
              >
                ביטול
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={() => {
                  if (!canConfirm) return;
                  onConfirmDelete(); // triggers parent mutation
                  setShowConfirm(false);
                  setConfirm("");
                }}
                disabled={!canConfirm}
                aria-disabled={!canConfirm || undefined}
              >
                {pending ? "מוחק חשבון..." : "כן, מחק לצמיתות"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
