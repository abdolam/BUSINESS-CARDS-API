import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInSchema } from "../validators/userSchemas";
import { signIn } from "../services/userService";
import type { SignInDto } from "@/types/user";
import { useAuth } from "@/features/users/auth/useAuth";
import { useToast, DEFAULT_DURATION } from "@/components/feedback/toastContext";
import { Eye, EyeOff } from "lucide-react";
import { useHumanVerification } from "@/features/human-verification/useHumanVerification";
import Button, { FormButton } from "@/components/common/Button";
import { HVSection } from "@/components/forms";

type HttpLikeError = {
  status?: number;
  response?: { status?: number; data?: { message?: string; error?: string } };
  cause?: { status?: number };
};

export default function SignInForm() {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [showPwd, setShowPwd] = useState(false);
  const { canSubmit, captchaEnabled, signals, startGate, hvToken } =
    useHumanVerification();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    setError,
    trigger,
  } = useForm<SignInDto>({
    resolver: joiResolver(signInSchema, { abortEarly: false }),
    mode: "onChange", // <-- validate as user types
    reValidateMode: "onChange",
    criteriaMode: "firstError",
    shouldFocusError: true,
  });

  const { login } = useAuth();

  const onSubmit = async (values: SignInDto) => {
    setSubmitting(true);
    try {
      type HVExtra = { hvToken?: string; turnstileToken?: string };
      const dtoWithHV: SignInDto & HVExtra = {
        ...values,
        ...(hvToken ? { hvToken } : {}),
        ...(captchaEnabled && signals?.captchaToken
          ? { turnstileToken: signals.captchaToken }
          : {}),
      };
      const token = await signIn(dtoWithHV);
      login(token);
      success("ההתחברות בוצעה בהצלחה", DEFAULT_DURATION.success);
      setTimeout(() => navigate("/"), DEFAULT_DURATION.success);
    } catch (e: unknown) {
      const err = e as HttpLikeError;
      const status =
        err.status ?? err.response?.status ?? err.cause?.status ?? 0;
      const serverMsg =
        err.response?.data?.message ?? err.response?.data?.error ?? "";
      if (status === 404) {
        // User not found
        const msg = "משתמש לא נמצא";
        error(msg, DEFAULT_DURATION.error);
        setError("email", { type: "server", message: msg });
        return;
      }
      if (
        status === 400 ||
        status === 401 ||
        status === 403 ||
        /invalid email or password/i.test(serverMsg)
      ) {
        const msg = "אימייל או סיסמה שגויים";
        error(msg, DEFAULT_DURATION.error);
        setError("email", { type: "server", message: msg });
        setError("password", { type: "server", message: msg });
        return;
      }
      // Anything else (server down / network / 5xx / unknown)
      error("שגיאה בחיבור לשרת", DEFAULT_DURATION.error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      noValidate
      dir="rtl"
      className="space-y-5"
      onSubmit={handleSubmit(onSubmit)}
      onFocusCapture={() => startGate()}
      onMouseDownCapture={() => startGate()}
      onKeyDownCapture={() => startGate()}
      aria-label="טופס כניסה"
      aria-busy={submitting || undefined}
    >
      <div>
        <label className="u-label" htmlFor="email">
          אימייל *
        </label>
        <input
          id="email"
          type="email"
          dir="ltr"
          className="u-input"
          autoComplete="email"
          {...register("email", {
            onChange: () => trigger("email"),
          })}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "email-error" : undefined}
        />

        {errors.email && (
          <p
            id="email-error"
            role="alert"
            className="text-red-600 text-xs mt-1"
          >
            {errors.email.message as string}
          </p>
        )}
      </div>

      {/* Password */}
      <label htmlFor="password" className="u-label">
        סיסמה *
      </label>
      <div className="relative">
        <input
          id="password"
          dir="ltr"
          type={showPwd ? "text" : "password"}
          className="u-input pl-10 peer" // ← peer lets the icon react to focus
          {...register("password", { onChange: () => trigger("password") })}
          autoComplete="current-password"
          aria-invalid={errors.password ? true : undefined}
          aria-describedby={errors.password ? "password-error" : undefined}
        />

        <button
          type="button"
          onClick={() => setShowPwd((v) => !v)}
          aria-label={showPwd ? "הסתר סיסמה" : "הצג סיסמה"}
          aria-pressed={showPwd}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-10
               text-slate-300 peer-focus:text-blue-600"
        >
          {showPwd ? (
            <EyeOff className="w-5 h-5" aria-hidden />
          ) : (
            <Eye className="w-5 h-5" aria-hidden />
          )}
        </button>
      </div>

      {errors.password && (
        <p
          id="password-error"
          role="alert"
          className="text-red-600 text-xs mt-1"
        >
          {errors.password.message as string}
        </p>
      )}

      <div className="flex gap-3 justify-start pt-2">
        <FormButton
          type="submit"
          disabled={!isValid || submitting || !canSubmit || isSubmitting}
          className="u-btn u-btn-submit"
        >
          {submitting ? "מתחבר…" : "כניסה"}
        </FormButton>

        <Button
          type="button"
          className="u-btn u-btn-cancel"
          onClick={() => history.back()}
        >
          ביטול
        </Button>
      </div>
      <HVSection />
    </form>
  );
}
