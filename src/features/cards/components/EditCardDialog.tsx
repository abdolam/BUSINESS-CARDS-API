import React, { useEffect } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { FormProvider, useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import { createCardSchema } from "@/features/cards/validators/cardSchemas";
import type {
  CreateCardDto,
  Card,
  CardsPage,
} from "@/features/cards/types/card";
import {
  fetchCardApiById,
  toCreateDtoFromApi,
  updateCard,
} from "@/features/cards/api/cards";
import {
  ActionsBar,
  ContactFields,
  ImageFields,
  AddressFields,
} from "@/components/forms";
import { withImageFallback } from "../utils/image";
import LoadingOverlay from "@/components/common/LoadingOverlay";

type Props = {
  cardId: string | null;
  open: boolean;
  onClose: () => void;
};

export default function EditCardDialog({ cardId, open, onClose }: Props) {
  const qc = useQueryClient();

  const methods = useForm<CreateCardDto>({
    resolver: joiResolver(createCardSchema, { abortEarly: false }),
    mode: "onChange",
    criteriaMode: "firstError",
  });
  const { reset, handleSubmit, formState, watch } = methods;

  const { data: cardApi, isLoading: isLoadingApi } = useQuery({
    enabled: open && !!cardId,
    queryKey: ["cardApi", cardId],
    queryFn: () => fetchCardApiById(cardId!),
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!cardApi) return;
    reset(toCreateDtoFromApi(cardApi), { keepDefaultValues: false });
  }, [cardApi, reset]);

  // Allow ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Helpers for patching caches without 'any'
  const isRecord = (v: unknown): v is Record<string, unknown> =>
    typeof v === "object" && v !== null;

  const patchArray = (arr: Card[], updated: Card): Card[] =>
    arr.map((c) => (c.id === updated.id ? { ...c, ...updated } : c));

  const patchPage = (page: CardsPage, updated: Card): CardsPage => ({
    ...page,
    items: page.items.map((c) =>
      c.id === updated.id ? { ...c, ...updated } : c
    ),
  });

  const patchAllCachesWith = (updated: Card) => {
    const patchSet = (keyPrefix: QueryKey) => {
      const snapshots = qc.getQueriesData<unknown>({ queryKey: keyPrefix });
      snapshots.forEach(([key, data]) => {
        if (Array.isArray(data)) {
          qc.setQueryData<Card[]>(key, patchArray(data as Card[], updated));
          return;
        }
        if (
          isRecord(data) &&
          Array.isArray((data as Record<string, unknown>).items)
        ) {
          qc.setQueryData<CardsPage>(
            key,
            patchPage(data as unknown as CardsPage, updated)
          );
        }
      });
    };

    patchSet(["cards"]);
    patchSet(["cards-paged"]);
    patchSet(["my-cards"]);
    qc.setQueryData<Card>(["card", updated.id], updated);
    if (cardId) qc.invalidateQueries({ queryKey: ["cardApi", cardId] });
  };

  const mutation = useMutation<Card, unknown, CreateCardDto>({
    mutationFn: async (payload: CreateCardDto) => {
      if (!cardId) throw new Error("No cardId");
      const finalUrl = await withImageFallback(payload.image?.url);
      const cleaned: CreateCardDto = {
        ...payload,
        image: { ...payload.image, url: finalUrl },
      };
      return updateCard(cardId, cleaned);
    },
    onSuccess: (updated) => {
      patchAllCachesWith(updated);
      onClose();
    },
  });

  if (!open) return null;
  const imageUrl = watch("image.url");
  const imageAlt = watch("image.alt");
  const showPreview = Boolean(imageUrl && /^https?:\/\//i.test(imageUrl));

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[1050] grid place-items-center"
    >
      <LoadingOverlay open={isLoadingApi} />
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Modal */}
      <div
        className="relative z-[1051] w-[95vw] max-w-2xl max-h-[85vh] rounded-xl bg-white dark:bg-muted-900 border border-muted-200 dark:border-muted-700 shadow-xl p-0 flex flex-col"
        dir="rtl"
      >
        <div className="px-6 pt-6">
          <h2 className="text-xl font-semibold">עריכת כרטיס</h2>
        </div>

        {isLoadingApi ? (
          /* keep layout height while overlay spins */
          <div className="flex-1" />
        ) : (
          <FormProvider {...methods}>
            <form
              onSubmit={handleSubmit((values) => mutation.mutate(values))}
              noValidate
              className="flex-1 min-h-0 flex flex-col"
            >
              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-5">
                {/* Title */}
                <div>
                  <label className="u-label" htmlFor="title">
                    כותרת *
                  </label>
                  <input
                    id="title"
                    className="u-input"
                    {...methods.register("title")}
                  />
                  {formState.errors.title && (
                    <p className="text-red-600 text-xs mt-1">
                      {String(formState.errors.title.message)}
                    </p>
                  )}
                </div>

                {/* Subtitle */}
                <div>
                  <label className="u-label" htmlFor="subtitle">
                    כותרת משנה *
                  </label>
                  <input
                    id="subtitle"
                    className="u-input"
                    {...methods.register("subtitle")}
                  />
                  {formState.errors.subtitle && (
                    <p className="text-red-600 text-xs mt-1">
                      {String(formState.errors.subtitle.message)}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="u-label" htmlFor="description">
                    תיאור *
                  </label>
                  <textarea
                    id="description"
                    className="u-input"
                    rows={3}
                    {...methods.register("description")}
                  />
                  {formState.errors.description && (
                    <p className="text-red-600 text-xs mt-1">
                      {String(formState.errors.description.message)}
                    </p>
                  )}
                </div>

                <ContactFields />
                <ImageFields />

                {/* Live image preview */}
                {showPreview && (
                  <img
                    src={imageUrl}
                    alt={imageAlt || "preview"}
                    className="mt-2 h-32 w-full object-cover rounded-md border"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display =
                        "none";
                    }}
                  />
                )}

                <AddressFields />
              </div>

              {/* Sticky actions */}
              <div className="sticky bottom-0 px-6 py-4 border-t border-muted-200 dark:border-muted-700 bg-white/90 dark:bg-muted-900/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
                <ActionsBar
                  submitting={mutation.isPending}
                  canSubmit={true}
                  isValid={methods.formState.isValid}
                  isSubmitting={methods.formState.isSubmitting}
                  onCancel={onClose}
                  submitLabel="שמור"
                  cancelLabel="ביטול"
                />
              </div>
            </form>
          </FormProvider>
        )}
      </div>
    </div>
  );
}
