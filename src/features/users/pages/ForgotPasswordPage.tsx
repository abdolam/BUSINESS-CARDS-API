import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import { forgotPasswordSchema } from "../../users/validators/userSchemas";
import { requestPasswordReset } from "../../users/services/passwordResetService";
import Main from "@/components/layout/Main";
import { useNavigate } from "react-router-dom";
import Button, { FormButton } from "@/components/common/Button";
import { useToast, DEFAULT_DURATION } from "@/components/feedback/toastContext";
import { useEffect, useState } from "react";
import { useHumanVerification } from "@/features/human-verification";
import { HVSection } from "@/components/forms";

type FormValues = { email: string };

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormValues>({
    resolver: joiResolver(forgotPasswordSchema, { abortEarly: false }),
    mode: "onSubmit",
    reValidateMode: "onChange",
    criteriaMode: "firstError",
    shouldFocusError: true,
  });

  const [submitted, setSubmitted] = useState(false);

  const navigate = useNavigate();
  const { error } = useToast();
  const emailValue = watch("email", "");
  useEffect(() => {
    if (emailValue.length > 0) {
      const id = setTimeout(() => {
        trigger("email");
      }, 250);
      return () => clearTimeout(id);
    }
  }, [emailValue, trigger]);

  // Gate UX with HV, but do not send HV tokens to backend for this endpoint
  const { canSubmit, startGate } = useHumanVerification();

  const onSubmit = async ({ email }: FormValues) => {
    setSubmitted(true);
    const normalized = email.trim().toLowerCase();

    try {
      // Send only the email; backend should not reveal existence
      await requestPasswordReset({ email: normalized });

      // On any 2xx → success screen
      navigate("/forgot-password/sent", {
        replace: true,
        state: { email: normalized },
      });
    } catch (e: unknown) {
      // Treat 400/404 as success to avoid user enumeration
      const isRecord = (v: unknown): v is Record<string, unknown> =>
        typeof v === "object" && v !== null;

      const resp =
        isRecord(e) && isRecord(e["response"])
          ? (e["response"] as Record<string, unknown>)
          : undefined;

      const status =
        resp && typeof resp["status"] === "number"
          ? (resp["status"] as number)
          : undefined;

      if (status === 400 || status === 404) {
        navigate("/forgot-password/sent", {
          replace: true,
          state: { email: normalized },
        });
      } else {
        // Network/5xx or unknown: show a real error
        error("שגיאה בחיבור לשרת", DEFAULT_DURATION.error);
      }
    } finally {
      setSubmitted(false);
    }
  };

  return (
    <Main>
      <div className="max-w-md mx-auto pt-10 pb-24 md:mt-20 space-y-4">
        <h1 className="text-2xl font-semibold mb-2 text-center">שכחת סיסמה</h1>
        <p className="text-center text-sm opacity-80 mb-6">
          הזן כתובת אימייל ונשלח לך קישור לאיפוס סיסמה
        </p>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          dir="rtl"
          aria-label="שכחת סיסמה"
          noValidate
          onFocusCapture={() => startGate()}
          onMouseDownCapture={() => startGate()}
          onKeyDownCapture={() => startGate()}
        >
          <div>
            <label className="u-label" htmlFor="fp-email">
              אימייל
            </label>
            <input
              id="fp-email"
              type="email"
              dir="ltr"
              inputMode="email"
              autoComplete="email"
              className="u-input"
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? "fp-email-error" : undefined}
              {...register("email")}
            />
            {errors.email && (
              <p
                id="fp-email-error"
                role="alert"
                className="text-red-600 text-xs mt-1"
              >
                {errors.email.message as string}
              </p>
            )}
          </div>
          <div className="flex justify-center gap-6 pt-2">
            <FormButton
              type="submit"
              className=" u-btn-submit h-10 px-6 rounded-full"
              disabled={isSubmitting || submitted || !canSubmit || !isValid}
            >
              שלח קישור
            </FormButton>
            <Button
              type="button"
              className="h-10 px-6 rounded-full"
              onClick={() => navigate(-1)}
            >
              ביטול
            </Button>
          </div>
          <HVSection />
        </form>
      </div>
    </Main>
  );
}
