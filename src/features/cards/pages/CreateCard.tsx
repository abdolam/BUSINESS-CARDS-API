import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import { useToast, DEFAULT_DURATION } from "@/components/feedback/toastContext";
import {
  ActionsBar,
  ContactFields,
  ImageFields,
  AddressFields,
} from "@/components/forms";
import { createCard } from "../api/cards";
import type { Card, CreateCardDto } from "../types/card";
import { createCardSchema } from "../validators/cardSchemas";
import { withImageFallback } from "../utils/image";

function getStatusFromError(e: unknown): number | undefined {
  const isObj = (v: unknown): v is Record<string, unknown> =>
    typeof v === "object" && v !== null;
  if (
    isObj(e) &&
    typeof (e as Record<string, unknown>)["status"] === "number"
  ) {
    return (e as Record<string, unknown>)["status"] as number;
  }
  if (isObj(e) && isObj((e as Record<string, unknown>)["response"])) {
    const resp = (e as Record<string, unknown>)["response"] as Record<
      string,
      unknown
    >;
    if (typeof resp["status"] === "number") return resp["status"] as number;
  }
  return undefined;
}

export default function CreateCard() {
  const methods = useForm<CreateCardDto>({
    resolver: joiResolver(createCardSchema, { abortEarly: false }),
    mode: "onChange",
    reValidateMode: "onChange",
    criteriaMode: "firstError",
    shouldFocusError: true,
    defaultValues: {
      title: "",
      subtitle: "",
      description: "",
      phone: "",
      email: "",
      web: "",
      image: { url: "", alt: "" },
      address: {
        state: "",
        country: "",
        city: "",
        street: "",
        houseNumber: undefined as unknown as number,
        zip: undefined as unknown as number,
      },
    },
  });

  const {
    register,
    formState: { errors, isSubmitting, isValid },
    watch,
    handleSubmit,
  } = methods;

  const nav = useNavigate();
  const qc = useQueryClient();
  const { success, error } = useToast();

  const mutation = useMutation<Card, unknown, CreateCardDto>({
    mutationFn: async (payload) => {
      const finalUrl = await withImageFallback(payload.image?.url);
      const cleaned: CreateCardDto = {
        ...payload,
        image: { ...payload.image, url: finalUrl },
      };
      return createCard(cleaned);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cards"] });
      success("הכרטיס נוצר בהצלחה");
      setTimeout(() => nav("/my-cards"), DEFAULT_DURATION.success);
    },
    onError: (e: unknown) => {
      const status = getStatusFromError(e);
      if (status === 401 || status === 403) {
        error("אין לך הרשאה לבצע פעולה זו", DEFAULT_DURATION.error);
        return;
      }
      if (status === 400 || status === 422) {
        error("נתונים לא תקינים — בדוק את השדות", DEFAULT_DURATION.error);
        return;
      }
      error("שגיאה בחיבור לשרת", DEFAULT_DURATION.error);
    },
  });

  const onSubmit = async (values: CreateCardDto) => {
    const finalUrl = await withImageFallback(values.image?.url);
    const cleaned: CreateCardDto = {
      ...values,
      image: { ...values.image, url: finalUrl },
    };
    mutation.mutate(cleaned);
  };
  const imageUrl = watch("image.url");
  const imageAlt = watch("image.alt");
  const showPreview = Boolean(imageUrl && /^https?:\/\//i.test(imageUrl));

  return (
    <div className="flex items-center justify-center min-h-fit px-4 my-16 md:my-24">
      <motion.main
        dir="rtl"
        className="w-full max-w-3xl px-6 py-10 md:py-14 rounded-xl bg-white dark:bg-gray-900 shadow-lg"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, ease: "easeOut" }}
      >
        <h1 className="text-xl font-semibold mb-4 text-center">צור כרטיס</h1>

        <FormProvider {...methods}>
          <form
            dir="rtl"
            className="space-y-5"
            onSubmit={handleSubmit(onSubmit)}
            aria-label="טופס יצירת כרטיס"
            noValidate
          >
            {/* Title */}
            <div>
              <label className="u-label" htmlFor="title">
                כותרת *
              </label>
              <input
                id="title"
                className="u-input"
                placeholder="שם העסק"
                {...register("title")}
                aria-invalid={errors.title ? true : undefined}
                aria-describedby={errors.title ? "card-title-error" : undefined}
              />
              {errors.title && (
                <p
                  id="card-title-error"
                  role="alert"
                  className="text-red-600 text-xs mt-1"
                >
                  {String(errors.title.message)}
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
                placeholder="תיאור קצר"
                {...register("subtitle")}
                aria-invalid={errors.subtitle ? true : undefined}
                aria-describedby={
                  errors.subtitle ? "card-subtitle-error" : undefined
                }
              />
              {errors.subtitle && (
                <p
                  id="card-subtitle-error"
                  role="alert"
                  className="text-red-600 text-xs mt-1"
                >
                  {String(errors.subtitle.message)}
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
                rows={4}
                placeholder="פרטים על העסק"
                {...register("description")}
                aria-invalid={errors.description ? true : undefined}
                aria-describedby={
                  errors.description ? "card-description-error" : undefined
                }
              />
              {errors.description && (
                <p
                  id="card-description-error"
                  role="alert"
                  className="text-red-600 text-xs mt-1"
                >
                  {String(errors.description.message)}
                </p>
              )}
            </div>

            {/* Contact */}
            <ContactFields />

            {/* Web */}
            <div>
              <label className="u-label" htmlFor="web">
                אתר *
              </label>
              <input
                id="web"
                className="u-input"
                type="url"
                dir="ltr"
                inputMode="url"
                autoComplete="url"
                placeholder="https://www.example.co.il"
                {...register("web")}
                aria-invalid={errors.web ? true : undefined}
                aria-describedby={errors.web ? "card-web-error" : undefined}
              />
              {errors.web && (
                <p
                  id="card-web-error"
                  role="alert"
                  className="text-red-600 text-xs mt-1"
                >
                  {String(errors.web.message)}
                </p>
              )}
            </div>

            {/* Image + preview */}
            <ImageFields />
            {showPreview && (
              <img
                src={imageUrl}
                alt={imageAlt || "preview"}
                className="mt-2 h-32 w-full object-cover rounded-md border"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            )}

            {/* Address */}
            <AddressFields />

            {/* Actions */}
            <ActionsBar
              submitting={mutation.isPending}
              canSubmit={true}
              isValid={isValid}
              isSubmitting={isSubmitting}
              onCancel={() => nav(-1)}
              submitLabel="שמור כרטיס"
            />
          </form>
        </FormProvider>
      </motion.main>
    </div>
  );
}
