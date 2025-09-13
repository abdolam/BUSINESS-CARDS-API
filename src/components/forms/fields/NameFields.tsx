import { useFormContext } from "react-hook-form";

type SignUpNameErrors = {
  name?: {
    first?: { message?: string };
    middle?: { message?: string };
    last?: { message?: string };
  };
};

export default function NameFields() {
  const { register, formState } = useFormContext();
  const e = formState.errors as unknown as SignUpNameErrors;

  const firstMsg = e.name?.first?.message;
  const middleMsg = e.name?.middle?.message;
  const lastMsg = e.name?.last?.message;

  return (
    <fieldset className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
    </fieldset>
  );
}
