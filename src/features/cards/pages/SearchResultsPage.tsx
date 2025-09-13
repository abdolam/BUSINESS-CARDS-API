import { useNavigate, useSearchParams } from "react-router-dom";
import {
  useQuery,
  useMutation,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import CardGrid from "../components/CardGrid";
import Pagination from "../components/Pagination";
import Card from "../components/Card";
import PromoHeader from "@/components/layout/PromoHeader";
import EditCardDialog from "@/features/cards/components/EditCardDialog";
import { toggleLike, fetchCardsPaged } from "@/features/cards/api/cards";
import type { Card as UICard } from "@/features/cards/types/card";
import DeleteConfirmDialog from "@/features/cards/components/DeleteConfirmDialog";
import { useState } from "react";
import { getCurrentUserIdFromStorage } from "@/features/users/auth/helpers";

export default function SearchResultsPage() {
  const currentUserId = getCurrentUserIdFromStorage();
  const [sp, setSp] = useSearchParams();
  const page = Math.max(1, Number(sp.get("page") ?? 1));
  const limit = Math.max(1, Number(sp.get("limit") ?? 12));
  const q = (sp.get("q") ?? "").trim();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [editId, setEditId] = useState<string | null>(null);
  const [del, setDel] = useState<{ id: string; title: string } | null>(null);

  const {
    data: cardsPage,
    isLoading,
    isError,
    isFetching,
  } = useQuery({
    queryKey: ["cards-paged", { page, limit, q, currentUserId }],
    queryFn: () => fetchCardsPaged({ page, limit, q }, currentUserId),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
  });

  const items: UICard[] = (cardsPage?.items ?? []) as UICard[];

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

  // ✅ Optimistic like/unlike on the paged caches this page renders from
  const likeMutation = useMutation<
    void,
    unknown,
    string,
    { snapshots: Array<[QueryKey, unknown]> }
  >({
    mutationFn: (cardId: string) => toggleLike(cardId),

    onMutate: async (cardId) => {
      await qc.cancelQueries({ queryKey: ["cards-paged"] });

      const snapshots: Array<[QueryKey, unknown]> = qc.getQueriesData({
        queryKey: ["cards-paged"],
      });

      snapshots.forEach(([key, data]) => {
        if (!isRecord(data) || !Array.isArray(data.items)) return;
        const rec = data as Record<string, unknown>;
        const itemsArr = rec.items as unknown[];
        const nextItems = itemsArr.map((item) =>
          hasStringId(item) && item.id === cardId
            ? toggleOne(item as MinimalCard)
            : item
        );
        qc.setQueryData(key, { ...rec, items: nextItems });
      });

      return { snapshots };
    },

    onError: (_err, cardId, ctx) => {
      ctx?.snapshots?.forEach(([key, data]) => {
        qc.setQueryData(key, data);
      });
      void cardId;
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["cards-paged"] }); // this view
      qc.invalidateQueries({ queryKey: ["cards"] }); // keep Home/Favorites in sync
      qc.invalidateQueries({ queryKey: ["my-cards"] }); // keep My Cards in sync
    },
  });

  // ✅ Only show “next page” spinner when a DIFFERENT page is being fetched
  const loadingNextPage = Boolean(
    isFetching && cardsPage && cardsPage.page !== page
  );

  const onPageChange = (next: number) => {
    const nextSp = new URLSearchParams(sp);
    nextSp.set("page", String(next));
    nextSp.set("limit", String(limit));
    if (q) nextSp.set("q", q);
    else nextSp.delete("q");
    setSp(nextSp);
  };

  if (isLoading && !cardsPage) {
    return (
      <main className="container mx-auto px-4 py-6">
        <div className="animate-pulse grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-64 rounded-2xl bg-muted-100 dark:bg-muted-800"
            />
          ))}
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="container mx-auto px-4 py-6">
        <div className="p-4 rounded-xl border border-red-300/60 text-red-700 dark:text-red-300 dark:border-red-500/40 bg-red-50/60 dark:bg-red-900/20">
          Failed to load search results.
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-6" dir="rtl">
      <PromoHeader
        title="תוצאות חיפוש"
        subtitle={
          q ? `מציג תוצאות עבור: “${q}”` : "חפש לפי שם, תיאור, כתובת או טלפון."
        }
      />

      {items.length === 0 && !isLoading && (
        <div className="mt-6 rounded-xl border p-6 text-center text-muted-700 dark:text-muted-300">
          לא נמצאו כרטיסים {q ? `עבור “${q}”` : ""}.
        </div>
      )}

      {/* Only show while changing pages */}
      <CardGrid isFetching={loadingNextPage}>
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
            onInfo={() => navigate(`/cards/${c.id}`)}
            onUpdate={() => setEditId(c.id)}
            onDelete={() => setDel({ id: c.id, title: c.title })}
            canInfo
            onLike={() => likeMutation.mutate(c.id)}
          />
        ))}
      </CardGrid>

      <Pagination
        className="mb-10"
        page={page}
        limit={limit}
        total={cardsPage?.total}
        hasMore={cardsPage?.hasMore}
        onPageChange={onPageChange}
        isLoadingPage={loadingNextPage}
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
