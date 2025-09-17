import { useCallback } from "react";
import { FormProvider, useForm } from "react-hook-form";
import Joi from "joi";
import { joiResolver } from "@hookform/resolvers/joi";
import { useMutation } from "@tanstack/react-query";
import { useToast, DEFAULT_DURATION } from "@/components/feedback/toastContext";
import PasswordFields from "@/components/forms/fields/PasswordFields";
import { ActionsBar } from "@/components/forms";
import { changePassword, signOut } from "@/features/users/services/userService";
import { useNavigate } from "react-router-dom";

type Props = { userId: string; onDone?: () => void };

type FormVals = {
  password: string;
  confirmPassword: string;
};

const schema = Joi.object<FormVals>({
  password: Joi.string().min(8).max(128).required(),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "הסיסמאות אינן תואמות",
  }),
});

export default function ChangePasswordForm({ userId, onDone }: Props) {
  const { success, error } = useToast();
  const nav = useNavigate();
  const methods = useForm<FormVals>({
    resolver: joiResolver(schema, { abortEarly: false }),
    mode: "onChange",
  });

  const { handleSubmit, formState } = methods;

  const mut = useMutation({
    mutationFn: (vals: FormVals) =>
      changePassword(userId, { password: vals.password }),
    onSuccess: () => {
      success("סיסמה עודכנה בהצלחה", DEFAULT_DURATION.success);
      // logout then redirect
      signOut(); // logout
      window.setTimeout(() => {
        nav("/sign-in");
      }, 300); // redirect to signin page
    },
    onError: () => error("עדכון הסיסמה נכשל", DEFAULT_DURATION.error),
  });

  const onSubmit = useCallback((vals: FormVals) => mut.mutate(vals), [mut]);

  return (
    <FormProvider {...methods}>
      <form
        className="space-y-4"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        dir="rtl"
      >
        <PasswordFields />
        <ActionsBar
          submitting={mut.isPending}
          canSubmit
          isValid={formState.isValid}
          isSubmitting={formState.isSubmitting}
          onCancel={onDone}
          submitLabel="עדכן סיסמה"
        />
      </form>
    </FormProvider>
  );
}
