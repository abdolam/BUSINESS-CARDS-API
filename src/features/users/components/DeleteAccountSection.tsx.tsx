import Button from "@/components/common/Button";
import React, { useState } from "react";

type Props = {
  pending: boolean;
  onConfirmDelete: () => void;
};

export default function DeleteAccountSection({
  pending,
  onConfirmDelete,
}: Props) {
  const [confirm, setConfirm] = useState<string>("");
  const canDelete = confirm === "DELETE" && !pending;
  const handleSubmit = () => {
    if (!canDelete) return;
    if (window.confirm("למחוק את החשבון לצמיתות?")) {
      onConfirmDelete();
    }
  };

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
        מחיקת החשבון תסיר את כל הנתונים המשויכים אליך (כולל כרטיסים ולייקים).
        פעולה זו אינה הפיכה.
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
          onClick={handleSubmit}
          disabled={!canDelete}
        >
          {pending ? "מוחק…" : "מחק חשבון"}
        </Button>
      </div>
    </section>
  );
}
