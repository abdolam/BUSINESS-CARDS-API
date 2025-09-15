import { useFormContext } from "react-hook-form";

type Props = { showEmail?: boolean; showPhone?: boolean; className?: string };

export default function ContactFields({
  showEmail = true,
  showPhone = true,
  className,
}: Props) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className={className}>
      {showPhone && (
        <div>
          <label className="u-label" htmlFor="phone">
            טלפון *
          </label>
          <input
            id="phone"
            className="u-input"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            dir="ltr"
            pattern="^0\\d{1,2}-?\\d{7}$"
            {...register("phone")}
            aria-invalid={errors?.phone ? true : undefined}
            aria-describedby={errors?.phone ? "signup-phone-error" : undefined}
          />
          {errors?.phone && (
            <p
              id="signup-phone-error"
              role="alert"
              className="text-red-600 text-xs mt-1"
            >
              {String(errors.phone.message)}
            </p>
          )}
        </div>
      )}

      {showEmail && (
        <div>
          <label className="u-label" htmlFor="email">
            דוא"ל *
          </label>
          <input
            id="email"
            type="email"
            className="u-input"
            dir="ltr"
            autoComplete="email"
            inputMode="email"
            {...register("email")}
            aria-invalid={errors?.email ? true : undefined}
            aria-describedby={errors?.email ? "signup-email-error" : undefined}
          />
          {errors?.email && (
            <p
              id="signup-email-error"
              role="alert"
              className="text-red-600 text-xs mt-1"
            >
              {String(errors.email.message)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
