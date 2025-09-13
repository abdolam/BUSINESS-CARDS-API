import React from "react";
import {
  useMutation,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { deleteCard } from "@/features/cards/api/cards";
import { useToast } from "@/components/feedback/toastContext";

type Props = {
  cardTitle?: string;
  cardId: string | null;
  open: boolean;
  onClose: () => void;
};

export default function DeleteConfirmDialog({
  cardTitle,
  cardId,
  open,
  onClose,
}: Props) {
  const qc = useQueryClient();
  const toast = useToast();

  // helpers (no `any`)
  const isRecord = (v: unknown): v is Record<string, unknown> =>
    typeof v === "object" && v !== null;

  const hasStringId = (v: unknown): v is { id: string } => {
    if (!v || typeof v !== "object") return false;
    const id = (v as Record<string, unknown>).id;
    return typeof id === "string";
  };

  const mutation = useMutation<
    void,
    unknown,
    string,
    { snapshots: Array<[QueryKey, unknown]> }
  >({
    // get the card id from mutate(arg)
    mutationFn: async (id) => {
      await deleteCard(id);
    },

    // optimistic: remove the card from all relevant caches immediately
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["cards"] });
      await qc.cancelQueries({ queryKey: ["cards-paged"] });
      await qc.cancelQueries({ queryKey: ["my-cards"] });

      const snapshots: Array<[QueryKey, unknown]> = [
        ...qc.getQueriesData({ queryKey: ["cards"] }),
        ...qc.getQueriesData({ queryKey: ["cards-paged"] }),
        ...qc.getQueriesData({ queryKey: ["my-cards"] }),
      ];

      snapshots.forEach(([key, data]) => {
        if (data == null) return;

        // Flat lists: Card[]
        if (Array.isArray(data)) {
          const next = (data as unknown[]).filter(
            (item) => !(hasStringId(item) && item.id === id)
          );
          qc.setQueryData(key, next);
          return;
        }

        // Paged lists: { items: Card[], ... }
        if (isRecord(data) && Array.isArray(data.items)) {
          const items = (data.items as unknown[]).filter(
            (item) => !(hasStringId(item) && item.id === id)
          );

          const next: Record<string, unknown> = { ...data, items };

          // best-effort counters
          if (typeof data.total === "number")
            next.total = (data.total as number) - 1;
          if (typeof data.count === "number")
            next.count = (data.count as number) - 1;

          qc.setQueryData(key, next);
        }
      });

      // also clear any detail cache for this card
      qc.setQueryData(["card", id], undefined);

      return { snapshots };
    },

    // rollback on error
    onError: (_err, _id, ctx) => {
      ctx?.snapshots.forEach(([key, data]) => qc.setQueryData(key, data));
      toast.error("מחיקה נכשלה. נסה שוב מאוחר יותר.");
    },

    // final refetch to be fully in sync with server
    onSettled: (_data, _err, id) => {
      qc.invalidateQueries({ queryKey: ["cards"] });
      qc.invalidateQueries({ queryKey: ["cards-paged"] });
      qc.invalidateQueries({ queryKey: ["my-cards"] });
      if (id) qc.removeQueries({ queryKey: ["card", id] });
    },

    onSuccess: () => {
      toast.success("הכרטיס נמחק בהצלחה");
      onClose();
    },
  });

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[1050] grid place-items-center"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="relative z-[1051] w-[90vw] max-w-md rounded-xl bg-white dark:bg-muted-900 border border-muted-200 dark:border-muted-700 p-6"
        dir="rtl"
      >
        <h2 className="text-lg font-semibold mb-3">מחיקת כרטיס</h2>
        <p className="text-sm text-muted-700 dark:text-muted-300">
          האם אתה בטוח שברצונך למחוק את הכרטיס{" "}
          {cardTitle ? `“${cardTitle}”` : ""}? פעולה זו אינה הפיכה.
        </p>
        <div className="mt-5 flex gap-2 justify-end">
          <button
            type="button"
            className="u-btn u-btn-cancel"
            onClick={onClose}
          >
            ביטול
          </button>
          <button
            type="button"
            className="u-btn u-btn-submit"
            onClick={() => cardId && mutation.mutate(cardId)}
            disabled={mutation.isPending || !cardId}
          >
            {mutation.isPending ? "מוחק…" : "מחק"}
          </button>
        </div>
      </div>
    </div>
  );
}
