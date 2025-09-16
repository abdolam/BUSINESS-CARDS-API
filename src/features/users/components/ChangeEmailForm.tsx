import React, { useCallback } from "react";
import { FormProvider, useForm } from "react-hook-form";
import Joi from "joi";
import { joiResolver } from "@hookform/resolvers/joi";
import { useMutation } from "@tanstack/react-query";
import { ActionsBar } from "@/components/forms";
import { useToast, DEFAULT_DURATION } from "@/components/feedback/toastContext";
import {
  getUserById,
  signOut,
  updateUser,
} from "@/features/users/services/userService";
import { useNavigate } from "react-router-dom";

type Props = { userId: string; currentEmail: string; onDone?: () => void };

type FormVals = { email: string };

const schema = Joi.object<FormVals>({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
});

export default function ChangeEmailForm({
  userId,
  currentEmail,
  onDone,
}: Props) {
  const { success, error } = useToast();
  const nav = useNavigate();
  const methods = useForm<FormVals>({
    resolver: joiResolver(schema, { abortEarly: false }),
    mode: "onChange",
    defaultValues: { email: currentEmail },
  });

  const { handleSubmit, register, formState } = methods;

  const mut = useMutation({
    mutationFn: async (vals: FormVals) => {
      // Rely on server to enforce uniqueness (expect 409 for conflict)
      updateUser(userId, { email: vals.email });
      const me = await getUserById(userId);
      const payload = {
        name: {
          first: me.name.first,
          middle: me.name.middle ?? "",
          last: me.name.last,
        },
        phone: me.phone,
        email: vals.email, // ← new email
        image: {
          url: me.image?.url ?? "",
          alt: me.image?.alt ?? "",
        },
        address: {
          state: me.address?.state ?? "",
          country: me.address?.country ?? "",
          city: me.address?.city ?? "",
          street: me.address?.street ?? "",
          houseNumber: Number(me.address?.houseNumber ?? 1),
          zip:
            typeof me.address?.zip === "number"
              ? me.address.zip
              : parseInt(String(me.address?.zip ?? ""), 10) || undefined,
        },
      } as const;
      return updateUser(userId, payload);
    },
    onSuccess: () => {
      success("דוא״ל עודכן בהצלחה", DEFAULT_DURATION.success);
      signOut();
      window.setTimeout(() => {
        // fix: your route is /sign-in (hyphen)
        nav("/sign-in");
      }, 300);
    },
    onError: (e: unknown) => {
      const msg =
        (e as { response?: { status?: number } })?.response?.status === 409
          ? "דוא״ל זה כבר קיים במערכת"
          : "עדכון הדוא״ל נכשל";
      error(msg, DEFAULT_DURATION.error);
    },
  });

  const onSubmit = useCallback((vals: FormVals) => mut.mutate(vals), [mut]);

  return (
    <FormProvider {...methods}>
      <form
        className="space-y-4 max-w-full"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        dir="rtl"
      >
        <div>
          <label htmlFor="email" className="u-label">
            דוא״ל חדש *
          </label>
          <input
            id="email"
            type="email"
            dir="ltr"
            className="u-input"
            aria-invalid={formState.errors?.email ? true : undefined}
            {...register("email")}
          />
          {formState.errors?.email && (
            <p role="alert" className="text-red-600 text-xs mt-1">
              {String(formState.errors.email.message)}
            </p>
          )}
          <p className="text-xs mt-1 text-gray-500">
            בעתיד נדרוש אימות באמצעות קישור בדוא״ל.
          </p>
        </div>

        <ActionsBar
          submitting={mut.isPending}
          canSubmit
          isValid={formState.isValid}
          isSubmitting={formState.isSubmitting}
          onCancel={onDone}
          submitLabel="עדכן דוא״ל"
        />
      </form>
    </FormProvider>
  );
}
