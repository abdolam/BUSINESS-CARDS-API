import { useFormContext } from "react-hook-form";

type SignUpNameErrors = {
  name?: {
    first?: { message?: string };
    middle?: { message?: string };
    last?: { message?: string };
  };
};

type Props = {
  showFirst?: boolean;
  showMiddle?: boolean;
  showLast?: boolean;
  className?: string;
};

export default function NameFields({
  showFirst = true,
  showMiddle = true,
  showLast = true,
  className,
}: Props) {
  const { register, formState } = useFormContext();
  const e = formState.errors as unknown as SignUpNameErrors;
  const firstMsg = e.name?.first?.message;
  const middleMsg = e.name?.middle?.message;
  const lastMsg = e.name?.last?.message;

  return (
    <fieldset className={className}>
      {showFirst && (
        <div>
          <label className="u-label" htmlFor="first">
            שם פרטי *
          </label>
          <input
            id="first"
            className="u-input"
            autoComplete="given-name"
            {...register("name.first")}
            aria-invalid={firstMsg ? true : undefined}
            aria-describedby={firstMsg ? "signup-first-error" : undefined}
          />
          {firstMsg && (
            <p id="signup-first-error" className="text-red-600 text-xs mt-1">
              {firstMsg}
            </p>
          )}
        </div>
      )}

      {showMiddle && (
        <div>
          <label className="u-label" htmlFor="middle">
            שם אמצעי
          </label>
          <input
            id="middle"
            className="u-input"
            {...register("name.middle")}
            autoComplete="additional-name"
            aria-invalid={middleMsg ? true : undefined}
            aria-describedby={middleMsg ? "signup-middle-error" : undefined}
          />
          {middleMsg && (
            <p id="signup-middle-error" className="text-red-600 text-xs mt-1">
              {middleMsg}
            </p>
          )}
        </div>
      )}
      {showLast && (
        <div>
          <label className="u-label" htmlFor="last">
            שם משפחה *
          </label>
          <input
            id="last"
            className="u-input"
            autoComplete="family-name"
            {...register("name.last")}
            aria-invalid={lastMsg ? true : undefined}
            aria-describedby={lastMsg ? "signup-last-error" : undefined}
          />
          {lastMsg && (
            <p id="signup-last-error" className="text-red-600 text-xs mt-1">
              {lastMsg}
            </p>
          )}
        </div>
      )}
    </fieldset>
  );
}
