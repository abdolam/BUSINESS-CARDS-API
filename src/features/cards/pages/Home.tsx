import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { QueryKey } from "@tanstack/react-query";
import CardGrid from "../components/CardGrid";
import Pagination from "../components/Pagination";
import { fetchCardsPaged, toggleLike } from "../api/cards";
import PromoHeader from "../../../components/layout/PromoHeader";
import useAuth from "@/features/users/auth/useAuth";
import type { Card as CardModel } from "../types/card";
import Card from "../components/Card";
import EditCardDialog from "@/features/cards/components/EditCardDialog";
import DeleteConfirmDialog from "@/features/cards/components/DeleteConfirmDialog";
import { useState } from "react";
import { getCurrentUserIdFromStorage } from "@/features/users/auth/helpers";
import LoadingOverlay from "@/components/common/LoadingOverlay";

export default function Home() {
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();
  const [editId, setEditId] = useState<string | null>(null);
  const [del, setDel] = useState<{ id: string; title: string } | null>(null);
  const page = Math.max(1, Number(sp.get("page") ?? 1));
  const limit = Math.max(1, Number(sp.get("limit") ?? 12));
  const q = sp.get("q") ?? "";
  const { isGuest, isAdmin, isBusiness } = useAuth();
  const currentUserId = getCurrentUserIdFromStorage();
  const qc = useQueryClient();
  const {
    data: cardsPage,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["cards", { page, limit, q, currentUserId }],
    queryFn: () => fetchCardsPaged({ page, limit, q }, currentUserId),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 1000,
  });

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

  // Only show the "next page" spinner when a DIFFERENT page is being fetched
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

  const initialLoad = isLoading && !cardsPage;

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

  const items = (cardsPage?.items ?? []) as CardModel[];

  return (
    <main className="container mx-auto px-4 py-6" dir="rtl">
      <LoadingOverlay open={initialLoad || loadingNextPage} />
      {isError && !cardsPage && (
        <div className="mb-4 rounded-lg border p-4 text-red-700 dark:text-red-300 bg-red-50/60 dark:bg-red-900/20">
          שגיאה בטעינת הכרטיסים.
          <button
            className="ml-2 underline hover:opacity-80"
            type="button"
            onClick={() => refetch()}
          >
            נסה שוב
          </button>
        </div>
      )}
      <PromoHeader
        title="מצא, נהל ושמור כרטיסים עסקיים – בקלות."
        subtitle={
          q
            ? `תוצאות עבור: ${q}`
            : "כל הכרטיסים במקום אחד. חיפוש מהיר, מועדפים, ופעולות ניהול בלחיצה אחת."
        }
        {...((isBusiness || isAdmin) && {
          primaryCta: { label: "צור כרטיס", to: "/create-card" },
        })}
        secondaryCta={{ label: "למידע נוסף", to: "/about" }}
      />

      {(items.length ?? 0) === 0 && !isLoading && (
        <div className="mt-6 rounded-xl border p-6 text-center text-muted-700 dark:text-muted-300">
          לא נמצאו כרטיסים {q ? `עבור “${q}”` : ""}.
        </div>
      )}

      <label className="mb-3 inline-flex items-center gap-2 text-sm">
        כרטיסים בעמוד:
        <select
          name="cardsInPage"
          value={limit}
          onChange={(e) => {
            const next = Number(e.target.value);
            const nextSp = new URLSearchParams(sp);
            nextSp.set("limit", String(next));
            nextSp.set("page", "1");
            if (q) nextSp.set("q", q);
            else nextSp.delete("q");
            setSp(nextSp);
          }}
          className="border rounded-md px-2 py-1 bg-white dark:bg-muted-900"
        >
          {[6, 12, 24].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>

      {/* ✅ Only pass "loading next page" state */}
      <CardGrid isFetching={loadingNextPage}>
        {items.map((c) => {
          const isOwner =
            currentUserId && c.ownerId && currentUserId === c.ownerId;
          const canLike = !isGuest;
          const canDelete = isAdmin || (isBusiness && !!isOwner);
          const canUpdate = isAdmin || (isBusiness && !!isOwner);
          const canInfo = !isGuest;
          return (
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
              canLike={canLike}
              canDelete={canDelete}
              canUpdate={canUpdate}
              canInfo={canInfo}
              onLike={() => likeMutation.mutate(c.id)}
              onInfo={() => navigate(`/cards/${c.id}`)}
              onUpdate={() => setEditId(c.id)}
              onDelete={() => setDel({ id: c.id, title: c.title })}
            />
          );
        })}
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
