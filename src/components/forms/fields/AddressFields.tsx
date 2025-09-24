import { useEffect, useMemo, useRef, useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { useToast } from "@/components/feedback/toastContext";
import { getILStreets } from "@/features/cards/services/addressService";

type AddressErrors = {
  address?: {
    country?: { message?: string };
    city?: { message?: string };
    state?: { message?: string };
    street?: { message?: string };
    houseNumber?: { message?: string };
    zip?: { message?: string };
  };
};

const isIsrael = (v: string | undefined) => {
  if (!v) return false;
  const s = v.trim().toLowerCase();
  return s === "ישראל";
};

export default function AddressFields() {
  const { register, formState, watch } = useFormContext();
  const e = formState.errors as unknown as AddressErrors;
  const { error: toastError } = useToast();

  const country = watch("address.country") as string | undefined;
  const city = watch("address.city") as string | undefined;
  const streetQ = watch("address.street") as string | undefined;

  const [loadingIL, setLoadingIL] = useState(false);
  const [streetsIL, setStreetsIL] = useState<string[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  // Fetch IL streets when: country=IL & city>=2 chars (debounced)
  useEffect(() => {
    if (!isIsrael(country) || !city || city.trim().length < 2) {
      setStreetsIL([]);
      abortRef.current?.abort();
      return;
    }
    const ac = new AbortController();
    abortRef.current?.abort();
    abortRef.current = ac;

    const t = setTimeout(async () => {
      try {
        setLoadingIL(true);
        const list = await getILStreets(city.trim(), ac.signal);
        setStreetsIL(list);
      } catch (err) {
        if ((err as { name?: string }).name !== "AbortError") {
          toastError("טעינת רשימת הרחובות נכשלה");
        }
      } finally {
        setLoadingIL(false);
      }
    }, 300); // debounce

    return () => {
      clearTimeout(t);
      ac.abort();
    };
  }, [country, city, toastError]);

  const filteredStreets = useMemo(() => {
    const q = (streetQ || "").trim();
    if (!q) return streetsIL;
    const needle = q.toLowerCase();
    return streetsIL.filter((n) => n.toLowerCase().includes(needle));
  }, [streetsIL, streetQ]);

  const countryMsg = e.address?.country?.message;
  const cityMsg = e.address?.city?.message;
  const stateMsg = e.address?.state?.message;
  const streetMsg = e.address?.street?.message;
  const houseNumberMsg = e.address?.houseNumber?.message;
  const zipMsg = e.address?.zip?.message;

  return (
    <fieldset className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="u-label" htmlFor="country">
          מדינה *
        </label>
        <input
          id="country"
          className="u-input"
          autoComplete="country-name"
          {...register("address.country")}
          aria-invalid={countryMsg ? true : undefined}
          aria-describedby={countryMsg ? "signup-country-error" : undefined}
        />
        {countryMsg && (
          <p
            id="signup-country-error"
            role="alert"
            className="text-red-600 text-xs mt-1"
          >
            {countryMsg}
          </p>
        )}
      </div>

      <div>
        <label className="u-label" htmlFor="city">
          עיר *
        </label>
        <input
          id="city"
          className="u-input"
          autoComplete="address-level2"
          {...register("address.city")}
          aria-invalid={cityMsg ? true : undefined}
          aria-describedby={cityMsg ? "signup-city-error" : undefined}
        />
        {cityMsg && (
          <p
            id="signup-city-error"
            role="alert"
            className="text-red-600 text-xs mt-1"
          >
            {cityMsg}
          </p>
        )}
        {/* helper when IL mode */}
        {isIsrael(country) && city && city.trim().length >= 2 && (
          <p className="mt-1 text-[11px] text-muted-500">
            {loadingIL ? "מחפש רחובות…" : ""}
            {!streetsIL.length ? "לא נמצאו תוצאות לעיר — נסו שם מדויק" : ""}
          </p>
        )}
      </div>

      <div>
        <label className="u-label" htmlFor="state">
          מחוז/אזור
        </label>
        <Controller
          name="address.state"
          render={({ field, fieldState }) => (
            <input
              id="state"
              className="u-input"
              autoComplete="address-level1"
              dir="ltr"
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={field.onBlur}
              aria-invalid={fieldState.error ? true : undefined}
              aria-describedby={
                fieldState.error ? "signup-state-error" : undefined
              }
            />
          )}
        />
        {stateMsg && (
          <p
            id="signup-state-error"
            role="alert"
            className="text-red-600 text-xs mt-1"
          >
            {stateMsg}
          </p>
        )}
      </div>

      <div className="md:col-span-1">
        <label className="u-label" htmlFor="street">
          רחוב *
        </label>
        {/* Israel-mode: show datalist suggestions filtered by typed text */}
        <input
          id="street"
          placeholder={
            isIsrael(country) && filteredStreets.length
              ? filteredStreets[0]
              : undefined
          }
          className="u-input"
          // autoComplete="address-line1"
          list={
            isIsrael(country) && streetsIL.length ? "il-streets" : undefined
          }
          {...register("address.street")}
          aria-invalid={streetMsg ? true : undefined}
          aria-describedby={streetMsg ? "signup-street-error" : undefined}
        />
        {streetMsg && (
          <p
            id="signup-street-error"
            role="alert"
            className="text-red-600 text-xs mt-1"
          >
            {streetMsg}
          </p>
        )}
        {isIsrael(country) && streetsIL.length > 0 && (
          <datalist id="il-streets">
            {filteredStreets.slice(0, 200).map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
        )}
      </div>

      <div>
        <label className="u-label" htmlFor="houseNumber">
          מספר בית *
        </label>
        <input
          id="houseNumber"
          type="number"
          className="u-input"
          autoComplete="address-line2"
          {...register("address.houseNumber", { valueAsNumber: true })}
        />
        {houseNumberMsg && (
          <p
            id="signup-houseNumber-error"
            role="alert"
            className="text-red-600 text-xs mt-1"
          >
            {houseNumberMsg}
          </p>
        )}
      </div>

      <div>
        <label className="u-label" htmlFor="zip">
          מיקוד
        </label>
        <input
          id="zip"
          type="text"
          inputMode="numeric"
          pattern="^\u005c\d{2,}$"
          dir="ltr"
          className="u-input"
          autoComplete="postal-code"
          {...register("address.zip")}
        />
        {zipMsg && (
          <p
            id="signup-zip-error"
            role="alert"
            className="text-red-600 text-xs mt-1"
          >
            {zipMsg}
          </p>
        )}
      </div>
    </fieldset>
  );
}
