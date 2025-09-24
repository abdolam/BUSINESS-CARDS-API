import {
  useQuery,
  useMutation,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import Card from "../components/Card";
import CardGrid from "../components/CardGrid";
import { fetchCards, toggleLike } from "../api/cards";
import type { Card as UICard } from "../types/card";
import useAuth from "@/features/users/auth/useAuth";
import { getCurrentUserIdFromStorage } from "@/features/users/auth/helpers";
import {
  canDeleteCard,
  canUpdateCard,
} from "@/features/users/auth/permissions";
import PromoHeader from "@/components/layout/PromoHeader";
import { useNavigate } from "react-router-dom";
import EditCardDialog from "@/features/cards/components/EditCardDialog";
import DeleteConfirmDialog from "@/features/cards/components/DeleteConfirmDialog";
import { useState } from "react";
import LoadingOverlay from "@/components/common/LoadingOverlay";

export default function MyCardsPage() {
  const { role } = useAuth();
  const currentUserId = getCurrentUserIdFromStorage();
  const qc = useQueryClient();
  const { isAdmin, isBusiness } = useAuth();
  const navigate = useNavigate();
  const [editId, setEditId] = useState<string | null>(null);
  const [del, setDel] = useState<{ id: string; title: string } | null>(null);

  const { data: all = [], isLoading } = useQuery<UICard[]>({
    queryKey: ["my-cards", { owner: isAdmin ? "ALL" : currentUserId }],
    queryFn: () => fetchCards(isAdmin ? undefined : currentUserId),
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });
  // Only my cards
  const mine = all.filter((c) => c.ownerId && c.ownerId === currentUserId);

  type MinimalCard = {
    id: string;
    isFavorite?: boolean;
    likesCount?: number;
  };

  const isRecord = (v: unknown): v is Record<string, unknown> =>
    !!v && typeof v === "object";

  const hasStringId = (v: unknown): v is { id: string } =>
    isRecord(v) && typeof v.id === "string";

  const toggleOne = <T extends MinimalCard>(item: T): T => {
    const wasFav = Boolean(item.isFavorite);
    const nextLikes = Math.max(0, (item.likesCount ?? 0) + (wasFav ? -1 : 1));
    return { ...item, isFavorite: !wasFav, likesCount: nextLikes };
  };

  // ✅ Optimistic like/unlike across ["my-cards"] AND ["cards"] caches
  const likeMutation = useMutation<
    void,
    unknown,
    string,
    { snapshots: Array<[QueryKey, unknown]> }
  >({
    mutationFn: (cardId: string) => toggleLike(cardId),

    onMutate: async (cardId) => {
      // Cancel both, since we’ll optimistically update both
      await qc.cancelQueries({ queryKey: ["my-cards"] });
      await qc.cancelQueries({ queryKey: ["cards"] });

      // Gather snapshots for revert on error
      const snapshots: Array<[QueryKey, unknown]> = [
        ...qc.getQueriesData({ queryKey: ["my-cards"] }),
        ...qc.getQueriesData({ queryKey: ["cards"] }),
      ];

      // Apply optimistic toggle to each cache shape
      snapshots.forEach(([key, data]) => {
        if (data == null) return;

        // Shape A: flat array: UICard[]
        if (Array.isArray(data)) {
          const arr = data as unknown[];
          const next = arr.map((item) =>
            hasStringId(item) && item.id === cardId
              ? toggleOne(item as MinimalCard)
              : item
          );
          qc.setQueryData(key, next);
          return;
        }

        // Shape B: paged object: { items: UICard[], ... }
        if (
          isRecord(data) &&
          Array.isArray((data as Record<string, unknown>).items)
        ) {
          const rec = data as Record<string, unknown>;
          const items = rec.items as unknown[];
          const nextItems = items.map((item) =>
            hasStringId(item) && item.id === cardId
              ? toggleOne(item as MinimalCard)
              : item
          );
          qc.setQueryData(key, { ...rec, items: nextItems });
        }
      });

      return { snapshots };
    },

    onError: (_err, cardId, ctx) => {
      // Revert everything
      ctx?.snapshots?.forEach(([key, data]) => {
        qc.setQueryData(key, data);
      });
      // keep TS/ESLint happy without logs:
      void cardId;
    },

    onSettled: () => {
      // Final truth from server
      qc.invalidateQueries({ queryKey: ["my-cards"] });
      qc.invalidateQueries({ queryKey: ["cards"] });
      qc.invalidateQueries({ queryKey: ["cards-paged"] });
    },
  });

  return (
    <main className="container mx-auto px-4 py-6" dir="rtl">
      <LoadingOverlay open={isLoading} />
      <PromoHeader
        title="הכרטיסים שלי"
        {...((isBusiness || isAdmin) && {
          primaryCta: { label: "צור כרטיס", to: "/create-card" },
        })}
      />
      {mine.length === 0 && !isLoading && (
        <div className="rounded-lg border p-4 text-muted-600 dark:text-muted-300 text-center">
          אין לך עדיין כרטיסים.
        </div>
      )}

      {/* No “next page” spinner here */}
      <CardGrid isFetching={false}>
        {mine.map((c) => (
          <Card
            key={c.id}
            image={c.imageUrl}
            imageAlt={c.imageAlt}
            title={c.title}
            subtitle={c.subtitle}
            phone={c.phone}
            addressText={c.addressText}
            bizNumber={c.bizNumber}
            likesCount={c.likesCount}
            canLike
            isFavorite={Boolean(c.isFavorite)}
            canUpdate={canUpdateCard(role, {
              ownerId: c.ownerId,
              currentUserId,
            })}
            canDelete={canDeleteCard(role, {
              ownerId: c.ownerId,
              currentUserId,
            })}
            canInfo
            onLike={() => likeMutation.mutate(c.id)}
            onInfo={() => navigate(`/cards/${c.id}`)}
            onUpdate={() => setEditId(c.id)}
            onDelete={() => setDel({ id: c.id, title: c.title })}
          />
        ))}
      </CardGrid>

      <EditCardDialog
        open={!!editId}
        cardId={editId}
        onClose={() => setEditId(null)}
      />
      <DeleteConfirmDialog
        open={!!del}
        cardId={del?.id ?? null}
        cardTitle={del?.title}
        onClose={() => setDel(null)}
      />
    </main>
  );
}
