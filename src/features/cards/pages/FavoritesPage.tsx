import { useSearchParams, useNavigate } from "react-router-dom";
import {
  useQuery,
  useMutation,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { useState } from "react";
import PromoHeader from "@/components/layout/PromoHeader";
import CardGrid from "@/features/cards/components/CardGrid";
import Pagination from "@/features/cards/components/Pagination";
import Card from "@/features/cards/components/Card";
import EditCardDialog from "@/features/cards/components/EditCardDialog";
import DeleteConfirmDialog from "@/features/cards/components/DeleteConfirmDialog";
import type { Card as UICard } from "@/features/cards/types/card";
import { getCurrentUserIdFromStorage } from "@/features/users/auth/helpers";
import useAuth from "@/features/users/auth/useAuth";
import {
  canDeleteCard,
  canUpdateCard,
} from "@/features/users/auth/permissions";
import { fetchCards, toggleLike } from "../api/cards";
import LoadingOverlay from "@/components/common/LoadingOverlay";

export default function FavoritesPage() {
  const [sp, setSp] = useSearchParams();
  const { role } = useAuth();
  const [editId, setEditId] = useState<string | null>(null);
  const [del, setDel] = useState<{ id: string; title: string } | null>(null);
  const page = Math.max(1, Number(sp.get("page") ?? 1));
  const limit = Math.max(1, Number(sp.get("limit") ?? 12));
  const qc = useQueryClient();
  const currentUserId = getCurrentUserIdFromStorage();
  const navigate = useNavigate();

  const {
    data: allCards = [],
    isLoading,
    isFetching,
  } = useQuery<UICard[]>({
    queryKey: ["cards", { currentUserId }],
    queryFn: () => fetchCards(currentUserId),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
  });

  const favCards = allCards.filter((c) => c.isFavorite);
  const total = favCards.length;
  const start = (page - 1) * limit;
  const items = favCards.slice(start, start + limit);
  const hasMore = page * limit < total;
  const likeMutation = useMutation<
    void,
    unknown,
    string,
    {
      snapshots: Array<[QueryKey, unknown]>;
    }
  >({
    mutationFn: (cardId: string) => toggleLike(cardId),

    onMutate: async (cardId) => {
      await qc.cancelQueries({ queryKey: ["cards"] });

      type MinimalCard = {
        id: string;
        isFavorite?: boolean;
        likesCount?: number;
      };

      const asRecord = (v: unknown): Record<string, unknown> | undefined =>
        v && typeof v === "object" ? (v as Record<string, unknown>) : undefined;

      const hasStringId = (v: unknown): v is { id: string } => {
        if (!v || typeof v !== "object") return false;
        const id = (v as Record<string, unknown>).id;
        return typeof id === "string";
      };

      const toggleOne = <T extends MinimalCard>(item: T): T => {
        const wasFav = Boolean(item.isFavorite);
        const nextLikes = Math.max(
          0,
          (item.likesCount ?? 0) + (wasFav ? -1 : 1)
        );
        return { ...item, isFavorite: !wasFav, likesCount: nextLikes };
      };

      const snapshots = qc.getQueriesData({ queryKey: ["cards"] });

      snapshots.forEach(([key, data]) => {
        if (data == null) return;

        // Case A: flat array cache: Card[]
        if (Array.isArray(data)) {
          const arr = data as unknown[];
          const next = arr.map((item) =>
            hasStringId(item) && (item as { id: string }).id === cardId
              ? toggleOne(item as MinimalCard)
              : item
          );
          qc.setQueryData(key, next);
          return;
        }

        // Case B: paged cache: { items: Card[], ... }
        const rec = asRecord(data);
        const items =
          rec && Array.isArray(rec.items)
            ? (rec.items as unknown[])
            : undefined;
        if (rec && items) {
          const nextItems = items.map((item) =>
            hasStringId(item) && (item as { id: string }).id === cardId
              ? toggleOne(item as MinimalCard)
              : item
          );
          qc.setQueryData(key, {
            ...(rec as Record<string, unknown>),
            items: nextItems,
          });
        }
      });

      return { snapshots };
    },

    onError: (_err, cardId, ctx) => {
      // Revert snapshots
      ctx?.snapshots?.forEach(([key, data]) => {
        qc.setQueryData(key, data);
      });
      // Harmless usage to satisfy noUnusedParameters without `void` or `console`:
      if (typeof cardId === "string" && cardId.length < 0) {
        // no-op
      }
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["cards"] });
      qc.invalidateQueries({ queryKey: ["cards-paged"] });
      qc.invalidateQueries({ queryKey: ["my-cards"] });
    },
  });

  const onPageChange = (next: number) => {
    const nextSp = new URLSearchParams(sp);
    nextSp.set("page", String(next));
    nextSp.set("limit", String(limit));
    setSp(nextSp);
  };

  return (
    <main className="container mx-auto px-4 py-6" dir="rtl">
      <LoadingOverlay
        open={isLoading || (isFetching && allCards.length === 0)}
      />

      <PromoHeader
        title="המועדפים שלי"
        subtitle="כאן מופיעים הכרטיסים שסימנת כמועדפים."
      />

      {total === 0 && !isLoading && (
        <div className="mt-6 rounded-xl border p-6 text-center text-muted-700 dark:text-muted-300">
          אין כרטיסים במועדפים עדיין.
        </div>
      )}

      <CardGrid isFetching={false}>
        {items.map((c) => (
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
            isFavorite={Boolean(c.isFavorite)}
            canLike
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

      <Pagination
        className="mb-10"
        page={page}
        limit={limit}
        total={total}
        hasMore={hasMore}
        onPageChange={onPageChange}
        isLoadingPage={false}
      />

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
