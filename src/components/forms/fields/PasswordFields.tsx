import { useCallback } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { usePasswordToggle } from "@/features/users/hooks/usePasswordToggle";

export default function PasswordFields() {
  const {
    register,
    trigger,
    formState: { errors },
    control,
  } = useFormContext();

  const { shown: showPwd, toggle: togglePwd } = usePasswordToggle(false);
  const { shown: showCpw, toggle: toggleCpw } = usePasswordToggle(false);

  const pw = useWatch({ control, name: "password" });
  const cpw = useWatch({ control, name: "confirmPassword" });
  const match = cpw ? pw === cpw : undefined;

  const cpwReg = register("confirmPassword");
  const triggerConfirm = useCallback(
    () => void trigger("confirmPassword"),
    [trigger]
  );

  return (
    <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="u-label" htmlFor="password">
          סיסמה *
        </label>
        <div className="relative">
          <input
            id="password"
            autoComplete="new-password"
            type={showPwd ? "text" : "password"}
            dir="ltr"
            className="u-input pl-10 peer"
            {...register("password")}
            aria-invalid={errors?.password ? true : undefined}
            aria-describedby={
              errors?.password ? "signup-password-error" : undefined
            }
          />
          <button
            type="button"
            onClick={togglePwd}
            aria-label={showPwd ? "הסתר סיסמה" : "הצג סיסמה"}
            aria-pressed={showPwd}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-slate-300 peer-focus:text-blue-600"
          >
            {showPwd ? (
              <EyeOff className="w-5 h-5" aria-hidden />
            ) : (
              <Eye className="w-5 h-5" aria-hidden />
            )}
          </button>
        </div>

        {errors?.password && (
          <p
            id="signup-password-error"
            role="alert"
            className="text-red-600 text-xs mt-1"
          >
            {String(errors.password.message)}
          </p>
        )}
        <p className="text-xs mt-1 text-gray-500">
          לפחות 8 תווים, אות גדולה/קטנה, ספרה ותו מיוחד.
        </p>
      </div>

      <div>
        <label className="u-label" htmlFor="confirmPassword">
          אימות סיסמה *
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            autoComplete="new-password"
            type={showCpw ? "text" : "password"}
            dir="ltr"
            className="u-input pl-10 peer"
            {...cpwReg}
            onChange={(e) => {
              cpwReg.onChange(e);
              triggerConfirm();
            }}
            aria-invalid={errors?.confirmPassword ? true : undefined}
            aria-describedby={
              errors?.confirmPassword ? "signup-cpw-error" : undefined
            }
          />
          <button
            type="button"
            onClick={toggleCpw}
            aria-label={showCpw ? "הסתר סיסמה" : "הצג סיסמה"}
            aria-pressed={showCpw}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-slate-300 peer-focus:text-blue-600"
          >
            {showCpw ? (
              <EyeOff className="w-5 h-5" aria-hidden />
            ) : (
              <Eye className="w-5 h-5" aria-hidden />
            )}
          </button>
        </div>

        {errors?.confirmPassword && (
          <p
            id="signup-cpw-error"
            role="alert"
            className="text-red-600 text-xs mt-1"
          >
            {String(errors.confirmPassword.message)}
          </p>
        )}
        {typeof match !== "undefined" && !errors?.confirmPassword && (
          <p
            className={`text-xs mt-1 ${
              match ? "text-emerald-600" : "text-rose-600"
            }`}
            aria-live="polite"
          >
            {match ? "הסיסמאות תואמות" : "הסיסמאות אינן תואמות"}
          </p>
        )}
      </div>
    </fieldset>
  );
}
