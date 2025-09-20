import React, { useEffect, useRef, useState } from "react";
import Button from "@/components/common/Button";

type Props = {
  pending: boolean;
  onConfirmDelete: () => void;
};

export default function DeleteAccountSection({
  pending,
  onConfirmDelete,
}: Props) {
  const [confirm, setConfirm] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const canDelete = confirm === "DELETE" && !pending;

  // Focus the cancel button when dialog opens
  const cancelRef = useRef<HTMLButtonElement | null>(null);
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
        מחיקת החשבון תסיר לצמיתות את כל הנתונים המשויכים אליך: כרטיסים שיצרת,
        מועדפים/לייקים, ופרטי הפרופיל. לא ניתן לשחזר לאחר מחיקה.
      </p>
      <p className="text-xs text-muted-600 dark:text-muted-400">
        לאחר המחיקה תתבצע יציאה מהמערכת והפניה לעמוד הבית.
      </p>

      <label className="u-label" htmlFor="deleteConfirm">
        כדי להמשיך, הקלד/י: <strong>DELETE</strong>
      </label>
      <input
        id="deleteConfirm"
        className="u-input max-w-xs"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        aria-describedby="delete-help"
      />
      <p
        id="delete-help"
        className="text-xs text-muted-600 dark:text-muted-400"
      >
        יש להקליד בדיוק את המילה DELETE באנגלית.
      </p>

      <div className="pt-1">
        <Button
          type="button"
          variant="danger"
          className="u-btn u-btn-danger"
          onClick={() => setShowConfirm(true)}
          disabled={!canDelete}
          aria-disabled={!canDelete || undefined}
          aria-haspopup="dialog"
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
              האם את/ה בטוח/ה שברצונך למחוק את החשבון וכל הנתונים המשויכים אליו?
              פעולה זו אינה הפיכה. לאחר המחיקה תתבצע יציאה מהמערכת והפניה לעמוד
              הבית.
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
                onClick={onConfirmDelete}
                disabled={pending}
                aria-disabled={pending || undefined}
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
