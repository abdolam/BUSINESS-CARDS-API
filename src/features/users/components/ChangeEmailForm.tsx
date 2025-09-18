import { useCallback } from "react";
import { FormProvider, useForm } from "react-hook-form";
import Joi from "joi";
import { joiResolver } from "@hookform/resolvers/joi";
import { useMutation } from "@tanstack/react-query";
import { ActionsBar } from "@/components/forms";
import { useToast, DEFAULT_DURATION } from "@/components/feedback/toastContext";
import { changeEmail, signOut } from "@/features/users/services/userService";
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
    mutationFn: async (vals: FormVals) => changeEmail(userId, vals.email),
    onSuccess: () => {
      success("דוא״ל עודכן בהצלחה", DEFAULT_DURATION.success);
      signOut();
      window.setTimeout(() => {
        nav("/sign-in"); // correct route
      }, 300);
    },
    onError: (e: unknown) => {
      const status = (e as { response?: { status?: number } })?.response
        ?.status;
      const msg =
        status === 409 ? "דוא״ל זה כבר קיים במערכת" : "עדכון הדוא״ל נכשל";
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
