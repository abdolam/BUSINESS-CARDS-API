import { useFormContext } from "react-hook-form";

type ImageErrors = {
  image?: {
    url?: { message?: string };
    alt?: { message?: string };
  };
};

export default function ImageFields() {
  const { register, formState } = useFormContext();
  const e = formState.errors as unknown as ImageErrors;

  const urlMsg = e.image?.url?.message;
  const altMsg = e.image?.alt?.message;

  return (
    <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="u-label" htmlFor="imageUrl">
          תמונת פרופיל (URL)
        </label>
        <input
          id="imageUrl"
          className="u-input"
          dir="ltr"
          inputMode="url"
          autoComplete="url"
          {...register("image.url")}
          aria-invalid={urlMsg ? true : undefined}
          aria-describedby={urlMsg ? "signup-image-url-error" : undefined}
        />
        {urlMsg && (
          <p
            id="signup-image-url-error"
            role="alert"
            className="text-red-600 text-xs mt-1"
          >
            {urlMsg}
          </p>
        )}
      </div>

      <div>
        <label className="u-label" htmlFor="imageAlt">
          תיאור תמונה
        </label>
        <input
          id="imageAlt"
          className="u-input"
          autoComplete="url"
          {...register("image.alt")}
          aria-invalid={altMsg ? true : undefined}
          aria-describedby={altMsg ? "signup-image-alt-error" : undefined}
        />
        {altMsg && (
          <p
            id="signup-image-alt-error"
            role="alert"
            className="text-red-600 text-xs mt-1"
          >
            {altMsg}
          </p>
        )}
      </div>
    </fieldset>
  );
}
