import { useEffect, useMemo, useRef, useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { useToast } from "@/components/feedback/toastContext";
import { getILStreets } from "@/services/addressService";
import { getILCities } from "@/services/citiesService";

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
  const [cityOpen, setCityOpen] = useState(false);
  const [cityLoading, setCityLoading] = useState(false);
  const [allCities, setAllCities] = useState<string[]>([]);
  const [cityActiveIdx, setCityActiveIdx] = useState<number>(-1);
  const cityWrapRef = useRef<HTMLDivElement | null>(null);
  const { register, formState, watch, setValue } = useFormContext();
  const e = formState.errors as unknown as AddressErrors;
  const { error: toastError } = useToast();
  const country = watch("address.country") as string | undefined;
  const city = watch("address.city") as string | undefined;
  const streetQ = watch("address.street") as string | undefined;
  const [loadingIL, setLoadingIL] = useState(false);
  const [streetsIL, setStreetsIL] = useState<string[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const [streetOpen, setStreetOpen] = useState(false);
  const [streetActiveIdx, setStreetActiveIdx] = useState<number>(-1);
  const streetWrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!streetWrapRef.current) return;
      if (!streetWrapRef.current.contains(e.target as Node))
        setStreetOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!isIsrael(country)) {
      setAllCities([]);
      setCityOpen(false);
      return;
    }
    (async () => {
      try {
        setCityLoading(true);
        const list = await getILCities();
        if (!cancelled) setAllCities(list);
      } catch {
        toastError("טעינת רשימת הערים נכשלה");
      } finally {
        if (!cancelled) setCityLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [country, toastError]);

  // Filter cities client-side, cap to avoid scrollbars
  const cityQuery = (city || "").trim();
  const cityFiltered = useMemo(() => {
    const q = cityQuery.toLowerCase();
    if (!q) return allCities;
    return allCities.filter((n) => n.toLowerCase().includes(q));
  }, [allCities, cityQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!cityWrapRef.current) return;
      if (!cityWrapRef.current.contains(e.target as Node)) setCityOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

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

      <div ref={cityWrapRef} className="relative">
        <label className="u-label" htmlFor="city">
          עיר *
        </label>
        {(() => {
          const { onChange: rhfCityOnChange, ...cityReg } =
            register("address.city");
          return (
            <input
              id="city"
              className="u-input"
              autoComplete="address-level2"
              {...cityReg}
              aria-invalid={cityMsg ? true : undefined}
              aria-describedby={cityMsg ? "signup-city-error" : undefined}
              onFocus={() => isIsrael(country) && setCityOpen(true)}
              onChange={(e) => {
                rhfCityOnChange(e); // keep RHF state in sync
                setCityOpen(isIsrael(country)); // keep list open in IL mode
                setCityActiveIdx(-1);
              }}
              onKeyDown={(e) => {
                if (!streetOpen || filteredStreets.length === 0) return;
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setStreetActiveIdx((i) => (i + 1) % filteredStreets.length);
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setStreetActiveIdx((i) =>
                    i <= 0 ? filteredStreets.length - 1 : i - 1
                  );
                } else if (e.key === "Enter") {
                  if (streetActiveIdx >= 0) {
                    e.preventDefault();
                    const next = filteredStreets[streetActiveIdx];
                    setValue("address.street", next, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                    setStreetOpen(false);
                  }
                } else if (e.key === "Escape") {
                  setStreetOpen(false);
                }
              }}
              placeholder={
                isIsrael(country) && !cityQuery && cityFiltered.length
                  ? cityFiltered[0]
                  : undefined
              }
            />
          );
        })()}

        {cityMsg && (
          <p
            id="signup-city-error"
            role="alert"
            className="text-red-600 text-xs mt-1"
          >
            {cityMsg}
          </p>
        )}

        {isIsrael(country) && cityOpen && (
          <ul
            role="listbox"
            className="absolute z-50 mt-1 w-full rounded-md border border-muted-200 dark:border-muted-700 bg-white dark:bg-muted-900 shadow-lg
               max-h-64 overflow-y-auto no-scrollbar"
          >
            {cityLoading && (
              <li className="px-3 py-2 text-xs text-muted-500">טוען ערים…</li>
            )}
            {!cityLoading && cityFiltered.length === 0 && (
              <li className="px-3 py-2 text-xs text-muted-500">
                לא נמצאו תוצאות
              </li>
            )}
            {!cityLoading &&
              cityFiltered.map((name, idx) => (
                <li
                  key={name}
                  role="option"
                  aria-selected={idx === cityActiveIdx}
                  onMouseDown={(e) => e.preventDefault()} // avoid input blur
                  onMouseEnter={() => setCityActiveIdx(idx)}
                  onClick={() => {
                    const input = document.getElementById(
                      "city"
                    ) as HTMLInputElement | null;
                    if (input) input.value = name;
                    input?.dispatchEvent(new Event("input", { bubbles: true }));
                    setCityOpen(false);
                  }}
                  className={`px-3 py-2 text-sm cursor-pointer select-none ${
                    idx === cityActiveIdx
                      ? "bg-muted-100 dark:bg-muted-800"
                      : "hover:bg-muted-50 dark:hover:bg-muted-800/50"
                  }`}
                >
                  {name}
                </li>
              ))}
          </ul>
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

      <div ref={streetWrapRef} className="md:col-span-1 relative">
        <label className="u-label" htmlFor="street">
          רחוב *
        </label>
        {(() => {
          const { onChange: rhfStreetOnChange, ...streetReg } =
            register("address.street");
          return (
            <input
              id="street"
              className="u-input"
              placeholder={
                isIsrael(country) && filteredStreets.length
                  ? filteredStreets[0]
                  : undefined
              }
              {...streetReg}
              aria-invalid={streetMsg ? true : undefined}
              aria-describedby={streetMsg ? "signup-street-error" : undefined}
              onFocus={() => isIsrael(country) && setStreetOpen(true)}
              onChange={(e) => {
                rhfStreetOnChange(e); // keep RHF state in sync
                setStreetOpen(isIsrael(country)); // keep list open in IL mode
                setStreetActiveIdx(-1);
              }}
              onKeyDown={(e) => {
                if (!streetOpen || filteredStreets.length === 0) return;
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setStreetActiveIdx(
                    (i) => (i + 1) % Math.min(filteredStreets.length, 8)
                  );
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setStreetActiveIdx((i) =>
                    i <= 0 ? Math.min(filteredStreets.length, 8) - 1 : i - 1
                  );
                } else if (e.key === "Enter") {
                  if (streetActiveIdx >= 0) {
                    e.preventDefault();
                    const next = filteredStreets.slice(0, 8)[streetActiveIdx];
                    setValue("address.street", next, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                    setStreetOpen(false);
                  }
                } else if (e.key === "Escape") {
                  setStreetOpen(false);
                }
              }}
            />
          );
        })()}

        {isIsrael(country) && loadingIL && (
          <p className="text-xs text-muted-500 mt-1">טוען רחובות…</p>
        )}

        {streetMsg && (
          <p
            id="signup-street-error"
            role="alert"
            className="text-red-600 text-xs mt-1"
          >
            {streetMsg}
          </p>
        )}

        {isIsrael(country) && streetOpen && (
          <ul
            role="listbox"
            className="absolute z-50 mt-1 w-full rounded-md border border-muted-200 dark:border-muted-700 bg-white dark:bg-muted-900 shadow-lg
               max-h-64 overflow-y-auto no-scrollbar"
          >
            {filteredStreets.length === 0 ? (
              <li className="px-3 py-2 text-xs text-muted-500">
                לא נמצאו תוצאות
              </li>
            ) : (
              filteredStreets.map((name, idx) => (
                <li
                  key={name}
                  role="option"
                  aria-selected={idx === streetActiveIdx}
                  onMouseDown={(e) => e.preventDefault()} // avoid input blur
                  onMouseEnter={() => setStreetActiveIdx(idx)}
                  onClick={() => {
                    setValue("address.street", name, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                    setStreetOpen(false);
                  }}
                  className={`px-3 py-2 text-sm cursor-pointer select-none ${
                    idx === streetActiveIdx
                      ? "bg-muted-100 dark:bg-muted-800"
                      : "hover:bg-muted-50 dark:hover:bg-muted-800/50"
                  }`}
                >
                  {name}
                </li>
              ))
            )}
          </ul>
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
