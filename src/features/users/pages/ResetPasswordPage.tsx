import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import { resetPasswordSchema } from "../../users/validators/userSchemas";
import {
  validateResetToken,
  performPasswordReset,
} from "../../users/services/passwordResetService";
import Main from "@/components/layout/Main";
import { useSearchParams, useNavigate } from "react-router-dom";
import Button from "@/components/common/Button";
import { useToast, DEFAULT_DURATION } from "@/components/feedback/toastContext";
import { useEffect, useState } from "react";
import LinkButton from "@/components/common/LinkButton";

type FormValues = { password: string; confirmPassword: string };

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: joiResolver(resetPasswordSchema),
  });
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [valid, setValid] = useState<boolean | null>(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!token) {
        setValid(false);
        return;
      }
      const res = await validateResetToken(token);
      if (mounted) {
        setValid(res.valid);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [token]);

  if (valid === null) {
    return (
      <Main>
        <div className="max-w-md mx-auto text-center" dir="rtl">
          <p>טוען…</p>
        </div>
      </Main>
    );
  }

  if (!valid) {
    return (
      <Main>
        <div className="max-w-md mx-auto text-center" dir="rtl">
          <p className="u-error mb-4">קישור האיפוס אינו תקין או שפג תוקפו.</p>
          <LinkButton to="/forgot-password">בקשת קישור חדש</LinkButton>
        </div>
      </Main>
    );
  }

  const onSubmit = async ({ password }: FormValues) => {
    try {
      await performPasswordReset({ token, password });
      success("הסיסמה אופסה בהצלחה", DEFAULT_DURATION.success);

      navigate("/login", { replace: true });
    } catch {
      error("שגיאה באיפוס הסיסמה");
    }
  };

  return (
    <Main>
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-semibold mb-4">איפוס סיסמה</h1>
        {!token && <p className="u-error mb-3">קישור האיפוס אינו תקין</p>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" dir="rtl">
          <div>
            <label className="block mb-1">סיסמה חדשה</label>
            <input
              className="u-input"
              type="password"
              autoComplete="new-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="u-error">{errors.password.message}</p>
            )}
          </div>
          <div>
            <label className="block mb-1">אישור סיסמה</label>
            <input
              className="u-input"
              type="password"
              autoComplete="new-password"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="u-error">{errors.confirmPassword.message}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="h-10 px-4" disabled={!token}>
              עדכן סיסמה
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-10 px-4"
              onClick={() => navigate(-1)}
            >
              ביטול
            </Button>
          </div>
        </form>
      </div>
    </Main>
  );
}
